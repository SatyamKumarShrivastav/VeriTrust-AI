"""
VeriTrust AI — Evidence Pydantic Schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class EvidenceResponse(BaseModel):
    id: int
    evidence_id: str
    original_filename: str
    file_size_bytes: int
    mime_type: Optional[str]
    file_extension: Optional[str]
    duration_seconds: Optional[int]
    resolution: Optional[str]
    sha256_hash: Optional[str]
    status: str
    description: Optional[str]
    tags: Optional[str]
    uploaded_at: datetime
    registered_at: Optional[datetime]
    uploader_id: int

    model_config = ConfigDict(from_attributes=True)


class EvidenceListResponse(BaseModel):
    items: List[EvidenceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class EvidenceUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=2000)
    tags: Optional[str] = Field(None, max_length=500)


class IntegrityVerificationResponse(BaseModel):
    evidence_id: str
    registered_hash: Optional[str]
    recalculated_hash: Optional[str]
    hash_match: Optional[bool]
    signature_valid: Optional[bool]
    signature_detail: Optional[str]
    blockchain_verified: Optional[bool]
    blockchain_detail: Optional[str]
    overall_status: str
    detail: Optional[str]
    verified_at: datetime


class ManifestSignResponse(BaseModel):
    evidence_id: str
    signature_id: int
    algorithm: str
    public_key_hex: str
    signed_at: datetime
    message: str


class AnalysisResultResponse(BaseModel):
    id: int
    evidence_id: str
    model_name: str
    model_version: str
    result_category: str
    confidence_score: Optional[float]
    manipulation_probability: Optional[float]
    frames_analyzed: Optional[int]
    frames_suspicious: Optional[int]
    inference_time_seconds: Optional[float]
    status: str
    error_message: Optional[str]
    limitations_note: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlockchainRegistrationResponse(BaseModel):
    evidence_id: str
    tx_hash: Optional[str]
    block_number: Optional[int]
    network: Optional[str]
    event_type: str
    status: str
    message: str


class CustodyEventResponse(BaseModel):
    id: int
    evidence_id: str
    event_type: str
    actor_name: Optional[str]
    actor_role: Optional[str]
    blockchain_tx_hash: Optional[str]
    file_hash_at_event: Optional[str]
    signature_valid_at_event: Optional[str]
    notes: Optional[str]
    occurred_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportResponse(BaseModel):
    id: int
    report_id: str
    evidence_id: str
    title: str
    generation_method: str
    status: str
    generated_at: datetime
    pdf_available: bool = False

    model_config = ConfigDict(from_attributes=True)


class DashboardMetrics(BaseModel):
    total_evidence: int
    total_analyses: int
    total_verified: int
    total_blockchain_registrations: int
    pending_operations: int
    recent_evidence: List[dict]
    recent_custody_events: List[dict]
    analysis_summary: dict
    is_demonstration_data: bool = False

