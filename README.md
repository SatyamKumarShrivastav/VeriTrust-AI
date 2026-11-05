# VeriTrust AI: An AI-Powered Digital Evidence Integrity, Verification and Security Platform Using Blockchain and Automated Testing

> **Tagline:** *Detect the Fake. Verify the Evidence. Preserve the Trust.*  
> **Project Developed by:** **Mr. S. K. Shrivastav**  
> **LinkedIn:** [https://www.linkedin.com/in/s-k-shrivastav/](https://www.linkedin.com/in/s-k-shrivastav/)  
> **Academic Purpose:** Semester VII Knowledge Demonstration (B.Tech AI & Data Science)  
> **Project Category:** Artificial Intelligence, Digital Forensics, Cybersecurity, Blockchain, Generative AI, and Software Testing Automation.

---

## 🌟 Executive Summary

In contemporary digital forensics and cybersecurity investigations, digital evidence is vulnerable to post-capture alteration, algorithmic deepfake manipulation, and contested chains of custody. Standalone deepfake detectors only estimate visual anomalies but cannot confirm whether a file has remained bit-for-bit identical since capture. Likewise, cryptographic hashes verify file consistency but cannot determine whether the captured content depicts truthful reality.

**VeriTrust AI** harmonizes these five disparate technologies into an integrated, enterprise-grade web application:
1. **Artificial Intelligence:** Detects synthetic facial anomalies and deepfakes across extracted video frames.
2. **Cryptography:** Generates 1MB chunked SHA-256 fingerprints, standardized JSON manifests, and Ed25519 digital signatures.
3. **Blockchain:** Maintains an immutable, append-only registration ledger via Solidity smart contracts without placing sensitive raw media on-chain.
4. **Generative AI:** Produces comprehensive forensic reports grounded strictly in verified structured facts with PDF export and deterministic fallback.
5. **Software Testing Automation:** Ensures end-to-end reliability, cryptographic tamper detection, and RBAC security across 15+ automated test suites.

---

## 🏛️ System Architecture

```
                                  [ Investigator / User Browser ]
                                                 │
                                 (React 19 + TypeScript + Vite + Tailwind)
                                                 │
                                                 ▼
                                 [ FastAPI Backend Gateway (Python 3.13) ]
                    ┌────────────────────────────┼───────────────────────────┐
                    ▼                            ▼                           ▼
       [ Cryptography Engine ]          [ VeriFace AI Pipeline ]   [ Blockchain Ledger ]
       • SHA-256 Chunk Hashing          • OpenCV Keyframe Extraction • Solidity Smart Contract
       • Ed25519 Manifest Signing       • Temporal Anomaly Scoring   • Hardhat Local Network
       • Dynamic Hash Recalculation     • Face Localization          • On-Chain Digest Anchoring
                    │                            │                           │
                    └────────────────────────────┼───────────────────────────┘
                                                 │
                                                 ▼
                                     [ Evidence Custody & QA ]
                                     • Chronological Hash-Chaining
                                     • Grounded Forensic PDF Reports
                                     • MySQL Normalized Persistence
                                     • Pytest Automated QA Suite
```

---

## 🔑 Demo Access Credentials (Academic Viva & Evaluation)

| Role | Username | Password | Privileges |
|---|---|---|---|
| **CEO / Super Administrator** | `skshrivastav` | `Admin@1234` | Full platform governance, audit logs, system-wide evidence inspection |
| **Security Administrator** | `admin1` | `Admin@1234` | User role assignment, test executions, audit trail review |
| **Senior Investigator** | `investigator1` | `Investigator@1234` | Evidence ingestion, deepfake analysis, integrity checks, report generation |
| **Student / Viewer** | `student1` | `Student@1234` | Read-only inspection of assigned evidence, ethical guidelines |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.11+ (Tested on Python 3.13.7)
- **Node.js**: v18+ (Tested on Node.js v25.9.0)
- **MySQL**: 8.0+ running on `localhost:3306`

### 2. Database Configuration
Ensure MySQL is running with your credentials, then initialize the database:
```powershell
python scripts/setup_db.py
```

### 3. Seed Demo Evidence & Users
Populate the initial accounts, simulated UAV drone evidence, signed manifests, and on-chain records:
```powershell
python scripts/seed_demo_data.py
```

### 4. Start the FastAPI Backend
```powershell
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/api/docs`

### 5. Start the React Frontend
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`

---

## 🧪 Automated Testing & Security Verification

Execute the comprehensive automated test suite (Unit, Integration, Security RBAC, and End-to-End):
```powershell
pytest tests/ -v
```
All 15 automated test assertions execute and pass, validating single-byte tamper detection, Ed25519 signature checks, and privilege boundary blocks.

---

## 📚 Academic Subject Mapping (Semester VII KD)

| Subject Code | Course Name | Project Contribution | Demonstrable Evidence |
|---|---|---|---|
| **23AI702** | Software Testing Automation | Automated unit, regression, and security testing | 15 passing pytest test cases & QA dashboard |
| **23AIE27** | Blockchain & Cryptocurrency Technologies | Solidity smart contract for evidence integrity & custody | `EvidenceRegistry.sol` contract & explorer |
| **23AIE10** | Generative AI | Evidence-grounded forensic report generation | Deterministic report engine & PDF export |
| **23CS702** | Cryptography & Network Security | SHA-256 chunking, Ed25519 signatures, JWT RBAC | Hashing engine, public/private keys, bcrypt |
| **23CS703** | CNS Lab | Practical file alteration & tamper detection | Live 1-byte file alteration mismatch demo |
| **23AEO01** | Drone Design & Development | UAV aerial patrol evidence ingestion & provenance | Sample drone media `EV-2026-UAV01` |
| **23AI701** | Professional Ethics in Engineering | Disclosure of AI model uncertainty & human review | Ethics safeguards & limitation banners |

---

## 📜 Priority Research Foundations (2025–2026)
1. **IEEE 2025:** *Video Integrity Verification against Deepfake Alterations Using Aspects of Blockchain and SHA-256 Cryptographic Algorithm* (DOI: 10.1109/ComComAp68359.2025.11353195)
2. **LACCEI 2025:** *Blockchain as a Tool to Improve Chain of Custody Procedures in Digital Forensics: A Systematic Review* (DOI: 10.18687/LACCEI2025.1.1.321)
3. **ScienceDirect 2026:** *Advancing Reliable Synthetic Video Detection: Insights from the SAFE Challenge* (Forensic Science International: Digital Investigation)
4. **Elsevier 2025:** *ZAKON: A Decentralized Framework for Digital Forensic Admissibility and Justification*

---

## ⚖️ License
MIT License. Developed by Mr. Satyam Kumar Shrivastav for academic research and knowledge demonstration of 7th semester, to submit in Excel Engineering College (Autonomous), Komarapalayam (University: Anna University, Chennai).

