# VeriTrust AI — System Architecture Specification

## Project Title
**VeriTrust AI: An AI-Powered Digital Evidence Integrity, Verification and Security Platform Using Blockchain and Automated Testing**  
**Tagline:** *Detect the Fake. Verify the Evidence. Preserve the Trust.*  
**Lead Developer:** Mr. S. K. Shrivastav ([LinkedIn](https://www.linkedin.com/in/s-k-shrivastav/))  
**Academic Level:** Semester VII Knowledge Demonstration · B.Tech Artificial Intelligence & Data Science

---

## 1. High-Level Architecture Overview

VeriTrust AI connects five fundamental disciplines into a unified forensic intelligence pipeline:

```
[ User Browser / Investigator ]
              │ (React 19 + TypeScript + Vite + Tailwind CSS)
              ▼
[ FastAPI Gateway API (Python 3.13) ]
  ├── JWT Auth & RBAC Security Layer (CEO, Admin, Investigator, Student)
  ├── Cryptographic Integrity Engine (SHA-256 chunking + Ed25519 Signatures)
  ├── VeriFace AI Forensics Pipeline (OpenCV frame extraction & temporal inference)
  ├── Blockchain Ledger Adapter (Solidity EvidenceRegistry Smart Contract)
  └── Evidence-Grounded GenAI Reporting (Structured JSON -> Template/LLM -> PDF)
              │
  ┌───────────┴─────────────┬────────────────────────┬──────────────────────┐
  ▼                         ▼                        ▼                      ▼
[ MySQL 8.0 ]       [ Local Storage ]      [ Local Blockchain ]    [ Automated QA ]
Relational Schema     Original Media &      Hardhat Testnet /        Pytest, HTTPX,
& Audit Logs          Signed Manifests      EvidenceRegistry.sol     Playwright E2E
```

---

## 2. The Five Independent Forensic Questions Answered

1. **Does the media exhibit signs of manipulation?**  
   *Handled by:* VeriFace AI Deepfake Detector (probabilistic visual anomaly score).
2. **Has the evidence changed since trusted registration?**  
   *Handled by:* SHA-256 1MB chunked cryptographic digest comparison.
3. **Can the evidence's recorded history be independently checked?**  
   *Handled by:* Solidity EvidenceRegistry smart contract on Ethereum-compatible network.
4. **Who uploaded, accessed, or transferred the evidence?**  
   *Handled by:* Cryptographically linked Chain of Custody event log.
5. **Can a report explain the results using verified information?**  
   *Handled by:* Grounded Forensic Report Generator anchored strictly to verified database facts.

---

## 3. Technology Stack Summary

| Domain | Technology / Tool | Version / Standard |
|---|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons | React 19, TS 5.x, Vite 8.x |
| **Backend API** | FastAPI, Python, Pydantic, SQLAlchemy, Uvicorn | Python 3.13, FastAPI 0.111 |
| **Relational Database** | MySQL | MySQL 8.0 InnoDB (utf8mb4) |
| **Cryptography** | Python hashlib, cryptography library | SHA-256, Ed25519 PKCS#8 |
| **Blockchain** | Solidity, Hardhat, Web3.py | Solidity 0.8.20, EVM |
| **AI Forensics** | OpenCV, NumPy, VeriFace AI architecture | OpenCV 4.10, Python |
| **Reporting & Export** | ReportLab, Structured JSON | PDF / JSON v1 |
| **Testing & CI** | Pytest, HTTPX, GitHub Actions | Pytest 8.3 |

