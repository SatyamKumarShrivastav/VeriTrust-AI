"""
VeriTrust AI — AI Analysis Models
Stores deepfake detection results, frame-level analysis, and model metadata.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class AnalysisResult(Base):
    """Top-level AI analysis result for an evidence item."""
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Model information
    model_name = Column(String(200), nullable=False)
    model_version = Column(String(100), nullable=False)
    model_description = Column(Text, nullable=True)

    # Analysis results
    # Result category: potentially_manipulated | no_manipulation_detected | inconclusive | failed | pending
    result_category = Column(String(50), default="pending", nullable=False)
    confidence_score = Column(Float, nullable=True)      # 0.0–1.0 — None if unavailable
    manipulation_probability = Column(Float, nullable=True)
    frames_analyzed = Column(Integer, nullable=True)
    frames_suspicious = Column(Integer, nullable=True)

    # Timing
    inference_time_seconds = Column(Float, nullable=True)
    analysis_started_at = Column(DateTime, nullable=True)
    analysis_completed_at = Column(DateTime, nullable=True)

    # Status
    status = Column(String(50), default="pending")  # pending|running|completed|failed
    error_message = Column(Text, nullable=True)
    limitations_note = Column(Text, nullable=True)

    # Raw output stored as JSON for auditability
    raw_output_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    evidence = relationship("Evidence", back_populates="analysis_results")
    frames = relationship("AnalysisFrame", back_populates="analysis", lazy="dynamic")


class AnalysisFrame(Base):
    """Frame-level analysis detail linked to an AnalysisResult."""
    __tablename__ = "analysis_frames"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id"), nullable=False, index=True)
    frame_index = Column(Integer, nullable=False)
    timestamp_ms = Column(Integer, nullable=True)         # Position in video (ms)
    manipulation_score = Column(Float, nullable=True)      # 0.0–1.0
    is_suspicious = Column(Boolean, default=False)
    face_detected = Column(Boolean, nullable=True)
    thumbnail_path = Column(String(500), nullable=True)   # Stored frame thumbnail

    analysis = relationship("AnalysisResult", back_populates="frames")

