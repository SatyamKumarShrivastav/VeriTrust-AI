"""
VeriTrust AI — Integration Tests: REST API Endpoints
Validates FastAPI routes: health check, registration, login, evidence listing, and report generation.
"""
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify /api/v1/health returns operational status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database" in data


def test_auth_login_successful():
    """Verify /api/v1/auth/login works for seeded CEO account."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "skshrivastav", "password": "Admin@1234"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ceo"
    assert data["user"]["full_name"] == "Mr. S. K. Shrivastav"


def test_auth_login_invalid_credentials():
    """Verify /api/v1/auth/login rejects incorrect passwords with 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "skshrivastav", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_unauthorized_access_blocked():
    """Verify that protected evidence endpoints reject unauthenticated requests with 401."""
    response = client.get("/api/v1/evidence")
    assert response.status_code == 401

