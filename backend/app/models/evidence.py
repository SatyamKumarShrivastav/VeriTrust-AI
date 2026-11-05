"""
VeriTrust AI — Evidence Model
Stores uploaded file metadata, SHA-256 fingerprints, and evidence state.
Original files are stored on disk; this table stores references and metadata only.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database.connection import Base
import enum


class EvidenceStatus(str, enum.Enum):
    PENDING = "pending"
    REGISTERED = "registered"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    VERIFIED = "verified"
    ARCHIVED = "archived"
    FAILED = "failed"


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evidence_id = Column(String(50), unique=True, nullable=False, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # File metadata
    original_filename = Column(String(500), nullable=False)
    stored_filename = Column(String(500), nullable=False)   # UUID-based name on disk
    file_path = Column(String(1000), nullable=False)        # Relative path in storage
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_extension = Column(String(20), nullable=True)
    duration_seconds = Column(Integer, nullable=True)       # For video files
    resolution = Column(String(50), nullable=True)          # e.g. "1920x1080"

    # Cryptographic fingerprint — generated at upload time
    sha256_hash = Column(String(64), nullable=True, index=True)

    # Status and description
    status = Column(String(50), default=EvidenceStatus.PENDING, nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(String(500), nullable=True)   # Comma-separated

    # Timestamps
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    registered_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    uploader = relationship("User", back_populates="evidence_items")
    manifests = relationship("EvidenceManifest", back_populates="evidence", lazy="dynamic")
    analysis_results = relationship("AnalysisResult", back_populates="evidence", lazy="dynamic")
    digital_signatures = relationship("DigitalSignature", back_populates="evidence", lazy="dynamic")
    blockchain_transactions = relationship("BlockchainTransaction", back_populates="evidence", lazy="dynamic")
    custody_events = relationship("CustodyEvent", back_populates="evidence", lazy="dynamic")
    reports = relationship("Report", back_populates="evidence", lazy="dynamic")

    def __repr__(self):
        return f"<Evidence id={self.evidence_id} status={self.status}>"

