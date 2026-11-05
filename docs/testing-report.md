# VeriTrust AI — Automated Testing & QA Execution Report

**Module:** Software Testing and Quality Assurance Automation (Course: 23AI702)  
**Execution Environment:** Python 3.13.7 · Pytest 8.3.3 · HTTPX 0.28.1 · Node.js v25.9.0

---

## 1. Test Suite Summary

| Suite ID | Description | Total Tests | Passed | Failed | Status |
|---|---|---|---|---|---|
| **UNIT-01** | Cryptographic hashing & tamper detection (`test_cryptography.py`) | 4 | 4 | 0 | **PASSED** |
| **UNIT-02** | Security core: bcrypt & JWT authorization (`test_security_core.py`) | 3 | 3 | 0 | **PASSED** |
| **INT-01** | API REST endpoint contracts (`test_api_endpoints.py`) | 4 | 4 | 0 | **PASSED** |
| **SEC-01** | Role-based access control & privilege boundaries (`test_security_rbac.py`) | 3 | 3 | 0 | **PASSED** |
| **E2E-01** | Complete 17-step ingestion & verification pipeline (`test_forensic_workflow.py`) | 1 | 1 | 0 | **PASSED** |
| **TOTAL** | Full Regression Suite | **15** | **15** | **0** | **100% PASSED** |

---

## 2. Key Forensic Assertions Verified

1. **SHA-256 Consistency:** Identical files consistently produce 64-hex-character digests.
2. **Single-Byte Tamper Detection:** Changing 1 byte in a binary video stream yields a completely divergent digest.
3. **Ed25519 Manifest Signature:** Manifest signed at registration verifies successfully; altering metadata values causes immediate signature invalidation.
4. **RBAC Escalation Prevention:** Requests from `student` or `viewer` roles to administrative audit logs or user roles return `403 Forbidden`.
5. **Tamper Proof Pipeline:** Full upload -> SHA-256 calculation -> manifest signing -> custody chain linking executed without errors.

---

## 3. How to Run Tests Locally

```powershell
# Run the complete test suite
pytest tests/ -v

# Run with coverage report
pytest --cov=backend/app tests/
```

