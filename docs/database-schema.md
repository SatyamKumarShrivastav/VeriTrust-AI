# VeriTrust AI — Normalized Database Schema & Entity Relationships

Primary Relational Database: **MySQL 8.0**  
ORM: **SQLAlchemy 2.0**

---

## 1. Tables and Relationships

### `users`
*Stores user accounts, bcrypt hashed credentials, and role authorizations.*
- `id` (INT, Primary Key, Auto-increment)
- `email` (VARCHAR(255), Unique, Not Null, Indexed)
- `username` (VARCHAR(100), Unique, Not Null, Indexed)
- `full_name` (VARCHAR(255), Not Null)
- `hashed_password` (VARCHAR(255), Not Null) — *Bcrypt hash only; plain text never stored*
- `role` (VARCHAR(50), Not Null) — *'ceo' | 'admin' | 'investigator' | 'student'*
- `organization` (VARCHAR(255), Nullable)
- `is_active` (BOOLEAN, Default True)
- `created_at`, `updated_at`, `last_login` (DATETIME)

### `evidence`
*Stores digital evidence metadata and registration fingerprint references.*
- `id` (INT, Primary Key, Auto-increment)
- `evidence_id` (VARCHAR(50), Unique, Not Null, Indexed) — *e.g., EV-2026-UAV01*
- `uploader_id` (INT, Foreign Key -> `users.id`)
- `original_filename` (VARCHAR(500), Not Null)
- `stored_filename` (VARCHAR(500), Not Null)
- `file_path` (VARCHAR(1000), Not Null)
- `file_size_bytes` (BIGINT, Not Null)
- `mime_type` (VARCHAR(100))
- `file_extension` (VARCHAR(20))
- `sha256_hash` (VARCHAR(64), Indexed) — *Computed at initial ingestion*
- `status` (VARCHAR(50)) — *'pending' | 'registered' | 'analyzed' | 'verified' | 'archived'*
- `description` (TEXT), `tags` (VARCHAR(500))
- `uploaded_at`, `registered_at`, `updated_at` (DATETIME)

### `evidence_manifests`
*Cryptographic JSON manifests containing metadata snapshots at registration.*
- `id` (INT, Primary Key)
- `evidence_id` (INT, Foreign Key -> `evidence.id`)
- `manifest_version` (INT, Default 1)
- `algorithm` (VARCHAR(20), Default 'SHA-256')
- `hash_value` (VARCHAR(64), Not Null)
- `file_size_bytes` (INT, Not Null)
- `manifest_json` (LONGTEXT, Not Null)
- `signature_id` (INT, Foreign Key -> `digital_signatures.id`, Nullable)
- `created_at` (DATETIME)

### `digital_signatures`
*Ed25519 asymmetric signatures for non-repudiation.*
- `id` (INT, Primary Key)
- `evidence_id` (INT, Foreign Key -> `evidence.id`)
- `signed_by_id` (INT, Foreign Key -> `users.id`)
- `algorithm` (VARCHAR(50), Default 'Ed25519')
- `signature_hex` (TEXT, Not Null)
- `public_key_hex` (TEXT, Not Null) — *Public key safe to expose; private key never stored*
- `signed_data_hash` (VARCHAR(64), Not Null)
- `is_valid` (BOOLEAN)
- `created_at` (DATETIME)

### `integrity_verifications`
*Log of every dynamic recalculation and verification attempt.*
- `id` (INT, Primary Key)
- `evidence_id` (INT, Foreign Key -> `evidence.id`)
- `verified_by_id` (INT, Foreign Key -> `users.id`)
- `registered_hash` (VARCHAR(64))
- `recalculated_hash` (VARCHAR(64))
- `hash_match` (BOOLEAN)
- `signature_valid` (BOOLEAN)
- `overall_status` (VARCHAR(50)) — *'verified' | 'mismatch' | 'signature_invalid' | 'unavailable'*
- `verified_at` (DATETIME)

### `blockchain_transactions`
*Records on-chain transaction references and status.*
- `id` (INT, Primary Key)
- `evidence_id` (INT, Foreign Key -> `evidence.id`)
- `tx_hash` (VARCHAR(255), Indexed)
- `block_number` (INT)
- `contract_address` (VARCHAR(255))
- `network` (VARCHAR(50))
- `event_type` (VARCHAR(100))
- `status` (VARCHAR(50)) — *'pending' | 'confirmed' | 'failed' | 'unavailable'*
- `created_at`, `confirmed_at` (DATETIME)

### `custody_events`
*Chronological, tamper-evident chain of custody audit ledger.*
- `id` (INT, Primary Key)
- `evidence_id` (INT, Foreign Key -> `evidence.id`)
- `event_type` (VARCHAR(100)) — *'UPLOADED' | 'REGISTERED' | 'ANALYZED' | 'VERIFIED' | etc.*
- `previous_event_id` (INT, Foreign Key -> `custody_events.id`, Nullable)
- `event_hash` (VARCHAR(64)) — *Current event digest*
- `previous_event_hash` (VARCHAR(64)) — *Cryptographic link to prior event*
- `actor_id` (INT, Foreign Key -> `users.id`)
- `actor_name` (VARCHAR(255)), `actor_role` (VARCHAR(100))
- `blockchain_tx_hash` (VARCHAR(255))
- `notes` (TEXT)
- `occurred_at` (DATETIME)

### `analysis_results` & `analysis_frames`
*Stores VeriFace model version, confidence scores, and frame-level anomalies.*

### `reports`
*Forensic reports generated with structured JSON source of truth.*

### `audit_logs` & `test_executions`
*Security audit log and automated test run results.*

