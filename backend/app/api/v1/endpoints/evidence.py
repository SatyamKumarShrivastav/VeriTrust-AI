"""
VeriTrust AI — Evidence Endpoints
Full CRUD + analysis + verification + blockchain + custody + reporting
"""
import logging
import math
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user, INVESTIGATOR_ROLES, ADMIN_ROLES
from app.database.connection import get_db
from app.models.evidence import Evidence, EvidenceStatus
from app.models.analysis import AnalysisResult
from app.models.integrity import IntegrityVerification
from app.models.custody import CustodyEvent
from app.models.report import Report
from app.schemas.evidence import (
    EvidenceResponse, EvidenceListResponse, EvidenceUpdate,
    IntegrityVerificationResponse, ManifestSignResponse,
    AnalysisResultResponse, BlockchainRegistrationResponse,
    CustodyEventResponse, ReportResponse,
)
from app.services import evidence_service, integrity_service, ledger_service
from app.services.forensic_service import run_analysis
from app.services.report_service import create_report
from app.core.config import settings

router = APIRouter(prefix="/evidence", tags=["Evidence"])
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# MODULE B — Evidence Upload and Management
# ─────────────────────────────────────────────────────────────

@router.post("", response_model=EvidenceResponse, status_code=201)
async def upload_evidence(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload a new evidence file. Generates SHA-256, manifest, signature, and blockchain record."""
    # Validate extension
    if not integrity_service.validate_file_extension(file.filename or ""):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Validate size (read Content-Length header or check after save)
    evidence_id = evidence_service.generate_evidence_id()
    full_path, rel_path = evidence_service.get_storage_path(evidence_id, file.filename or "unknown.mp4")

    # Save file to disk
    file_size = await evidence_service.save_uploaded_file(file, full_path)

    if not integrity_service.validate_file_size(file_size):
        full_path.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.")

    # Create evidence record
    evidence = evidence_service.create_evidence_record(
        db=db,
        evidence_id=evidence_id,
        uploader_id=current_user.id,
        original_filename=file.filename or "unknown",
        stored_filename=full_path.name,
        file_path=rel_path,
        file_size=file_size,
        mime_type=file.content_type,
        description=description,
        tags=tags,
    )

    # Custody event: uploaded
    evidence_service.add_custody_event(
        db, evidence, "UPLOADED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        notes=f"File uploaded: {file.filename}",
    )

    # Background: hash → manifest → sign → blockchain
    background_tasks.add_task(
        _post_upload_processing,
        db_evidence_id=evidence.id,
        evidence_id_str=evidence_id,
        file_path=str(full_path),
        uploader_id=current_user.id,
        uploader_name=current_user.full_name,
        uploader_role=current_user.role,
    )

    return evidence


def _post_upload_processing(
    db_evidence_id: int,
    evidence_id_str: str,
    file_path: str,
    uploader_id: int,
    uploader_name: str,
    uploader_role: str,
):
    """Background task: hash file, sign manifest, register on blockchain."""
    from app.database.connection import SessionLocal
    db = SessionLocal()
    try:
        evidence = db.query(Evidence).filter(Evidence.id == db_evidence_id).first()
        if not evidence:
            return

        # 1. Compute SHA-256
        sha256 = integrity_service.calculate_sha256(file_path)
        evidence = evidence_service.update_evidence_hash(db, evidence, sha256)

        # 2. Create and sign manifest
        manifest = integrity_service.create_manifest(
            evidence_id=evidence_id_str,
            file_hash=sha256,
            file_size=evidence.file_size_bytes,
            original_filename=evidence.original_filename,
            uploader_id=uploader_id,
        )
        signature_hex, signed_data_hash = integrity_service.sign_manifest(manifest)
        pub_key_hex = integrity_service.get_public_key_hex()

        sig = evidence_service.save_digital_signature(
            db, evidence, signature_hex, pub_key_hex, signed_data_hash, uploader_id
        )
        evidence_service.save_manifest(db, evidence, manifest, signature_id=sig.id)

        # 3. Register on blockchain
        bc_tx = ledger_service.register_evidence_on_blockchain(
            db, evidence.id, evidence_id_str, sha256, uploader_id
        )

        # Custody event: registered
        evidence_service.add_custody_event(
            db, evidence, "REGISTERED",
            actor_id=uploader_id,
            actor_name=uploader_name,
            actor_role=uploader_role,
            notes="SHA-256 computed, manifest signed, blockchain registration attempted.",
            file_hash=sha256,
            blockchain_tx_hash=bc_tx.tx_hash,
        )

        evidence.status = EvidenceStatus.REGISTERED
        db.commit()
        logger.info(f"Post-upload processing complete for {evidence_id_str}")

    except Exception as e:
        logger.error(f"Post-upload processing failed for {evidence_id_str}: {e}")
        try:
            evidence = db.query(Evidence).filter(Evidence.id == db_evidence_id).first()
            if evidence:
                evidence.status = EvidenceStatus.FAILED
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.get("", response_model=EvidenceListResponse)
def list_evidence(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    all_evidence: bool = Query(False),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List evidence. Investigators see own evidence; admins can see all."""
    uploader_filter = None
    if not all_evidence or current_user.role not in ADMIN_ROLES:
        uploader_filter = current_user.id

    items, total = evidence_service.get_evidence_list(
        db, uploader_id=uploader_filter, status=status_filter,
        search=search, page=page, page_size=page_size,
    )
    return EvidenceListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve an evidence record. Access control enforced."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    # Access control: own evidence or admin
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    return evidence


@router.delete("/{evidence_id}", status_code=204)
def archive_evidence(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Archive (soft-delete) an evidence record. Admin only."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required.")

    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    evidence.status = EvidenceStatus.ARCHIVED
    evidence_service.add_custody_event(
        db, evidence, "ARCHIVED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        notes="Evidence archived by administrator.",
    )
    db.commit()


# ─────────────────────────────────────────────────────────────
# MODULE C — AI Analysis
# ─────────────────────────────────────────────────────────────

@router.post("/{evidence_id}/analyze", status_code=202)
def trigger_analysis(
    evidence_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Trigger AI deepfake analysis. Runs in background; returns job reference."""
    if current_user.role not in INVESTIGATOR_ROLES:
        raise HTTPException(status_code=403, detail="Investigator role required.")

    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    file_path = str(evidence_service.get_evidence_file_path(evidence))

    background_tasks.add_task(
        run_analysis,
        evidence_id=evidence_id,
        video_path=file_path,
        db_evidence_id=evidence.id,
        requested_by_id=current_user.id,
        db=db,
    )

    evidence.status = EvidenceStatus.ANALYZING
    db.commit()

    return {
        "message": "Analysis job queued.",
        "evidence_id": evidence_id,
        "status": "queued",
    }


@router.get("/{evidence_id}/analysis", response_model=AnalysisResultResponse)
def get_analysis(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve the latest AI analysis result."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    result = db.query(AnalysisResult)\
               .filter(AnalysisResult.evidence_id == evidence.id)\
               .order_by(AnalysisResult.id.desc()).first()

    if not result:
        raise HTTPException(status_code=404, detail="No analysis found for this evidence.")

    # Inject evidence_id string into response
    result_dict = {
        "id": result.id,
        "evidence_id": evidence_id,
        "model_name": result.model_name,
        "model_version": result.model_version,
        "result_category": result.result_category,
        "confidence_score": result.confidence_score,
        "manipulation_probability": result.manipulation_probability,
        "frames_analyzed": result.frames_analyzed,
        "frames_suspicious": result.frames_suspicious,
        "inference_time_seconds": result.inference_time_seconds,
        "status": result.status,
        "error_message": result.error_message,
        "limitations_note": result.limitations_note,
        "created_at": result.created_at,
    }
    return result_dict


# ─────────────────────────────────────────────────────────────
# MODULE D — Cryptographic Verification
# ─────────────────────────────────────────────────────────────

@router.post("/{evidence_id}/verify", response_model=IntegrityVerificationResponse)
def verify_integrity(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Recalculate hash, verify signature, check blockchain. Report each outcome independently."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    file_path = evidence_service.get_evidence_file_path(evidence)

    # Recalculate hash
    try:
        recalculated = integrity_service.calculate_sha256(str(file_path))
        hash_match = recalculated == evidence.sha256_hash
    except FileNotFoundError:
        recalculated = None
        hash_match = None

    # Verify signature
    sig_valid = None
    sig_detail = "No signature found."
    from app.models.blockchain import DigitalSignature
    from app.models.integrity import EvidenceManifest
    import json

    latest_sig = db.query(DigitalSignature)\
                   .filter(DigitalSignature.evidence_id == evidence.id)\
                   .order_by(DigitalSignature.id.desc()).first()
    latest_manifest = db.query(EvidenceManifest)\
                        .filter(EvidenceManifest.evidence_id == evidence.id)\
                        .order_by(EvidenceManifest.id.desc()).first()

    if latest_sig and latest_manifest:
        manifest_dict = json.loads(latest_manifest.manifest_json)
        sig_valid, sig_detail = integrity_service.verify_signature(
            manifest_dict, latest_sig.signature_hex
        )

    # Blockchain check
    bc_verified = None
    bc_detail = "Blockchain not checked."
    from app.models.blockchain import BlockchainTransaction
    latest_bc = db.query(BlockchainTransaction)\
                  .filter(BlockchainTransaction.evidence_id == evidence.id)\
                  .order_by(BlockchainTransaction.id.desc()).first()
    if latest_bc and latest_bc.tx_hash:
        bc_result = ledger_service.verify_on_chain(latest_bc.tx_hash)
        bc_verified = bc_result["status"] == "confirmed"
        bc_detail = bc_result["detail"]
    elif latest_bc:
        bc_detail = latest_bc.status

    # Determine overall status
    if recalculated is None:
        overall = "unavailable"
    elif not hash_match:
        overall = "mismatch"
    elif sig_valid is False:
        overall = "signature_invalid"
    else:
        overall = "verified"

    # Save verification record
    from datetime import datetime, timezone
    verif = IntegrityVerification(
        evidence_id=evidence.id,
        verified_by_id=current_user.id,
        registered_hash=evidence.sha256_hash,
        recalculated_hash=recalculated,
        hash_match=hash_match,
        signature_valid=sig_valid,
        signature_detail=sig_detail,
        blockchain_verified=bc_verified,
        blockchain_detail=bc_detail,
        overall_status=overall,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(verif)

    # Custody event
    evidence_service.add_custody_event(
        db, evidence, "VERIFIED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        notes=f"Integrity verification: {overall}",
        file_hash=recalculated,
    )

    if overall == "verified":
        evidence.status = EvidenceStatus.VERIFIED
    db.commit()

    return IntegrityVerificationResponse(
        evidence_id=evidence_id,
        registered_hash=evidence.sha256_hash,
        recalculated_hash=recalculated,
        hash_match=hash_match,
        signature_valid=sig_valid,
        signature_detail=sig_detail,
        blockchain_verified=bc_verified,
        blockchain_detail=bc_detail,
        overall_status=overall,
        detail=f"Verification completed. Result: {overall}",
        verified_at=datetime.now(timezone.utc),
    )


@router.get("/{evidence_id}/integrity", response_model=IntegrityVerificationResponse)
def get_integrity(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get the latest integrity verification result."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    verif = db.query(IntegrityVerification)\
              .filter(IntegrityVerification.evidence_id == evidence.id)\
              .order_by(IntegrityVerification.id.desc()).first()

    if not verif:
        raise HTTPException(status_code=404, detail="No verification performed yet.")

    return IntegrityVerificationResponse(
        evidence_id=evidence_id,
        registered_hash=verif.registered_hash,
        recalculated_hash=verif.recalculated_hash,
        hash_match=verif.hash_match,
        signature_valid=verif.signature_valid,
        signature_detail=verif.signature_detail,
        blockchain_verified=verif.blockchain_verified,
        blockchain_detail=verif.blockchain_detail,
        overall_status=verif.overall_status,
        detail=verif.detail,
        verified_at=verif.verified_at,
    )


# ─────────────────────────────────────────────────────────────
# MODULE E — Blockchain
# ─────────────────────────────────────────────────────────────

@router.post("/{evidence_id}/register", response_model=BlockchainRegistrationResponse)
def register_blockchain(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Manually trigger blockchain evidence registration."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if not evidence.sha256_hash:
        raise HTTPException(status_code=400, detail="Evidence hash not yet computed.")

    tx = ledger_service.register_evidence_on_blockchain(
        db, evidence.id, evidence_id, evidence.sha256_hash, current_user.id
    )

    evidence_service.add_custody_event(
        db, evidence, "REGISTERED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        notes=f"Blockchain registration attempted. Status: {tx.status}",
        blockchain_tx_hash=tx.tx_hash,
    )
    db.commit()

    return BlockchainRegistrationResponse(
        evidence_id=evidence_id,
        tx_hash=tx.tx_hash,
        block_number=tx.block_number,
        network=tx.network,
        event_type=tx.event_type,
        status=tx.status,
        message=tx.error_message or f"Registration {tx.status}.",
    )


@router.get("/{evidence_id}/blockchain")
def get_blockchain_status(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get blockchain registration status for an evidence item."""
    from app.models.blockchain import BlockchainTransaction
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    txs = db.query(BlockchainTransaction)\
            .filter(BlockchainTransaction.evidence_id == evidence.id)\
            .order_by(BlockchainTransaction.id.desc()).all()

    return {
        "evidence_id": evidence_id,
        "transactions": [
            {
                "id": tx.id,
                "tx_hash": tx.tx_hash,
                "block_number": tx.block_number,
                "event_type": tx.event_type,
                "status": tx.status,
                "network": tx.network,
                "created_at": tx.created_at.isoformat() if tx.created_at else None,
                "confirmed_at": tx.confirmed_at.isoformat() if tx.confirmed_at else None,
                "error_message": tx.error_message,
            }
            for tx in txs
        ],
    }


# ─────────────────────────────────────────────────────────────
# MODULE F — Chain of Custody
# ─────────────────────────────────────────────────────────────

@router.get("/{evidence_id}/custody-events")
def get_custody_events(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return the chronological chain-of-custody for an evidence item."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    events = db.query(CustodyEvent)\
               .filter(CustodyEvent.evidence_id == evidence.id)\
               .order_by(CustodyEvent.occurred_at.asc()).all()

    return {
        "evidence_id": evidence_id,
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "actor_name": e.actor_name,
                "actor_role": e.actor_role,
                "event_hash": e.event_hash,
                "previous_event_hash": e.previous_event_hash,
                "file_hash_at_event": e.file_hash_at_event,
                "signature_valid_at_event": e.signature_valid_at_event,
                "blockchain_tx_hash": e.blockchain_tx_hash,
                "notes": e.notes,
                "occurred_at": e.occurred_at.isoformat(),
            }
            for e in events
        ],
    }


# ─────────────────────────────────────────────────────────────
# MODULE G — Reports
# ─────────────────────────────────────────────────────────────

@router.post("/{evidence_id}/reports", status_code=202)
async def generate_report(
    evidence_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Trigger forensic report generation (async)."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    if evidence.uploader_id != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    async def _generate():
        await create_report(db, evidence, current_user.id)
        evidence_service.add_custody_event(
            db, evidence, "EXPORTED",
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role,
            notes="Forensic report generated.",
        )

    background_tasks.add_task(_generate)
    return {"message": "Report generation queued.", "evidence_id": evidence_id}


@router.get("/{evidence_id}/reports/latest")
def get_latest_report(
    evidence_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get the latest report for an evidence item."""
    evidence = evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    report = db.query(Report)\
               .filter(Report.evidence_id == evidence.id)\
               .order_by(Report.id.desc()).first()
    if not report:
        raise HTTPException(status_code=404, detail="No report found.")

    return {
        "report_id": report.report_id,
        "evidence_id": evidence_id,
        "title": report.title,
        "status": report.status,
        "generation_method": report.generation_method,
        "report_text": report.report_text,
        "pdf_available": bool(report.pdf_path and Path(report.pdf_path).exists()),
        "generated_at": report.generated_at.isoformat() if report.generated_at else None,
    }

