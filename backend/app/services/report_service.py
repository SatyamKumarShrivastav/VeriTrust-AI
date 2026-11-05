"""
VeriTrust AI — Forensic Report Service
Generates evidence-grounded forensic reports using LLM or deterministic template fallback.

Design rule: The LLM may ONLY explain/format verified facts.
It must NOT determine whether evidence passed verification — that is done by the system.
Structured JSON is the source of truth; the LLM is a formatting layer only.
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.models.evidence import Evidence
from app.models.analysis import AnalysisResult
from app.models.integrity import IntegrityVerification, EvidenceManifest
from app.models.blockchain import BlockchainTransaction, DigitalSignature
from app.models.custody import CustodyEvent

logger = logging.getLogger(__name__)


def build_structured_report_data(db: Session, evidence: Evidence) -> Dict[str, Any]:
    """
    Collect and structure all verified evidence data for report generation.
    This is the source of truth — the LLM cannot modify these values.
    """
    # Latest analysis
    analysis = db.query(AnalysisResult)\
                 .filter(AnalysisResult.evidence_id == evidence.id)\
                 .order_by(AnalysisResult.id.desc()).first()

    # Latest integrity verification
    integrity = db.query(IntegrityVerification)\
                  .filter(IntegrityVerification.evidence_id == evidence.id)\
                  .order_by(IntegrityVerification.id.desc()).first()

    # Latest manifest
    manifest = db.query(EvidenceManifest)\
                 .filter(EvidenceManifest.evidence_id == evidence.id)\
                 .order_by(EvidenceManifest.id.desc()).first()

    # Latest digital signature
    signature = db.query(DigitalSignature)\
                  .filter(DigitalSignature.evidence_id == evidence.id)\
                  .order_by(DigitalSignature.id.desc()).first()

    # Latest blockchain transaction
    blockchain_tx = db.query(BlockchainTransaction)\
                      .filter(BlockchainTransaction.evidence_id == evidence.id)\
                      .order_by(BlockchainTransaction.id.desc()).first()

    # Custody events (chronological)
    custody_events = db.query(CustodyEvent)\
                       .filter(CustodyEvent.evidence_id == evidence.id)\
                       .order_by(CustodyEvent.occurred_at.asc()).all()

    return {
        "report_generated_at": datetime.now(timezone.utc).isoformat(),
        "schema_version": "veritrust-report-v1",

        "evidence": {
            "evidence_id": evidence.evidence_id,
            "original_filename": evidence.original_filename,
            "file_size_bytes": evidence.file_size_bytes,
            "mime_type": evidence.mime_type,
            "sha256_hash": evidence.sha256_hash,
            "uploaded_at": evidence.uploaded_at.isoformat() if evidence.uploaded_at else None,
            "registered_at": evidence.registered_at.isoformat() if evidence.registered_at else None,
            "status": evidence.status,
        },

        "ai_analysis": {
            "status": analysis.status if analysis else "not_performed",
            "model_name": analysis.model_name if analysis else None,
            "model_version": analysis.model_version if analysis else None,
            "result_category": analysis.result_category if analysis else None,
            "confidence_score": analysis.confidence_score if analysis else None,
            "manipulation_probability": analysis.manipulation_probability if analysis else None,
            "frames_analyzed": analysis.frames_analyzed if analysis else None,
            "frames_suspicious": analysis.frames_suspicious if analysis else None,
            "inference_time_seconds": analysis.inference_time_seconds if analysis else None,
            "limitations_note": analysis.limitations_note if analysis else None,
            "error_message": analysis.error_message if analysis else None,
        },

        "integrity": {
            "registered_hash": evidence.sha256_hash,
            "recalculated_hash": integrity.recalculated_hash if integrity else None,
            "hash_match": integrity.hash_match if integrity else None,
            "overall_status": integrity.overall_status if integrity else "not_verified",
            "verified_at": integrity.verified_at.isoformat() if integrity and integrity.verified_at else None,
        },

        "digital_signature": {
            "algorithm": signature.algorithm if signature else None,
            "is_valid": signature.is_valid if signature else None,
            "public_key_hex": signature.public_key_hex if signature else None,
            "created_at": signature.created_at.isoformat() if signature and signature.created_at else None,
        },

        "blockchain": {
            "tx_hash": blockchain_tx.tx_hash if blockchain_tx else None,
            "block_number": blockchain_tx.block_number if blockchain_tx else None,
            "network": blockchain_tx.network if blockchain_tx else None,
            "event_type": blockchain_tx.event_type if blockchain_tx else None,
            "status": blockchain_tx.status if blockchain_tx else "not_registered",
            "error_message": blockchain_tx.error_message if blockchain_tx else None,
        },

        "chain_of_custody": [
            {
                "event_type": e.event_type,
                "actor_name": e.actor_name,
                "actor_role": e.actor_role,
                "occurred_at": e.occurred_at.isoformat(),
                "notes": e.notes,
                "blockchain_tx_hash": e.blockchain_tx_hash,
            }
            for e in custody_events
        ],
    }


def generate_template_report(data: Dict[str, Any]) -> str:
    """
    Deterministic template-based report (LLM fallback).
    Returns the full report text. Used when LLM is unavailable.
    """
    ev = data["evidence"]
    ai = data["ai_analysis"]
    integ = data["integrity"]
    sig = data["digital_signature"]
    bc = data["blockchain"]
    custody = data["chain_of_custody"]

    lines = [
        "=" * 70,
        "VERITRUST AI -- FORENSIC EVIDENCE ANALYSIS REPORT",
        "=" * 70,
        f"Generated:          {data['report_generated_at']}",
        f"Schema Version:     {data['schema_version']}",
        "",
        "─" * 70,
        "1. EVIDENCE IDENTIFICATION",
        "─" * 70,
        f"Evidence ID:        {ev['evidence_id']}",
        f"Original Filename:  {ev['original_filename']}",
        f"File Size:          {ev['file_size_bytes']:,} bytes",
        f"MIME Type:          {ev['mime_type'] or 'Unknown'}",
        f"Uploaded At:        {ev['uploaded_at'] or 'Unknown'}",
        f"Registered At:      {ev['registered_at'] or 'Not registered'}",
        f"Evidence Status:    {ev['status']}",
        "",
        "─" * 70,
        "2. CRYPTOGRAPHIC FINGERPRINT",
        "─" * 70,
        f"Algorithm:          SHA-256",
        f"Registered Hash:    {ev['sha256_hash'] or 'Not computed'}",
        f"Recalculated Hash:  {integ['recalculated_hash'] or 'Not verified'}",
        f"Hash Match:         {str(integ['hash_match']) if integ['hash_match'] is not None else 'Not checked'}",
        f"Integrity Status:   {integ['overall_status']}",
        f"Verified At:        {integ['verified_at'] or 'Not performed'}",
        "",
        "IMPORTANT: A matching SHA-256 hash confirms the file has not changed",
        "since registration. It does not prove the original content was truthful.",
        "",
        "─" * 70,
        "3. DIGITAL SIGNATURE",
        "─" * 70,
        f"Algorithm:          {sig['algorithm'] or 'Not signed'}",
        f"Signature Valid:    {str(sig['is_valid']) if sig['is_valid'] is not None else 'Not verified'}",
        f"Public Key:         {(sig['public_key_hex'] or '')[:32]}... (truncated for display)",
        f"Signed At:          {sig['created_at'] or 'Not signed'}",
        "",
        "─" * 70,
        "4. AI DEEPFAKE ANALYSIS",
        "─" * 70,
        f"Model:              {ai['model_name'] or 'Not performed'}",
        f"Model Version:      {ai['model_version'] or 'N/A'}",
        f"Analysis Status:    {ai['status']}",
        f"Result Category:    {ai['result_category'] or 'N/A'}",
        f"Confidence Score:   {ai['confidence_score'] if ai['confidence_score'] is not None else 'N/A'}",
        f"Frames Analyzed:    {ai['frames_analyzed'] or 'N/A'}",
        f"Suspicious Frames:  {ai['frames_suspicious'] or 'N/A'}",
        f"Inference Time:     {ai['inference_time_seconds'] or 'N/A'} seconds",
        "",
        "LIMITATIONS:",
        ai['limitations_note'] or "No limitations recorded.",
        "",
        "IMPORTANT: AI analysis results are assessments, not proof of manipulation or authenticity.",
        "",
        "─" * 70,
        "5. BLOCKCHAIN REGISTRATION",
        "─" * 70,
        f"Status:             {bc['status']}",
        f"Network:            {bc['network'] or 'N/A'}",
        f"Event Type:         {bc['event_type'] or 'N/A'}",
        f"Transaction Hash:   {bc['tx_hash'] or 'Not registered'}",
        f"Block Number:       {bc['block_number'] or 'N/A'}",
        f"Error:              {bc['error_message'] or 'None'}",
        "",
        "─" * 70,
        "6. CHAIN OF CUSTODY",
        "─" * 70,
    ]

    if custody:
        for i, event in enumerate(custody, 1):
            lines.append(f"  [{i}] {event['occurred_at']} | {event['event_type']}")
            lines.append(f"       Actor: {event['actor_name'] or 'System'} ({event['actor_role'] or 'N/A'})")
            if event['notes']:
                lines.append(f"       Notes: {event['notes']}")
            if event['blockchain_tx_hash']:
                lines.append(f"       TX:    {event['blockchain_tx_hash']}")
            lines.append("")
    else:
        lines.append("  No custody events recorded.")
        lines.append("")

    lines += [
        "─" * 70,
        "7. CONCLUSION AND LIMITATIONS",
        "─" * 70,
        "This report documents the results of automated verification checks",
        "performed by VeriTrust AI. It is intended for academic demonstration",
        "and research purposes.",
        "",
        "The following checks were performed:",
        f"  • SHA-256 Integrity: {integ['overall_status']}",
        f"  • Digital Signature: {str(sig['is_valid']) if sig['is_valid'] is not None else 'not verified'}",
        f"  • AI Analysis:       {ai['result_category'] or 'not performed'}",
        f"  • Blockchain:        {bc['status']}",
        "",
        "DISCLAIMER: This report is an academic software demonstration.",
        "It is not a substitute for professional digital forensic examination.",
        "AI-based detection, cryptographic hashing, and blockchain registration",
        "each address different questions and must not be conflated.",
        "Human expert review is required before any forensic conclusions are drawn.",
        "",
        "=" * 70,
        "END OF REPORT -- VeriTrust AI v1.0.0",
        "=" * 70,
    ]

    return "\n".join(lines)


async def generate_llm_report(data: Dict[str, Any]) -> str:
    """
    Generate a report using an LLM provider (if configured).
    The LLM receives ONLY the structured data to explain — it cannot change facts.
    Falls back to template if LLM is unavailable.
    """
    if not settings.LLM_ENABLED or not settings.LLM_API_KEY:
        logger.info("LLM unavailable; using deterministic template report.")
        return generate_template_report(data)

    try:
        import openai
        client = openai.AsyncOpenAI(api_key=settings.LLM_API_KEY)

        system_prompt = (
            "You are a professional forensic report writer for VeriTrust AI. "
            "You will receive structured JSON data containing the results of "
            "automated verification checks. Your task is to write a professional, "
            "readable report that EXPLAINS these results. "
            "CRITICAL RULES: "
            "1. Never invent, change, or omit any verification results. "
            "2. Never claim evidence is authentic or manipulated beyond what the data states. "
            "3. Always include the actual hash values, timestamps, and status codes from the data. "
            "4. Always include the limitations section. "
            "5. Report unavailable services as unavailable — never as successful. "
            "6. This is for academic demonstration — state that clearly."
        )

        user_prompt = (
            f"Generate a professional forensic report based on this verified data:\n\n"
            f"{json.dumps(data, indent=2)}\n\n"
            f"Format the report with clear sections for: "
            f"Evidence Identification, Cryptographic Fingerprint, Digital Signature, "
            f"AI Analysis Results, Blockchain Registration, Chain of Custody, "
            f"and Conclusion with Limitations."
        )

        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=2000,
            temperature=0.1,  # Low temperature for consistent, fact-based output
        )

        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"LLM report generation failed: {e}. Falling back to template.")
        return generate_template_report(data)


def generate_pdf_report(report_text: str, evidence_id: str, report_id: str) -> str:
    """Generate a PDF file from report text using ReportLab. Returns file path."""
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import cm

    output_dir = Path(settings.REPORTS_DIR)
    output_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = output_dir / f"{report_id}.pdf"

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "VeriTrustTitle",
        parent=styles["Title"],
        fontSize=16,
        textColor=colors.HexColor("#1e3a5f"),
        spaceAfter=12,
    )
    normal_style = ParagraphStyle(
        "VeriTrustNormal",
        parent=styles["Normal"],
        fontSize=9,
        leading=14,
    )
    code_style = ParagraphStyle(
        "VeriTrustCode",
        parent=styles["Code"],
        fontSize=8,
        leading=12,
        fontName="Courier",
    )

    story = [
        Paragraph("VeriTrust AI -- Forensic Evidence Report", title_style),
        Paragraph(f"Evidence ID: {evidence_id} | Report ID: {report_id}", normal_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563eb")),
        Spacer(1, 0.3*cm),
    ]

    for line in report_text.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.2*cm))
        elif line.startswith("=") or line.startswith("─"):
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
        elif line.isupper() and len(line) < 80:
            story.append(Paragraph(f"<b>{line}</b>", normal_style))
        else:
            safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(safe_line, normal_style))

    doc.build(story)
    return str(pdf_path)


async def create_report(
    db: Session,
    evidence: Evidence,
    requested_by_id: int,
) -> Report:
    """Full report generation pipeline."""
    report_id = f"RPT-{datetime.now(timezone.utc).year}-{str(uuid.uuid4())[:8].upper()}"

    # Build structured data (source of truth)
    structured_data = build_structured_report_data(db, evidence)

    # Create report record
    report = Report(
        report_id=report_id,
        evidence_id=evidence.id,
        created_by=requested_by_id,
        title=f"Forensic Report — {evidence.evidence_id}",
        report_type="forensic",
        generation_method="llm" if settings.LLM_ENABLED else "template",
        llm_model_used=settings.LLM_MODEL if settings.LLM_ENABLED else None,
        structured_data_json=json.dumps(structured_data),
        status="generating",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    try:
        # Generate report text
        report_text = await generate_llm_report(structured_data)
        report.report_text = report_text

        # Generate PDF
        pdf_path = generate_pdf_report(report_text, evidence.evidence_id, report_id)
        report.pdf_path = pdf_path
        report.status = "completed"

    except Exception as e:
        logger.error(f"Report generation failed for {evidence.evidence_id}: {e}")
        report.status = "failed"
        report.error_message = str(e)

    db.commit()
    db.refresh(report)
    return report

