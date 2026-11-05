"""
VeriTrust AI — Unit Tests: Security Core
Validates bcrypt password hashing and verification, JWT token creation and decoding,
and role verification requirements.
"""
import pytest
from pathlib import Path
import sys

backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core import security


def test_password_hashing():
    """Verify that bcrypt hashes passwords securely and rejects incorrect plaintext."""
    pwd = "SecUr3P@ssw0rd!2026"
    hashed = security.hash_password(pwd)
    assert hashed != pwd
    assert security.verify_password(pwd, hashed) is True
    assert security.verify_password("WrongPassword123", hashed) is False


def test_jwt_access_token_creation_and_decoding():
    """Verify JWT access tokens encode user claims and decode securely."""
    payload = {"sub": "42", "role": "investigator"}
    token = security.create_access_token(payload)

    decoded = security.decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert decoded["role"] == "investigator"
    assert decoded["type"] == "access"


def test_invalid_jwt_token_handling():
    """Verify that malformed or tampered JWT tokens return None safely without server crashing."""
    bad_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.badpayload.invalid"
    decoded = security.decode_token(bad_token)
    assert decoded is None

