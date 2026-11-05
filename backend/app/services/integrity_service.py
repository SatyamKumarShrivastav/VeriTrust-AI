"""
VeriTrust AI — Integrity Service
SHA-256 fingerprinting, manifest generation, and digital signature operations.

Security note: Private keys are loaded from files specified by environment variables.
They are never stored in the database, logged, or returned in API responses.
"""
import hashlib
import json
import os
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey, Ed25519PublicKey
)
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature
from app.core.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# SHA-256 File Hashing
# ─────────────────────────────────────────────────────────────

def calculate_sha256(file_path: str) -> str:
    """
    Calculate the SHA-256 fingerprint of a file.
    Reads in 1 MB chunks to handle large video files without memory exhaustion.
    """
    digest = hashlib.sha256()
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Evidence file not found: {file_path}")

    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def calculate_sha256_bytes(data: bytes) -> str:
    """Calculate SHA-256 of raw bytes."""
    return hashlib.sha256(data).hexdigest()


# ─────────────────────────────────────────────────────────────
# Key Management
# ─────────────────────────────────────────────────────────────

def ensure_key_pair() -> Tuple[str, str]:
    """
    Ensure Ed25519 key pair files exist. Generate them if missing.
    Returns (private_key_path, public_key_path).
    Private key is PEM-encoded and stored with restricted permissions.
    """
    keys_dir = Path(settings.KEYS_DIR)
    keys_dir.mkdir(parents=True, exist_ok=True)

    priv_path = Path(settings.SIGNING_KEY_PATH)
    pub_path = Path(settings.VERIFY_KEY_PATH)

    if not priv_path.exists() or not pub_path.exists():
        logger.info("Generating new Ed25519 key pair for evidence signing.")
        private_key = Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        # Serialize private key (no encryption for local dev; use encrypted PEM in production)
        priv_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        pub_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        priv_path.write_bytes(priv_pem)
        pub_path.write_bytes(pub_pem)

        # Attempt to restrict private key permissions (best-effort on Windows)
        try:
            os.chmod(str(priv_path), 0o600)
        except Exception:
            pass

        logger.info(f"Key pair written: {priv_path}, {pub_path}")

    return str(priv_path), str(pub_path)


def _load_private_key() -> Ed25519PrivateKey:
    priv_path, _ = ensure_key_pair()
    with open(priv_path, "rb") as f:
        return serialization.load_pem_private_key(f.read(), password=None)


def _load_public_key() -> Ed25519PublicKey:
    _, pub_path = ensure_key_pair()
    with open(pub_path, "rb") as f:
        return serialization.load_pem_public_key(f.read())


def get_public_key_hex() -> str:
    """Return the public key as a hex string (safe to expose)."""
    pub_key = _load_public_key()
    raw = pub_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return raw.hex()


# ─────────────────────────────────────────────────────────────
# Manifest Creation and Signing
# ─────────────────────────────────────────────────────────────

def create_manifest(
    evidence_id: str,
    file_hash: str,
    file_size: int,
    original_filename: str,
    uploader_id: int,
    manifest_version: int = 1,
) -> dict:
    """Create a structured JSON manifest for an evidence file."""
    return {
        "schema_version": "veritrust-manifest-v1",
        "manifest_version": manifest_version,
        "evidence_id": evidence_id,
        "hash_algorithm": "SHA-256",
        "file_sha256": file_hash,
        "file_size_bytes": file_size,
        "original_filename": original_filename,
        "uploader_id": uploader_id,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
    }


def sign_manifest(manifest: dict) -> Tuple[str, str]:
    """
    Sign the JSON manifest using Ed25519.
    Returns (signature_hex, signed_data_hash).
    The private key is loaded from the configured key file; never logged or returned.
    """
    private_key = _load_private_key()

    # Canonical JSON representation for signing
    manifest_bytes = json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode("utf-8")
    signature = private_key.sign(manifest_bytes)
    signature_hex = signature.hex()
    signed_data_hash = calculate_sha256_bytes(manifest_bytes)

    return signature_hex, signed_data_hash


def verify_signature(manifest: dict, signature_hex: str) -> Tuple[bool, str]:
    """
    Verify an Ed25519 signature against a manifest.
    Returns (is_valid, detail_message).
    """
    try:
        public_key = _load_public_key()
        manifest_bytes = json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode("utf-8")
        signature = bytes.fromhex(signature_hex)
        public_key.verify(signature, manifest_bytes)
        return True, "Signature verified successfully."
    except InvalidSignature:
        return False, "Signature verification failed: signature does not match."
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False, f"Signature verification error: {str(e)}"


# ─────────────────────────────────────────────────────────────
# File Validation
# ─────────────────────────────────────────────────────────────

def validate_file_extension(filename: str) -> bool:
    """Check that the uploaded file has an allowed extension."""
    ext = Path(filename).suffix.lstrip(".").lower()
    return ext in settings.ALLOWED_EXT_LIST


def validate_file_size(size_bytes: int) -> bool:
    """Check that the file does not exceed the configured maximum."""
    return size_bytes <= settings.MAX_UPLOAD_BYTES

