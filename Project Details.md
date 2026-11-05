# VeriTrust AI: Project Details & Technical Dossier

**Full Project Title:**  
VeriTrust AI: An AI-Powered Digital Evidence Integrity, Verification and Security Platform Using Blockchain and Automated Testing  

**Tagline:**  
*Detect the Fake. Verify the Evidence. Preserve the Trust.*  

**Project Lead & Architect:**  
**Mr. S. K. Shrivastav**  
LinkedIn: [https://www.linkedin.com/in/s-k-shrivastav/](https://www.linkedin.com/in/s-k-shrivastav/)  

**Academic Purpose:**  
Semester VII Knowledge Demonstration (KD) · B.Tech in Artificial Intelligence & Data Science  

**Project Classifications & Disciplines:**  
Artificial Intelligence · Digital Forensics · Cryptography & Network Security · Blockchain Technologies · Grounded Generative AI · Software Testing Automation  

---

## 1. Executive Summary & Vision

In contemporary digital forensics, law enforcement, cybersecurity, and journalism, digital media evidence is increasingly contested. Rapid advancements in deepfake algorithms, generative adversarial networks (GANs), and diffusion models enable malicious actors to create hyper-realistic forgeries. Simultaneously, legitimate evidence risks silent data corruption, transmission alteration, or compromised handling histories.

Conventional digital evidence workflows suffer from a fundamental architectural flaw: **fragmentation of verification functions**.
- A deepfake detector calculates a statistical anomaly score, but cannot confirm whether the file remained unaltered during transit.
- A cryptographic hash checks bit-level consistency against a trusted reference, but cannot prove whether the captured scene depicts authentic reality.
- An access database records who touched a file, but typical databases permit silent, retroactive record tampering by administrators.
- A summary tool generates findings, but language models risk hallucinating ungrounded forensic claims.

**VeriTrust AI** resolves this fragmentation by integrating five foundational engineering technologies into a unified, secure, verifiable web platform:
1. **Artificial Intelligence:** Detects synthetic facial artifacts and calculates temporal manipulation suspicion scores across extracted video frames.
2. **Cryptography:** Generates 1MB chunk-streamed SHA-256 fingerprints, structured JSON manifests, and Ed25519 asymmetric digital signatures.
3. **Blockchain:** Maintains an append-only, tamper-evident audit ledger on an Ethereum-compatible network using Solidity smart contracts without storing sensitive raw media on-chain.
4. **Grounded Generative AI:** Synthesizes human-readable forensic reports anchored strictly to verified database facts, featuring deterministic template fallback and automated PDF export.
5. **Software Testing Automation:** Continuously validates application behavior, RBAC privilege isolation, tamper detection, and end-to-end integration across 15+ automated test suites.

---

## 2. The Five Independent Forensic Questions

VeriTrust AI is explicitly engineered to help investigators answer five distinct questions without conflating them:

| # | Forensic Question | System Mechanism | Independent Forensic Meaning |
|---|---|---|---|
| **Q1** | *Does the media exhibit signs of manipulation?* | **VeriFace AI Deepfake Engine** | Evaluates learned visual artifacts, frequency domain gradients, and temporal frame consistency. Outputs a probabilistic assessment with documented uncertainty. |
| **Q2** | *Has the evidence changed since trusted registration?* | **SHA-256 Cryptographic Engine** | Compares dynamic byte-recalculated hash against registered reference. Detects single-bit alterations with overwhelming mathematical probability. |
| **Q3** | *Can the recorded history be independently audited?* | **Blockchain Ledger (Solidity)** | Cryptographic proof that an evidence fingerprint existed at a specific block number and timestamp on an immutable ledger. |
| **Q4** | *Who uploaded, accessed, or transferred the file?* | **Chain of Custody Ledger** | Chronological record linking authorized actors, IP addresses, timestamps, and previous-to-current event hash digests. |
| **Q5** | *Can a report explain verified results without hallucination?* | **Grounded GenAI Reporting** | Uses structured JSON as the strict source of truth; LLM or deterministic fallback formats verified facts without inventing outcomes. |

> **Critical Forensic Principle:**  
> A matching hash never proves that a recording portrays the truth; it establishes file consistency against a registered reference. Likewise, an AI deepfake assessment is a probabilistic finding, not absolute judicial proof. VeriTrust AI maintains strict boundaries between file integrity, provenance, and content authenticity.

---

## 3. Complete System Architecture

VeriTrust AI utilizes a multi-tier, decoupled architecture designed for high throughput, strict security boundaries, and modular extensibility:

```
                                  [ Web Client / Investigator ]
                                                │
                          (React 19 + TypeScript + Vite + Tailwind CSS)
                                                │
                                                ▼  REST API (JSON / Multipart)
                               [ FastAPI Backend Gateway (Python 3.13) ]
                      ┌─────────────────────────┼─────────────────────────┐
                      ▼                         ▼                         ▼
         [ Cryptography Engine ]     [ VeriFace AI Forensics ]   [ Blockchain Ledger ]
         • SHA-256 Chunk Hashing     • OpenCV Keyframe Extract   • Solidity Smart Contract
         • Ed25519 Digital Signing   • Face Detection & Normal   • Hardhat Local Network
         • Dynamic Recalculation     • Temporal Anomaly Scoring  • On-Chain Digest Anchor
                      │                         │                         │
                      └─────────────────────────┼─────────────────────────┘
                                                │
                                                ▼
                                    [ Persistence & Quality ]
                                    • MySQL 8.0 Normalized DB
                                    • Chain of Custody Chaining
                                    • ReportLab PDF Generator
                                    • Pytest Automated QA Suites
```

---

## 4. Detailed Technology Stack

### Frontend Application
- **Library & Language:** React 19, TypeScript, JavaScript ES2023
- **Build System:** Vite 8.x with `@tailwindcss/vite`
- **Styling & Design System:** Tailwind CSS v4 (Custom cybersecurity dark theme)
  - Dark navy (`#090D16`), charcoal (`#0F172A`), deep slate (`#1E293B`)
  - Electric blue (`#3B82F6`) and cyan (`#06B6D4`) operational accents
  - Monospace font styling for hashes, keys, and block addresses
- **Icons & Visuals:** Lucide React
- **Data Visualization & Charts:** Recharts (Pie, Bar, Area charts)
- **Routing & State:** React Router DOM v7, React Context API (`AuthContext`)
- **HTTP Client:** Axios with automatic JWT Bearer token injection and 401 interception

### Backend API Gateway
- **Framework:** FastAPI 0.111.0 (REST architecture)
- **Runtime:** Python 3.13.7
- **ASGI Server:** Uvicorn 0.29.0
- **Data Validation & Schemas:** Pydantic v2 (ConfigDict, strict types, custom validators)
- **Background Processing:** FastAPI `BackgroundTasks` for asynchronous hashing and video frame extraction
- **File Handling:** `python-multipart`, `aiofiles` chunk streaming (1MB buffers)

### Database & Persistence
- **Relational DBMS:** MySQL 8.0 (InnoDB Engine, utf8mb4 collation)
- **ORM:** SQLAlchemy 2.0 with connection pooling (`QueuePool`, `pool_pre_ping=True`)
- **Database Driver:** PyMySQL 1.1.1 & MySQL Connector Python

### Cryptography & Cybersecurity
- **Hashing:** SHA-256 via Python `hashlib` (Chunked reading)
- **Digital Signatures:** Ed25519 asymmetric signatures via `cryptography.hazmat.primitives.asymmetric.ed25519`
- **Key Serialization:** PKCS#8 PEM encoding with restricted filesystem permissions (`0o600`)
- **Password Hashing:** Salted bcrypt hashing via `passlib[bcrypt]` / `bcrypt`
- **Session Tokens:** JSON Web Tokens (JWT) using `python-jose` (HS256 algorithm)

### AI & Media Forensics
- **Video Preprocessing:** OpenCV (`opencv-python-headless` 4.10.0)
- **Face Localization:** OpenCV Haar Cascade frontal face detection
- **Numeric & Tensor Analysis:** NumPy 1.26.0
- **Anomaly Detection:** Spatial Laplacian gradient variance, color channel covariance, temporal anomaly timeline

### Blockchain & Smart Contracts
- **Contract Language:** Solidity 0.8.20 (`EvidenceRegistry.sol`)
- **Contract Platform:** Ethereum Virtual Machine (EVM) compatible
- **Development Tooling:** Hardhat 2.x, Ethers.js
- **Backend Interaction:** Web3.py adapter with graceful fallback to append-only ledger when offline

### Reporting & Documentation
- **PDF Compilation:** ReportLab 5.0 (Custom styles, headers, tables, flowables)
- **LLM Synthesis:** OpenAI / Provider-independent LLM adapter with deterministic template fallback
- **API Documentation:** Interactive Swagger UI (`/api/docs`) and ReDoc (`/api/redoc`)

### Testing & QA Automation
- **Test Runner:** Pytest 8.3.3, `pytest-cov`
- **HTTP Test Client:** Starlette / HTTPX 0.28.1
- **CI/CD Automation:** GitHub Actions matrix workflow

---

## 5. Normalized Database Schema (12 Tables)

The database schema is fully normalized, indexed, and enforces foreign key constraints:

| Table Name | Primary Purpose | Key Fields |
|---|---|---|
| `users` | Accounts, credentials, roles | `id`, `email`, `username`, `full_name`, `hashed_password`, `role`, `organization`, `is_active` |
| `evidence` | Digital media file registry | `id`, `evidence_id`, `uploader_id`, `original_filename`, `stored_filename`, `file_size_bytes`, `sha256_hash`, `status` |
| `evidence_manifests` | Snapshot metadata at registration | `id`, `evidence_id`, `manifest_version`, `hash_value`, `file_size_bytes`, `manifest_json`, `signature_id` |
| `digital_signatures` | Ed25519 non-repudiation signatures | `id`, `evidence_id`, `signed_by_id`, `algorithm`, `signature_hex`, `public_key_hex`, `signed_data_hash`, `is_valid` |
| `integrity_verifications` | Recalculation verification history | `id`, `evidence_id`, `verified_by_id`, `registered_hash`, `recalculated_hash`, `hash_match`, `signature_valid`, `overall_status` |
| `blockchain_transactions`| On-chain anchor records | `id`, `evidence_id`, `tx_hash`, `block_number`, `contract_address`, `network`, `event_type`, `status` |
| `custody_events` | Chronological audit trail | `id`, `evidence_id`, `event_type`, `previous_event_id`, `event_hash`, `previous_event_hash`, `actor_name`, `actor_role` |
| `analysis_results` | Aggregate AI deepfake findings | `id`, `evidence_id`, `requested_by_id`, `model_name`, `model_version`, `result_category`, `confidence_score`, `status` |
| `analysis_frames` | Frame-by-frame anomaly timeline | `id`, `analysis_id`, `frame_index`, `timestamp_ms`, `manipulation_score`, `is_suspicious`, `face_detected` |
| `reports` | Grounded forensic reports | `id`, `report_id`, `evidence_id`, `created_by`, `title`, `generation_method`, `structured_data_json`, `pdf_path` |
| `audit_logs` | Platform security audit trail | `id`, `user_id`, `action`, `resource_type`, `ip_address`, `success`, `detail`, `occurred_at` |
| `test_executions` | Automated QA test run results | `id`, `execution_id`, `test_suite`, `trigger`, `total_tests`, `passed_tests`, `failed_tests`, `coverage_percent` |

---

## 6. The 17-Step End-to-End Workflow

VeriTrust AI implements an end-to-end operational pipeline:

1. **Authentication:** User logs in with credentials; backend validates bcrypt hash and issues scoped JWT access & refresh tokens.
2. **Media Selection:** User selects digital evidence (MP4, AVI, MOV, MKV, WEBM); frontend validates extension and size ($\le 500$ MB).
3. **Secure Ingestion:** Video stream is written to storage using unique server-assigned UUIDs (`EV-YYYY-NNNNN.ext`), preventing path traversal attacks.
4. **Fingerprint Calculation:** Cryptographic engine computes the SHA-256 digest in 1MB chunks without saturating RAM.
5. **Manifest Generation:** Structured JSON manifest is constructed recording evidence ID, file size, timestamp, and SHA-256 digest.
6. **Ed25519 Digital Signing:** Manifest is signed with the platform's private key; the public key is stored for public verification.
7. **Blockchain Anchoring:** Digest and event reference are registered on-chain via `EvidenceRegistry.sol`; TX hash and block number are logged.
8. **Initial Custody Event:** Custody event `#1` (`UPLOADED`) and `#2` (`REGISTERED`) are recorded with cryptographic hash chaining.
9. **Video Preprocessing:** OpenCV extracts keyframes at regular intervals (e.g., every 10th frame) and crops localized faces.
10. **Neural Network Inference:** Frame-level anomaly scores and aggregate video manipulation probabilities are calculated.
11. **Analysis Custody Event:** Custody event `#3` (`ANALYZED`) is appended, recording model version and execution timestamp.
12. **On-Demand Verification:** Investigator clicks "Verify Integrity"; system dynamically recalculates file hash from disk.
13. **Verification Comparison:** Recalculated hash is compared against registered hash; Ed25519 signature is re-verified.
14. **Tamper Detection:** If even 1 byte was altered, system immediately returns `INTEGRITY MISMATCH DETECTED` ($100\%$ detection rate).
15. **Report Synthesis:** Structured data from database is fed into report generator; findings are formatted without hallucinating facts.
16. **PDF Report Export:** Formatted report is compiled into a PDF with ReportLab and made available for authenticated download.
17. **Automated QA Validation:** Automated test suite executes 15 tests, verifying that all system components operate without regression.

---

## 7. The 17 Interactive Frontend Pages

The React 19 frontend provides 17 connected views:

| Page / Route | Core Capabilities |
|---|---|
| **Landing Page (`/`)** | Platform introduction, 5 core questions, 5 technology pillars, lead developer attribution, direct entry links. |
| **Login Page (`/login`)** | Secure login form + **One-Click Demo Credentials Quick-Fill** for instant viva demonstrations. |
| **Register Page (`/register`)** | Account registration with full name, email, organization, and password complexity validation. |
| **Dashboard (`/dashboard`)** | Real-time KPI counters, Recharts deepfake distribution pie chart, recent evidence table, recent custody stream. |
| **Upload Evidence (`/evidence/upload`)** | Drag-and-drop zone, file size/format validation, real-time progress bar, case notes and tagging. |
| **Evidence Library (`/evidence`)** | Search by ID/name/tags, filter by status, pagination, and quick inspection action links. |
| **Evidence Details (`/evidence/:id`)** | Comprehensive metadata, SHA-256 fingerprint viewer, Ed25519 signature details, action triggers. |
| **AI Deepfake Forensics (`/forensics`)** | Target evidence selector, result category badge, temporal frame-by-frame risk bar chart, limitations disclosure. |
| **Crypto Integrity (`/integrity`)** | Dual hash comparison viewer, Ed25519 signature status, and interactive **"Simulate 1-Byte Tamper"** test button. |
| **Blockchain Explorer (`/blockchain`)** | Ledger transaction inspector, transaction hashes, block numbers, gas used, and on-chain verification status. |
| **Chain of Custody (`/custody`)** | Chronological visual timeline displaying actor, timestamp, event notes, current digest, and previous link digest. |
| **Forensic Reports (`/reports`)** | Report list, report text preview, generation trigger, and one-click **Download PDF** button. |
| **Automated Testing QA (`/testing`)** | QA dashboard displaying Unit, Integration, Security, and E2E test suites with pass/fail counts and coverage. |
| **User Management (`/users`)** | Admin/CEO view to inspect registered users and promote/demote roles (CEO, Admin, Investigator, Student). |
| **Audit Logs (`/audit`)** | Administrative log of all authentication attempts, evidence uploads, and verification checks. |
| **Profile & Settings (`/profile`)** | User profile card, organization update form, and assigned role badge. |
| **Documentation & Ethics (`/docs`)** | Academic dossier detailing subject mappings (7 courses), literature citations, and ethical principles. |

---

## 8. Mapping to Seven Academic Subjects (Semester VII KD)

VeriTrust AI directly demonstrates learning outcomes across seven curriculum subjects:

| Subject Code | Subject Name | Project Implementation & Evaluation Evidence |
|---|---|---|
| **23AI702** | Software Testing Automation | 15 passing automated Pytest tests, covering Unit hashing, API integration, RBAC security, and E2E workflow; CI pipeline configuration in `.github/workflows/ci.yml`. |
| **23AIE27** | Blockchain and Cryptocurrency Technologies | Solidity smart contract (`EvidenceRegistry.sol`), on-chain fingerprint anchoring, event reference logging, and blockchain explorer UI. |
| **23AIE10** | Generative AI | Structured JSON fact extraction, factual consistency preservation (hallucination prevention), deterministic template fallback, and ReportLab PDF compilation. |
| **23CS702** | Cryptography and Network Security | SHA-256 chunk-based file hashing, Ed25519 asymmetric manifest signing, public key verification, bcrypt salted password hashing, and JWT authorization. |
| **23CS703** | Cryptography and Network Security Lab | Practical demonstration of file integrity: changing 1 byte in a video binary stream causes immediate, complete SHA-256 divergence and triggers an `INTEGRITY MISMATCH` outcome. |
| **23AEO01** | Drone Design and Development | Simulated UAV aerial reconnaissance video evidence (`EV-2026-UAV01`) recorded with simulated flight telemetry, capture operator ID, and chain-of-custody tracking. |
| **23AI701** | Professional Ethics in Engineering | Explicit disclaimers stating AI scores are probabilistic assessments rather than absolute truth; mandatory human expert review; privacy-preserving on-chain design (zero raw video or PII on-chain). |

---

## 9. Research Literature Review & Priority Citations (2025–2026)

The architecture of VeriTrust AI is grounded in recent academic literature:

1. **IEEE 2025:**  
   *Video Integrity Verification against Deepfake Alterations Using Aspects of Blockchain and SHA-256 Cryptographic Algorithm*  
   *Conference:* IEEE ComComAp 2025 · **DOI:** [10.1109/ComComAp68359.2025.11353195](https://doi.org/10.1109/ComComAp68359.2025.11353195)  
   *Relevance:* Provides the direct foundational precedent for combining deepfake detection with SHA-256 hashing and blockchain evidence registration.

2. **LACCEI 2025:**  
   *Blockchain as a Tool to Improve Chain of Custody Procedures in Digital Forensics: A Systematic Review*  
   *Publication:* LACCEI 2025 · **DOI:** [10.18687/LACCEI2025.1.1.321](https://doi.org/10.18687/LACCEI2025.1.1.321)  
   *Relevance:* Establishes forensic requirements for chronological hash-linked event tracking and non-repudiation in digital evidence handling.

3. **Elsevier / Forensic Science International 2026:**  
   *Advancing Reliable Synthetic Video Detection: Insights from the SAFE Challenge*  
   *Journal:* Forensic Science International: Digital Investigation · **DOI:** [10.1016/j.fsidi.2026.302120](https://doi.org/10.1016/j.fsidi.2026.302120)  
   *Relevance:* Evaluates synthetic video detection under post-processing compression and frames sampling uncertainty.

4. **Elsevier 2025:**  
   *ZAKON: A Decentralized Framework for Digital Forensic Admissibility and Justification*  
   *Journal:* Information Processing & Management · **DOI:** [10.1016/j.ipm.2025.104226](https://doi.org/10.1016/j.ipm.2025.104226)  
   *Relevance:* Distinguishes simple auditability from legal admissibility and provides guidance on tamper-evident smart contracts.

5. **Procedia Computer Science 2026:**  
   *The Deepfake Litmus Test: A Multimedia Authenticity Mechanism*  
   *Journal:* Procedia Computer Science · **DOI:** [10.1016/j.procs.2026.03.004](https://doi.org/10.1016/j.procs.2026.03.004)  
   *Relevance:* Explores container-level file structural analysis as a complement to neural network assessments.

---

## 10. Pre-Configured Demo Accounts (Ready for Evaluation)

The platform includes four pre-seeded user accounts across all defined role tiers:

| Role | Username | Password | User Name & Affiliation | Access Scope |
|---|---|---|---|---|
| **CEO / Super Admin** | `skshrivastav` | `Admin@1234` | Mr. S. K. Shrivastav (Lead Developer) | Global access, user role management, system audit logs, all evidence |
| **Administrator** | `admin1` | `Admin@1234` | Chief Security Admin | User role management, automated testing results, audit review |
| **Senior Investigator** | `investigator1` | `Investigator@1234` | Senior Inspector Sharma (DFIR Team) | Evidence upload, AI analysis execution, integrity verification, report export |
| **Student / Viewer** | `student1` | `Student@1234` | Academic Researcher (Dept. AI & DS) | Read-only inspection of assigned evidence and academic documentation |

---

## 11. Quick Execution Commands

### 1. Launch Platform with One Click (PowerShell)
```powershell
.\run_veritrust.ps1
```

### 2. Manual Commands
**Backend:**
```powershell
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Swagger API Docs:* `http://localhost:8000/api/docs`

**Frontend:**
```powershell
cd frontend
npm run dev
```
*Web Application:* `http://localhost:5173`

### 3. Run Automated Testing Suite
```powershell
pytest tests/ -v
```

### 4. Execute Full Live Verification & Task Audit
```powershell
python scripts/verify_system.py
```

---

## 12. Viva Presentation & Demonstration Script

When presenting VeriTrust AI during the Semester VII viva:

1. **Slide 1 — Motivation:** Explain why standalone deepfake detection fails (a low AI score doesn't prove file hasn't been altered; a valid hash doesn't prove the video wasn't AI-generated).
2. **Slide 2 — Live Login:** Log in as **Senior Investigator** (`investigator1` / `Investigator@1234`) using the one-click quick fill.
3. **Slide 3 — Evidence Ingestion:** Show evidence `EV-2026-UAV01` (Simulated drone patrol media demonstrating subject **23AEO01**).
4. **Slide 4 — AI Deepfake Assessment:** Open **AI Forensics**; display the frame extraction timeline, temporal risk scores, and the mandatory model limitation notice.
5. **Slide 5 — Cryptographic Integrity & Tamper Test:** Open **Crypto Integrity & Sig**; show matching SHA-256 hash. Click **"Simulate 1-Byte Tamper"** to show instant `INTEGRITY MISMATCH` detection.
6. **Slide 6 — Blockchain Ledger:** Open **Blockchain Explorer**; display on-chain transaction hash, block number, and explain why zero PII is placed on-chain.
7. **Slide 7 — Chain of Custody:** Open **Chain of Custody**; show chronological hash-chaining linking every event.
8. **Slide 8 — Grounded Forensic Report:** Open **Forensic Reports**; view the structured findings and click **Download PDF** to inspect the ReportLab document.
9. **Slide 9 — QA Testing Dashboard:** Open **Automated Testing QA**; showcase the 15 passing automated test assertions.
10. **Slide 10 — Ethics & Conclusion:** Conclude with the responsible AI principles, privacy safeguards, and future scope.

---

*Document compiled and verified for VeriTrust AI platform.*  
*Architect & Developer: Mr. S. K. Shrivastav ([LinkedIn](https://www.linkedin.com/in/s-k-shrivastav/))*

