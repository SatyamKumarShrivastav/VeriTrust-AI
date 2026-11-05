"""
VeriTrust AI — Chain of Custody Model
Immutable chronological audit trail for evidence handling events.
Historical events are never modified; corrections are new events.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class CustodyEvent(Base):
    __tablename__ = "custody_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Event classification
    event_type = Column(String(100), nullable=False)
    # Allowed types: UPLOADED | REGISTERED | ANALYZED | VERIFIED | ACCESSED |
    #                TRANSFERRED | EXPORTED | ARCHIVED | CORRECTION

    # Chain linkage
    previous_event_id = Column(Integer, ForeignKey("custody_events.id"), nullable=True)
    event_hash = Column(String(64), nullable=True)   # SHA-256 of key event data
    previous_event_hash = Column(String(64), nullable=True)

    # Actor info
    actor_name = Column(String(255), nullable=True)
    actor_role = Column(String(100), nullable=True)
    actor_ip = Column(String(50), nullable=True)    # Stored for audit; protect in display

    # Blockchain reference
    blockchain_tx_id = Column(Integer, ForeignKey("blockchain_transactions.id"), nullable=True)
    blockchain_tx_hash = Column(String(255), nullable=True)

    # Integrity snapshot at event time
    file_hash_at_event = Column(String(64), nullable=True)
    signature_valid_at_event = Column(String(50), nullable=True)  # valid|invalid|not_checked

    # Notes
    notes = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)   # Arbitrary event metadata as JSON

    occurred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    evidence = relationship("Evidence", back_populates="custody_events")
    previous_event = relationship("CustodyEvent", remote_side=[id])

