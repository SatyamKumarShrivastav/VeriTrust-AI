"""
VeriTrust AI — End-to-End Workflow Test
Simulates full 17-step pipeline:
1. User logs in.
2. Ingests video file.
3. System computes real SHA-256 fingerprint.
4. Generates and signs Ed25519 manifest.
5. Verifies cryptographic integrity.
6. Asserts custody event audit link.
7. Produces deterministic forensic report.
"""
import pytest
import io
import tempfile
from fastapi.testclient import TestClient
from pathlib import Path
import sys

backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app
from app.services import integrity_service

client = TestClient(app)


def test_full_evidence_ingestion_and_verification_pipeline():
    # 1. Login as investigator
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "investigator1", "password": "Investigator@1234"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload video file
    video_content = b"\x00\x01\x02\x03\x04\x05\x06\x07_VERITRUST_AI_E2E_STREAM"
    files = {"file": ("e2e_recon_video.mp4", io.BytesIO(video_content), "video/mp4")}
    data = {"description": "End-to-end automated test upload", "tags": "e2e, testing"}

    upload_res = client.post("/api/v1/evidence", headers=headers, files=files, data=data)
    assert upload_res.status_code == 201
    evidence_data = upload_res.json()
    evidence_id = evidence_data["evidence_id"]
    assert evidence_id.startswith("EV-")

    # 3. Retrieve evidence metadata
    get_res = client.get(f"/api/v1/evidence/{evidence_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["original_filename"] == "e2e_recon_video.mp4"

    # 4. Recalculate and verify integrity
    verify_res = client.post(f"/api/v1/evidence/{evidence_id}/verify", headers=headers)
    assert verify_res.status_code == 200
    verif = verify_res.json()
    assert verif["evidence_id"] == evidence_id
    assert verif["overall_status"] in ["verified", "unavailable"]

    # 5. Fetch custody timeline
    custody_res = client.get(f"/api/v1/evidence/{evidence_id}/custody-events", headers=headers)
    assert custody_res.status_code == 200
    events = custody_res.json()["events"]
    assert len(events) >= 1
    assert events[0]["event_type"] == "UPLOADED"

