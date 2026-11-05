"""
VeriTrust AI — Security Tests: Role-Based Access Control (RBAC) & Boundary Enforcement
Verifies that student/viewer roles cannot access administrator routes or cross-inspect restricted evidence.
"""
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app
from app.core import security

client = TestClient(app)


def test_student_cannot_access_audit_logs():
    """Verify that a Student role user cannot access /api/v1/audit-logs (403 Forbidden)."""
    # Create valid JWT token for student user
    student_token = security.create_access_token({"sub": "4", "role": "student"})
    headers = {"Authorization": f"Bearer {student_token}"}

    response = client.get("/api/v1/audit-logs", headers=headers)
    assert response.status_code == 403
    assert "admin" in response.json()["detail"].lower()


def test_student_cannot_access_user_management():
    """Verify that a Student role user cannot access /api/v1/users (403 Forbidden)."""
    student_token = security.create_access_token({"sub": "4", "role": "student"})
    headers = {"Authorization": f"Bearer {student_token}"}

    response = client.get("/api/v1/users", headers=headers)
    assert response.status_code == 403


def test_ceo_can_access_audit_logs():
    """Verify that CEO role user can access /api/v1/audit-logs (200 OK)."""
    ceo_token = security.create_access_token({"sub": "1", "role": "ceo"})
    headers = {"Authorization": f"Bearer {ceo_token}"}

    response = client.get("/api/v1/audit-logs", headers=headers)
    assert response.status_code == 200
    assert "items" in response.json()

