"""
VeriTrust AI — Unit Tests: Cryptographic Engine
Validates SHA-256 chunk-based file hashing, Ed25519 digital signature generation,
and signature verification resistance against tampering.
"""
import pytest
import tempfile
import json
from pathlib import Path
import sys

backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.services import integrity_service


def test_sha256_consistent_hashing():
    """Verify that identical file bytes always produce deterministic SHA-256 digests."""
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"VERITRUST_AI_TEST_EVIDENCE_STREAM")
        tf_path = tf.name

    try:
        hash1 = integrity_service.calculate_sha256(tf_path)
        hash2 = integrity_service.calculate_sha256(tf_path)
        assert len(hash1) == 64
        assert hash1 == hash2
    finally:
        Path(tf_path).unlink(missing_ok=True)


def test_sha256_tamper_detection():
    """Verify that altering 1 byte in a file produces a completely different digest."""
    with tempfile.NamedTemporaryFile(delete=False) as tf1:
        tf1.write(b"ORIGINAL_EVIDENCE_FRAME_001")
        path1 = tf1.name

    with tempfile.NamedTemporaryFile(delete=False) as tf2:
        tf2.write(b"ORIGINAL_EVIDENCE_FRAME_002")  # 1 byte difference
        path2 = tf2.name

    try:
        hash1 = integrity_service.calculate_sha256(path1)
        hash2 = integrity_service.calculate_sha256(path2)
        assert hash1 != hash2, "Altered file must produce distinct hash"
    finally:
        Path(path1).unlink(missing_ok=True)
        Path(path2).unlink(missing_ok=True)


def test_ed25519_manifest_signing_and_verification():
    """Verify that an Ed25519 digital signature can be generated and successfully verified."""
    manifest = {
        "evidence_id": "EV-2026-UNIT01",
        "hash_algorithm": "SHA-256",
        "file_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "file_size_bytes": 1024,
        "original_filename": "test.mp4",
        "uploader_id": 1,
    }

    sig_hex, data_hash = integrity_service.sign_manifest(manifest)
    assert len(sig_hex) == 128  # 64 bytes in hex
    assert len(data_hash) == 64

    # Verification of genuine manifest
    is_valid, msg = integrity_service.verify_signature(manifest, sig_hex)
    assert is_valid is True
    assert "successfully" in msg


def test_ed25519_tampered_manifest_rejection():
    """Verify that tampering with any field in a signed manifest causes verification failure."""
    manifest = {
        "evidence_id": "EV-2026-UNIT02",
        "file_sha256": "a" * 64,
        "file_size_bytes": 2048,
    }

    sig_hex, _ = integrity_service.sign_manifest(manifest)

    # Tampered copy
    tampered_manifest = manifest.copy()
    tampered_manifest["file_size_bytes"] = 2049  # Modified value

    is_valid, msg = integrity_service.verify_signature(tampered_manifest, sig_hex)
    assert is_valid is False
    assert "failed" in msg.lower()

