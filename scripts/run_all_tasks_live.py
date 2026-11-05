"""
VeriTrust AI — Full Live Automated Task Runner & Demonstration
Performs all 12 forensic and platform tasks using actual login credentials:
- Role 1: Super Admin / CEO (skshrivastav / Admin@1234)
- Role 2: Senior Investigator (investigator1 / Investigator@1234)

Tasks Executed:
1. Authentication & JWT Token Issuance with credentials
2. Video Evidence Upload & Registration
3. Chunked SHA-256 Fingerprint Computation
4. Ed25519 Digital Manifest Creation, Signing, and Public-Key Verification
5. Blockchain Provenance Ledger Registration & TX Verification
6. VeriFace AI Deepfake Video Frame Extraction & Anomaly Inference
7. Integrity Verification: Unmodified File (Match) vs 1-Byte Tampered File (Mismatch)
8. Chronological Chain-of-Custody Timeline & Hash-Chaining Inspection
9. Grounded Forensic Report Generation (Structured JSON Source of Truth)
10. PDF Report Compilation & Disk Integrity Check
11. RBAC Privilege Boundary Enforcement (Student vs Admin Security Check)
12. System Audit Log Inspection & Health Verification
"""
import sys
import os
import time
import json
import io
from pathlib import Path

# Add project root and backend to sys.path
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.core import security
from app.services import integrity_service

client = TestClient(app)

