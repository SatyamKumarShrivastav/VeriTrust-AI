"""
VeriTrust AI — Report and Audit Log Models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Report(Base):
    """Forensic report generated for an evidence item."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String(50), unique=True, nullable=False, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(500), nullable=False)
    report_type = Column(String(50), default="forensic")
    generation_method = Column(String(50), nullable=False)  # llm | template
    llm_model_used = Column(String(100), nullable=True)

    # Structured data (source of truth)
    structured_data_json = Column(Text, nullable=False)

    # Generated content
    report_text = Column(Text, nullable=True)
    pdf_path = Column(String(1000), nullable=True)
    json_path = Column(String(1000), nullable=True)

    # Status
    status = Column(String(50), default="generating")  # generating|completed|failed
    error_message = Column(Text, nullable=True)

    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    evidence = relationship("Evidence", back_populates="reports")
    created_by_user = relationship("User", back_populates="reports")


class AuditLog(Base):
    """Application-wide security and access audit log."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    evidence_id = Column(Integer, nullable=True)   # Optional reference

    action = Column(String(200), nullable=False)   # Descriptive action name
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_method = Column(String(10), nullable=True)
    request_path = Column(String(500), nullable=True)
    response_status = Column(Integer, nullable=True)
    success = Column(Boolean, default=True)
    detail = Column(Text, nullable=True)

    occurred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class TestExecution(Base):
    """Records automated test suite executions and results."""
    __tablename__ = "test_executions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(String(50), unique=True, nullable=False)
    test_suite = Column(String(100), nullable=False)   # unit|integration|security|e2e
    trigger = Column(String(100), nullable=True)       # manual|ci|scheduled

    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    failed_tests = Column(Integer, default=0)
    skipped_tests = Column(Integer, default=0)
    coverage_percent = Column(Integer, nullable=True)

    status = Column(String(50), default="running")     # running|passed|failed|error
    report_path = Column(String(1000), nullable=True)
    log_output = Column(Text, nullable=True)
    is_demonstration_data = Column(Boolean, default=False)

    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

