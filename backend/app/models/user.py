"""
VeriTrust AI — User Model
Stores account credentials, roles, and profile information.
Passwords are stored as bcrypt hashes — plaintext passwords are never persisted.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.database.connection import Base
import enum


class UserRole(str, enum.Enum):
    CEO = "ceo"
    ADMIN = "admin"
    INVESTIGATOR = "investigator"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)  # bcrypt hash only
    role = Column(String(50), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    organization = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    evidence_items = relationship("Evidence", back_populates="uploader", lazy="dynamic")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")
    reports = relationship("Report", back_populates="created_by_user", lazy="dynamic")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"