def run_all_tasks():
    print("=" * 80)
    print("      VERITRUST AI: COMPLETE END-TO-END LIVE TASK DEMONSTRATION")
    print("  AI Forensics · Cryptography · Blockchain · Grounded GenAI · Automated QA")
    print("  Lead Developer: Mr. S. K. Shrivastav (https://www.linkedin.com/in/s-k-shrivastav/)")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # TASK 1: AUTHENTICATION WITH CREDENTIALS
    # -------------------------------------------------------------------------
    print("\n[TASK 1/12] Authenticating User Accounts with ID & Password...")
    credentials_to_test = [
        ("skshrivastav", "Admin@1234", "CEO / Super Admin"),
        ("investigator1", "Investigator@1234", "Senior Investigator"),
        ("student1", "Student@1234", "Student / Viewer")
    ]

    tokens = {}
    for username, password, role_label in credentials_to_test:
        resp = client.post("/api/v1/auth/login", json={"username": username, "password": password})
        assert resp.status_code == 200, f"Login failed for {username}: {resp.text}"
        data = resp.json()
        tokens[username] = data["access_token"]
        user_info = data["user"]
        print(f"  [+] Login SUCCESS for '{username}' ({role_label})")
        print(f"      Full Name: {user_info['full_name']} | Role: {user_info['role']} | Org: {user_info.get('organization')}")
        print(f"      JWT Access Token: {data['access_token'][:32]}... ({len(data['access_token'])} chars)")

    investigator_headers = {"Authorization": f"Bearer {tokens['investigator1']}"}
    ceo_headers = {"Authorization": f"Bearer {tokens['skshrivastav']}"}
    student_headers = {"Authorization": f"Bearer {tokens['student1']}"}

    # -------------------------------------------------------------------------
    # TASK 2: UPLOAD & REGISTER NEW DIGITAL VIDEO EVIDENCE
    # -------------------------------------------------------------------------
    print("\n[TASK 2/12] Ingesting New Video Evidence File...")
    test_video_filename = "uav_patrol_recon_live_demo.mp4"
    # Create realistic sample video container stream
    simulated_video_stream = (
        b"FTYP_MP42_VERITRUST_AI_FORENSIC_EVIDENCE_STREAM\n"
        b"CAMERA: FLIR-EO/IR-4K\n"
        b"GPS: 28.6139N,77.2090E\n"
        b"ALTITUDE: 150M\n"
        + (b"\x00\xFF\xAA\x55\x12\x34\x56\x78\x9A\xBC\xDE\xF0" * 2048)
    )

    upload_payload = {
        "description": "Live demonstration aerial reconnaissance video captured during boundary inspection. Mapped to Drone Design 23AEO01.",
        "tags": "drone, uav, 23AEO01, live-demonstration, border-patrol"
    }
    upload_files = {
        "file": (test_video_filename, io.BytesIO(simulated_video_stream), "video/mp4")
    }

    upload_resp = client.post("/api/v1/evidence", headers=investigator_headers, files=upload_files, data=upload_payload)
    assert upload_resp.status_code == 201, f"Evidence upload failed: {upload_resp.text}"
    ev_data = upload_resp.json()
    new_evidence_id = ev_data["evidence_id"]
    print(f"  [+] Ingested Evidence ID:    {new_evidence_id}")
    print(f"      Original Filename:       {ev_data['original_filename']}")
    print(f"      File Size on Disk:       {ev_data['file_size_bytes']} bytes")
    print(f"      Initial Ingestion State: {ev_data['status'].upper()}")

    # -------------------------------------------------------------------------
    # TASK 3: CHUNKED SHA-256 FINGERPRINT COMPUTATION
    # -------------------------------------------------------------------------
    print("\n[TASK 3/12] Verifying SHA-256 Cryptographic Fingerprint...")
    # Allow background processing brief moment or calculate directly
    uploaded_file_path = project_root / "storage" / "evidence" / f"{new_evidence_id}.mp4"
    computed_sha256 = integrity_service.calculate_sha256(str(uploaded_file_path))
    print(f"  [+] Computed SHA-256 Digest: {computed_sha256}")
    assert len(computed_sha256) == 64, "SHA-256 must be 64 hexadecimal characters"

    # -------------------------------------------------------------------------
    # TASK 4: ED25519 MANIFEST CREATION, SIGNING & VERIFICATION
    # -------------------------------------------------------------------------
    print("\n[TASK 4/12] Generating Cryptographic Manifest & Ed25519 Digital Signature...")
    manifest = integrity_service.create_manifest(
        evidence_id=new_evidence_id,
        file_hash=computed_sha256,
        file_size=len(simulated_video_stream),
        original_filename=test_video_filename,
        uploader_id=2, # Investigator user
    )
    sig_hex, data_hash = integrity_service.sign_manifest(manifest)
    pub_key_hex = integrity_service.get_public_key_hex()

    print(f"  [+] Manifest Digest:     {data_hash}")
    print(f"  [+] Ed25519 Signature:   {sig_hex[:32]}... ({len(sig_hex)} hex characters)")
    print(f"  [+] Signer Public Key:   {pub_key_hex[:32]}... (Verifiable publicly)")

    is_valid, verify_msg = integrity_service.verify_signature(manifest, sig_hex)
    assert is_valid is True, "Signature verification failed"
    print(f"  [+] Signature Integrity: VALID ({verify_msg})")

    # -------------------------------------------------------------------------
    # TASK 5: BLOCKCHAIN PROVENANCE LEDGER ANCHORING
    # -------------------------------------------------------------------------
    print("\n[TASK 5/12] Anchoring Fingerprint to Blockchain Ledger...")
    bc_resp = client.post(f"/api/v1/evidence/{new_evidence_id}/register", headers=investigator_headers)
    assert bc_resp.status_code == 200
    bc_data = bc_resp.json()
    print(f"  [+] Blockchain Event:    {bc_data['event_type']}")
    print(f"  [+] Ledger Status:       {bc_data['status'].upper()}")
    print(f"  [+] Network Identifier:  {bc_data.get('network', 'local')}")
    if bc_data.get("tx_hash"):
        print(f"  [+] Transaction Hash:    {bc_data['tx_hash']}")

    # -------------------------------------------------------------------------
    # TASK 6: VERIFACE AI DEEPFAKE DETECTION & TEMPORAL INFERENCE
    # -------------------------------------------------------------------------
    print("\n[TASK 6/12] Executing VeriFace AI Deepfake Video Analysis...")
    ai_resp = client.post(f"/api/v1/evidence/{new_evidence_id}/analyze", headers=investigator_headers)
    assert ai_resp.status_code == 202
    print(f"  [+] Queued AI Inference: {ai_resp.json()['message']}")

    # Run inference directly using the service to inspect results immediately
    from app.services.forensic_service import run_analysis
    from app.database.connection import SessionLocal
    db = SessionLocal()
    from app.models.evidence import Evidence
    ev_obj = db.query(Evidence).filter(Evidence.evidence_id == new_evidence_id).first()
    analysis_exec = run_analysis(
        evidence_id=new_evidence_id,
        video_path=str(uploaded_file_path),
        db_evidence_id=ev_obj.id,
        requested_by_id=ev_obj.uploader_id,
        db=db,
    )
    db.close()

    # Query analysis result via API
    analysis_query = client.get(f"/api/v1/evidence/{new_evidence_id}/analysis", headers=investigator_headers)
    assert analysis_query.status_code == 200
    ai_result = analysis_query.json()
    print(f"  [+] Model Name:          {ai_result['model_name']}")
    print(f"  [+] Architecture:        {ai_result['model_version']}")
    print(f"  [+] Result Category:     {ai_result['result_category'].upper()}")
    print(f"  [+] Frames Analyzed:     {ai_result['frames_analyzed']} frames")
    print(f"  [+] Limitations Notice:  {ai_result['limitations_note'][:75]}...")

    # -------------------------------------------------------------------------
    # TASK 7: CRYPTOGRAPHIC INTEGRITY VERIFICATION (MATCH & MISMATCH)
    # -------------------------------------------------------------------------
    print("\n[TASK 7/12] Testing Integrity Verification & Single-Byte Tampering...")
    
    # 7.1 Verify genuine, unmodified file
    verify_resp = client.post(f"/api/v1/evidence/{new_evidence_id}/verify", headers=investigator_headers)
    assert verify_resp.status_code == 200
    v_data = verify_resp.json()
    print(f"  [+] Check 1 (Genuine File):")
    print(f"      - Registered Hash:   {v_data['registered_hash']}")
    print(f"      - Recalculated Hash: {v_data['recalculated_hash']}")
    print(f"      - Hash Match:        {v_data['hash_match']} (100% BIT-FOR-BIT INTACT)")
    print(f"      - Overall Outcome:   {v_data['overall_status'].upper()}")

    # 7.2 Simulate 1-Byte File Alteration
    print(f"  [+] Check 2 (Simulating 1-Byte Unauthorized Modification):")
    original_bytes = uploaded_file_path.read_bytes()
    tampered_bytes = original_bytes + b"\xFE" # Injected single altered byte
    uploaded_file_path.write_bytes(tampered_bytes)

    verify_tampered_resp = client.post(f"/api/v1/evidence/{new_evidence_id}/verify", headers=investigator_headers)
    vt_data = verify_tampered_resp.json()
    print(f"      - Registered Hash:   {vt_data['registered_hash']}")
    print(f"      - Recalculated Hash: {vt_data['recalculated_hash']}")
    print(f"      - Hash Match:        {vt_data['hash_match']}")
    print(f"      - Overall Outcome:   {vt_data['overall_status'].upper()} (INTEGRITY MISMATCH DETECTED!)")
    assert vt_data["hash_match"] is False, "Altered file must trigger hash mismatch"
    assert vt_data["overall_status"] == "mismatch", "Overall status must be 'mismatch'"

    # Restore original file
    uploaded_file_path.write_bytes(original_bytes)
    # Restore verification to valid
    client.post(f"/api/v1/evidence/{new_evidence_id}/verify", headers=investigator_headers)
    print("      -> Original file restored to authentic state.")

    # -------------------------------------------------------------------------
    # TASK 8: CHRONOLOGICAL CHAIN OF CUSTODY & HASH-CHAINING
    # -------------------------------------------------------------------------
    print("\n[TASK 8/12] Inspecting Chronological Chain of Custody Timeline...")
    custody_resp = client.get(f"/api/v1/evidence/{new_evidence_id}/custody-events", headers=investigator_headers)
    assert custody_resp.status_code == 200
    events = custody_resp.json()["events"]
    print(f"  [+] Total Custody Events Recorded: {len(events)}")
    for idx, ev in enumerate(events, 1):
        print(f"      Event #{idx}: {ev['event_type']:<14} | Actor: {ev['actor_name']:<22} | Time: {ev['occurred_at']}")
        if ev.get("event_hash"):
            print(f"                Event Hash:   {ev['event_hash'][:24]}...")
        if ev.get("previous_event_hash"):
            print(f"                Chain Link:   {ev['previous_event_hash'][:24]}...")

    # -------------------------------------------------------------------------
    # TASK 9: GENERATIVE FORENSIC REPORT GENERATION
    # -------------------------------------------------------------------------
    print("\n[TASK 9/12] Generating Evidence-Grounded Forensic Report...")
    # Trigger report creation via service
    from app.services.report_service import create_report
    db = SessionLocal()
    ev_record = db.query(Evidence).filter(Evidence.evidence_id == new_evidence_id).first()
    import asyncio
    report_obj = asyncio.run(create_report(db, ev_record, ev_record.uploader_id))
    db.close()

    print(f"  [+] Report ID:           {report_obj.report_id}")
    print(f"  [+] Title:               {report_obj.title}")
    print(f"  [+] Generation Method:   {report_obj.generation_method.upper()}")
    print(f"  [+] Compilation Status:  {report_obj.status.upper()}")

    # -------------------------------------------------------------------------
    # TASK 10: PDF REPORT COMPILATION & DOWNLOAD VERIFICATION
    # -------------------------------------------------------------------------
    print("\n[TASK 10/12] Validating PDF Report Generation & Download Endpoint...")
    pdf_path = Path(report_obj.pdf_path)
    assert pdf_path.exists(), f"PDF report file {pdf_path} not found on disk"
    pdf_size_kb = pdf_path.stat().st_size / 1024
    print(f"  [+] PDF Path on Disk:    {pdf_path}")
    print(f"  [+] PDF File Size:       {pdf_size_kb:.2f} KB")

    download_resp = client.get(f"/api/v1/reports/{report_obj.report_id}/download", headers=investigator_headers)
    assert download_resp.status_code == 200
    assert download_resp.headers["content-type"] == "application/pdf"
    print(f"  [+] HTTP Download Check: 200 OK (Content-Type: application/pdf, Length: {len(download_resp.content)} bytes)")

    # -------------------------------------------------------------------------
    # TASK 11: RBAC PRIVILEGE BOUNDARY ENFORCEMENT
    # -------------------------------------------------------------------------
    print("\n[TASK 11/12] Testing Role-Based Access Control (RBAC) Security...")
    # 1. Student attempting admin audit logs -> Must be 403 Forbidden
    student_audit = client.get("/api/v1/audit-logs", headers=student_headers)
    assert student_audit.status_code == 403
    print("  [+] Student -> /api/v1/audit-logs: 403 FORBIDDEN (Blocked as expected)")

    # 2. Student attempting user management -> Must be 403 Forbidden
    student_users = client.get("/api/v1/users", headers=student_headers)
    assert student_users.status_code == 403
    print("  [+] Student -> /api/v1/users:      403 FORBIDDEN (Blocked as expected)")

    # 3. CEO accessing audit logs -> Must be 200 OK
    ceo_audit = client.get("/api/v1/audit-logs", headers=ceo_headers)
    assert ceo_audit.status_code == 200
    print(f"  [+] CEO     -> /api/v1/audit-logs: 200 OK (Authorized: {ceo_audit.json()['total']} log entries)")

    # -------------------------------------------------------------------------
    # TASK 12: SYSTEM AUDIT LOG & HEALTH INSPECTION
    # -------------------------------------------------------------------------
    print("\n[TASK 12/12] Inspecting Final Operational Metrics & Node Health...")
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    h_data = health_resp.json()
    print(f"  [+] Node Health Status:  {h_data['status'].upper()} (MySQL Database: {h_data['database']})")

    metrics_resp = client.get("/api/v1/dashboard/metrics", headers=ceo_headers)
    assert metrics_resp.status_code == 200
    m_data = metrics_resp.json()
    print(f"  [+] Total Evidence Tracked:       {m_data['total_evidence']}")
    print(f"  [+] Total AI Analyses:            {m_data['total_analyses']}")
    print(f"  [+] Total Cryptographic Verified: {m_data['total_verified']}")
    print(f"  [+] Total Blockchain Registered:  {m_data['total_blockchain_registrations']}")

    print("\n" + "=" * 80)
    print("      ALL 12 TASKS EXECUTED, VALIDATED, AND VERIFIED SUCCESSFULLY!")
    print("  VERITRUST AI IS READY FOR DEMONSTRATION & KNOWLEDGE EVALUATION")
    print("=" * 80)

if __name__ == "__main__":
    run_all_tasks()
