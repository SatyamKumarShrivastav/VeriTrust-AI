# VeriTrust AI — REST API Reference (v1)

FastAPI Base URL: `/api/v1`  
Interactive OpenAPI Documentation: `/api/docs`  
ReDoc Documentation: `/api/redoc`

---

## Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Register a new investigator, researcher, or student viewer account.
- **Request:** JSON `{ email, username, full_name, password, organization }`
- **Response:** 201 Created with `UserResponse`

### `POST /api/v1/auth/login`
Authenticate credentials and obtain JWT tokens.
- **Request:** JSON `{ username, password }`
- **Response:** 200 OK `{ access_token, refresh_token, token_type: "bearer", user }`

### `POST /api/v1/auth/logout`
Record audit logout event.

### `GET /api/v1/auth/me`
Return current authenticated user profile. Requires Bearer token.

---

## Evidence Endpoints (`/api/v1/evidence`)

### `POST /api/v1/evidence`
Upload and register a digital video file.
- **Form Data:** `file` (multipart/form-data), `description` (optional), `tags` (optional)
- **Response:** 201 Created with `EvidenceResponse`

### `GET /api/v1/evidence`
Retrieve paginated evidence items with optional status/search filters.

### `GET /api/v1/evidence/{evidence_id}`
Retrieve evidence record metadata. Requires ownership or Admin role.

### `POST /api/v1/evidence/{evidence_id}/analyze`
Trigger asynchronous VeriFace AI deepfake detection.

### `GET /api/v1/evidence/{evidence_id}/analysis`
Retrieve frame-by-frame and aggregate deepfake detection results.

### `POST /api/v1/evidence/{evidence_id}/verify`
Execute real-time cryptographic verification:
- Recalculates SHA-256 chunk hash.
- Compares against registered reference.
- Verifies Ed25519 digital signature of manifest.
- Checks on-chain ledger status.

### `GET /api/v1/evidence/{evidence_id}/integrity`
Retrieve latest cached integrity verification outcome.

### `POST /api/v1/evidence/{evidence_id}/register`
Anchor evidence fingerprint onto the blockchain network.

### `GET /api/v1/evidence/{evidence_id}/blockchain`
Retrieve all on-chain transactions and block confirmations.

### `GET /api/v1/evidence/{evidence_id}/custody-events`
Retrieve chronological chain-of-custody audit history.

### `POST /api/v1/evidence/{evidence_id}/reports`
Trigger structured forensic report compilation.

### `GET /api/v1/evidence/{evidence_id}/reports/latest`
Retrieve latest report text and PDF availability.

---

## System & QA Endpoints

### `GET /api/v1/dashboard/metrics`
Operational statistics, chart distributions, and recent events.

### `GET /api/v1/reports/{report_id}/download`
Download official forensic report in PDF format.

### `GET /api/v1/audit-logs`
Retrieve administrative security audit log trail. (Admin only)

### `GET /api/v1/tests/results`
Retrieve automated software testing suite execution reports.

### `GET /api/v1/health`
System node health check (MySQL, Blockchain, VeriFace AI).

