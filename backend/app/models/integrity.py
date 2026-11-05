"""
VeriTrust AI — Evidence Manifest and Integrity Models
Tracks cryptographic manifests and integrity verification results.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class EvidenceManifest(Base):
    """Cryptographic manifest for an evidence item at registration time."""
    __tablename__ = "evidence_manifests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    manifest_version = Column(Integer, default=1)
    algorithm = Column(String(20), default="SHA-256")
    hash_value = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    original_filename = Column(String(500), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manifest_json = Column(Text, nullable=False)        # Full JSON manifest
    signature_id = Column(Integer, ForeignKey("digital_signatures.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    evidence = relationship("Evidence", back_populates="manifests")


class IntegrityVerification(Base):
    """Records each integrity verification check performed on evidence."""
    __tablename__ = "integrity_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Recalculated vs registered hash
    registered_hash = Column(String(64), nullable=True)
    recalculated_hash = Column(String(64), nullable=True)
    hash_match = Column(Boolean, nullable=True)

    # Signature check
    signature_valid = Column(Boolean, nullable=True)
    signature_detail = Column(String(500), nullable=True)

    # Blockchain check
    blockchain_verified = Column(Boolean, nullable=True)
    blockchain_detail = Column(String(500), nullable=True)

    # Overall outcome
    overall_status = Column(String(50), nullable=False)  # verified|mismatch|signature_invalid|unavailable
    detail = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

