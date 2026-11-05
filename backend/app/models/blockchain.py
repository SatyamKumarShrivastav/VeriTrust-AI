"""
VeriTrust AI — Digital Signature Model
Stores Ed25519 digital signatures for evidence manifests.
Private keys are NEVER stored in the database.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base


class DigitalSignature(Base):
    __tablename__ = "digital_signatures"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    signed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Signature details
    algorithm = Column(String(50), default="Ed25519")
    signature_hex = Column(Text, nullable=False)        # Hex-encoded signature
    public_key_hex = Column(Text, nullable=False)       # Public key (safe to store)
    signed_data_hash = Column(String(64), nullable=False)  # SHA-256 of the signed data
    signed_data_summary = Column(String(500), nullable=True)

    # Verification status
    is_valid = Column(Boolean, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    evidence = relationship("Evidence", back_populates="digital_signatures")


class BlockchainTransaction(Base):
    """Records blockchain transactions for evidence registration and custody events."""
    __tablename__ = "blockchain_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)

    # On-chain references — only hashes and IDs are stored on-chain
    tx_hash = Column(String(255), nullable=True, index=True)
    block_number = Column(Integer, nullable=True)
    block_hash = Column(String(255), nullable=True)
    contract_address = Column(String(255), nullable=True)
    network = Column(String(50), nullable=True)

    # Event type
    event_type = Column(String(100), nullable=False)   # EVIDENCE_REGISTERED | CUSTODY_EVENT
    event_reference = Column(String(255), nullable=True)

    # Status
    status = Column(String(50), default="pending")     # pending|confirmed|failed|unavailable
    gas_used = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    confirmed_at = Column(DateTime, nullable=True)

    # Relationships
    evidence = relationship("Evidence", back_populates="blockchain_transactions")

