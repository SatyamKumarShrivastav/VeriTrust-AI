"""
VeriTrust AI — Evidence Service
Business logic for evidence upload, storage, retrieval, and management.
"""
import uuid
import os
import shutil
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings
from app.models.evidence import Evidence, EvidenceStatus
from app.models.custody import CustodyEvent
from app.models.integrity import EvidenceManifest, IntegrityVerification
from app.models.blockchain import DigitalSignature
from app.services import integrity_service

logger = logging.getLogger(__name__)


def generate_evidence_id() -> str:
    """Generate a unique, human-readable evidence ID: EV-YYYY-NNNNN"""
    year = datetime.now(timezone.utc).year
    unique_part = str(uuid.uuid4()).replace("-", "")[:6].upper()
    return f"EV-{year}-{unique_part}"


def get_storage_path(evidence_id: str, filename: str) -> Tuple[Path, str]:
    """Return the absolute Path and relative path string for storing an evidence file."""
    base = Path(settings.UPLOAD_DIR)
    base.mkdir(parents=True, exist_ok=True)
    ext = Path(filename).suffix
    stored_name = f"{evidence_id}{ext}"
    full_path = base / stored_name
    return full_path, f"evidence/{stored_name}"


async def save_uploaded_file(upload: UploadFile, dest_path: Path) -> int:
    """Write an UploadFile to disk and return bytes written."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    total = 0
    with open(dest_path, "wb") as f:
        while True:
            chunk = await upload.read(1024 * 1024)  # 1 MB chunks
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
    return total


def create_evidence_record(
    db: Session,
    evidence_id: str,
    uploader_id: int,
    original_filename: str,
    stored_filename: str,
    file_path: str,
    file_size: int,
    mime_type: Optional[str],
    description: Optional[str] = None,
    tags: Optional[str] = None,
) -> Evidence:
    """Create and persist a new evidence record."""
    ext = Path(original_filename).suffix.lstrip(".").lower()
    evidence = Evidence(
        evidence_id=evidence_id,
        uploader_id=uploader_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        file_extension=ext,
        description=description,
        tags=tags,
        status=EvidenceStatus.PENDING,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence


def update_evidence_hash(db: Session, evidence: Evidence, sha256_hash: str) -> Evidence:
    """Attach the computed SHA-256 fingerprint and mark as registered."""
    evidence.sha256_hash = sha256_hash
    evidence.status = EvidenceStatus.REGISTERED
    evidence.registered_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(evidence)
    return evidence


def get_evidence_file_path(evidence: Evidence) -> Path:
    """Return the absolute path to the stored evidence file."""
    base = Path(settings.UPLOAD_DIR).parent
    return base / evidence.file_path


def get_evidence_by_id(db: Session, evidence_id: str) -> Optional[Evidence]:
    """Fetch an evidence record by its human-readable ID."""
    return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()


def get_evidence_list(
    db: Session,
    uploader_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Evidence], int]:
    """Fetch paginated evidence list with optional filters."""
    query = db.query(Evidence)

    if uploader_id is not None:
        query = query.filter(Evidence.uploader_id == uploader_id)
    if status:
        query = query.filter(Evidence.status == status)
    if search:
        query = query.filter(
            Evidence.original_filename.ilike(f"%{search}%") |
            Evidence.evidence_id.ilike(f"%{search}%") |
            Evidence.tags.ilike(f"%{search}%")
        )

    total = query.count()
    items = query.order_by(Evidence.uploaded_at.desc()) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()
    return items, total


def add_custody_event(
    db: Session,
    evidence: Evidence,
    event_type: str,
    actor_id: Optional[int] = None,
    actor_name: Optional[str] = None,
    actor_role: Optional[str] = None,
    actor_ip: Optional[str] = None,
    notes: Optional[str] = None,
    file_hash: Optional[str] = None,
    blockchain_tx_hash: Optional[str] = None,
) -> CustodyEvent:
    """Record a new custody event for an evidence item."""
    import json

    # Find previous event for chain linkage
    prev = db.query(CustodyEvent)\
             .filter(CustodyEvent.evidence_id == evidence.id)\
             .order_by(CustodyEvent.id.desc())\
             .first()

    prev_hash = prev.event_hash if prev else None

    # Build event hash from key fields
    event_data = {
        "evidence_id": evidence.evidence_id,
        "event_type": event_type,
        "actor_id": actor_id,
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "previous_event_hash": prev_hash,
    }
    event_hash = integrity_service.calculate_sha256_bytes(
        json.dumps(event_data, sort_keys=True).encode()
    )

    event = CustodyEvent(
        evidence_id=evidence.id,
        actor_id=actor_id,
        event_type=event_type,
        previous_event_id=prev.id if prev else None,
        event_hash=event_hash,
        previous_event_hash=prev_hash,
        actor_name=actor_name,
        actor_role=actor_role,
        actor_ip=actor_ip,
        notes=notes,
        file_hash_at_event=file_hash or evidence.sha256_hash,
        blockchain_tx_hash=blockchain_tx_hash,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def save_manifest(
    db: Session,
    evidence: Evidence,
    manifest: dict,
    signature_id: Optional[int] = None,
) -> EvidenceManifest:
    """Persist an evidence manifest to the database."""
    import json
    record = EvidenceManifest(
        evidence_id=evidence.id,
        hash_value=manifest["file_sha256"],
        file_size_bytes=manifest["file_size_bytes"],
        original_filename=manifest["original_filename"],
        uploader_id=evidence.uploader_id,
        manifest_json=json.dumps(manifest),
        signature_id=signature_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def save_digital_signature(
    db: Session,
    evidence: Evidence,
    signature_hex: str,
    public_key_hex: str,
    signed_data_hash: str,
    signer_id: Optional[int] = None,
) -> DigitalSignature:
    """Persist a digital signature record. Never stores private key."""
    sig = DigitalSignature(
        evidence_id=evidence.id,
        signed_by_id=signer_id,
        algorithm="Ed25519",
        signature_hex=signature_hex,
        public_key_hex=public_key_hex,
        signed_data_hash=signed_data_hash,
        signed_data_summary=f"Evidence manifest for {evidence.evidence_id}",
        is_valid=True,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(sig)
    db.commit()
    db.refresh(sig)
    return sig

