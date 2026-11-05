"""
VeriTrust AI — Dashboard, Reports, Admin, Testing Endpoints
"""
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user, ADMIN_ROLES
from app.database.connection import get_db, check_db_connection
from app.models.evidence import Evidence
from app.models.analysis import AnalysisResult
from app.models.integrity import IntegrityVerification
from app.models.blockchain import BlockchainTransaction
from app.models.report import AuditLog, Report, TestExecution
from app.schemas.evidence import DashboardMetrics
from app.services.ledger_service import WEB3_AVAILABLE
from app.services.forensic_service import MODEL_AVAILABLE

router = APIRouter(tags=["Dashboard & Admin"])
logger = logging.getLogger(__name__)


@router.get("/health")
def health_check():
    """Service health check — returns actual service availability states."""
    return {
        "status": "ok",
        "database": check_db_connection(),
        "blockchain": WEB3_AVAILABLE,
        "ai_model": MODEL_AVAILABLE,
        "version": "1.0.0",
    }


@router.get("/dashboard/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return dashboard metrics from actual backend data."""
    is_admin = current_user.role in ADMIN_ROLES

    # Base query filtered by user unless admin
    ev_query = db.query(Evidence)
    if not is_admin:
        ev_query = ev_query.filter(Evidence.uploader_id == current_user.id)

    total_evidence = ev_query.count()
    total_analyses = db.query(AnalysisResult)\
                       .join(Evidence, AnalysisResult.evidence_id == Evidence.id)\
                       .filter(*([] if is_admin else [Evidence.uploader_id == current_user.id]))\
                       .count()

    total_verified = db.query(IntegrityVerification)\
                       .join(Evidence, IntegrityVerification.evidence_id == Evidence.id)\
                       .filter(*([] if is_admin else [Evidence.uploader_id == current_user.id]))\
                       .filter(IntegrityVerification.overall_status == "verified")\
                       .count()

    total_blockchain = db.query(BlockchainTransaction)\
                         .join(Evidence, BlockchainTransaction.evidence_id == Evidence.id)\
                         .filter(*([] if is_admin else [Evidence.uploader_id == current_user.id]))\
                         .filter(BlockchainTransaction.status == "confirmed")\
                         .count()

    pending = ev_query.filter(Evidence.status.in_(["pending", "analyzing"])).count()

    # Recent evidence
    recent_evidence = ev_query.order_by(Evidence.uploaded_at.desc()).limit(5).all()
    recent_ev_list = [
        {
            "evidence_id": e.evidence_id,
            "original_filename": e.original_filename,
            "status": e.status,
            "uploaded_at": e.uploaded_at.isoformat() if e.uploaded_at else None,
        }
        for e in recent_evidence
    ]

    # Recent custody events
    from app.models.custody import CustodyEvent
    ce_query = db.query(CustodyEvent)\
                 .join(Evidence, CustodyEvent.evidence_id == Evidence.id)
    if not is_admin:
        ce_query = ce_query.filter(Evidence.uploader_id == current_user.id)
    recent_custody = ce_query.order_by(CustodyEvent.occurred_at.desc()).limit(5).all()
    recent_ce_list = [
        {
            "event_type": e.event_type,
            "actor_name": e.actor_name,
            "occurred_at": e.occurred_at.isoformat(),
        }
        for e in recent_custody
    ]

    # Analysis summary
    analysis_summary = {
        "potentially_manipulated": db.query(AnalysisResult)
            .filter(AnalysisResult.result_category == "potentially_manipulated").count(),
        "no_manipulation_detected": db.query(AnalysisResult)
            .filter(AnalysisResult.result_category == "no_manipulation_detected").count(),
        "inconclusive": db.query(AnalysisResult)
            .filter(AnalysisResult.result_category == "inconclusive").count(),
        "failed": db.query(AnalysisResult)
            .filter(AnalysisResult.result_category.in_(["analysis_failed", "analysis_unavailable"])).count(),
    }

    return DashboardMetrics(
        total_evidence=total_evidence,
        total_analyses=total_analyses,
        total_verified=total_verified,
        total_blockchain_registrations=total_blockchain,
        pending_operations=pending,
        recent_evidence=recent_ev_list,
        recent_custody_events=recent_ce_list,
        analysis_summary=analysis_summary,
        is_demonstration_data=False,
    )


@router.get("/reports")
def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List all reports accessible to the current user."""
    query = db.query(Report)
    if current_user.role not in ADMIN_ROLES:
        query = query.filter(Report.created_by == current_user.id)
    total = query.count()
    items = query.order_by(Report.generated_at.desc())\
                 .offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [
            {
                "report_id": r.report_id,
                "evidence_id": r.evidence.evidence_id if r.evidence else None,
                "title": r.title,
                "status": r.status,
                "generation_method": r.generation_method,
                "generated_at": r.generated_at.isoformat() if r.generated_at else None,
                "pdf_available": bool(r.pdf_path and Path(r.pdf_path).exists()),
            }
            for r in items
        ],
        "total": total,
        "page": page,
    }


@router.get("/reports/{report_id}")
def get_report(
    report_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific report by ID."""
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.created_by != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")

    return {
        "report_id": report.report_id,
        "title": report.title,
        "status": report.status,
        "generation_method": report.generation_method,
        "report_text": report.report_text,
        "pdf_available": bool(report.pdf_path and Path(report.pdf_path).exists()),
        "generated_at": report.generated_at.isoformat() if report.generated_at else None,
    }


@router.get("/reports/{report_id}/download")
def download_report(
    report_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Download the PDF report file."""
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.created_by != current_user.id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Access denied.")
    if not report.pdf_path or not Path(report.pdf_path).exists():
        raise HTTPException(status_code=404, detail="PDF file not available.")

    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=f"{report.report_id}.pdf",
    )


@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Admin-only: view audit logs."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required.")

    total = db.query(AuditLog).count()
    logs = db.query(AuditLog)\
             .order_by(AuditLog.occurred_at.desc())\
             .offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": log.id,
                "action": log.action,
                "user_id": log.user_id,
                "resource_type": log.resource_type,
                "success": log.success,
                "detail": log.detail,
                "occurred_at": log.occurred_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
        "page": page,
    }


@router.get("/tests/results")
def get_test_results(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return automated test execution results. Admin only."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required.")

    executions = db.query(TestExecution)\
                   .order_by(TestExecution.started_at.desc()).limit(10).all()

    return {
        "executions": [
            {
                "execution_id": e.execution_id,
                "test_suite": e.test_suite,
                "status": e.status,
                "total_tests": e.total_tests,
                "passed_tests": e.passed_tests,
                "failed_tests": e.failed_tests,
                "skipped_tests": e.skipped_tests,
                "coverage_percent": e.coverage_percent,
                "started_at": e.started_at.isoformat() if e.started_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "is_demonstration_data": e.is_demonstration_data,
            }
            for e in executions
        ],
    }


@router.get("/users")
def list_users(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Admin only: list all users."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required.")

    from app.models.user import User
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login": u.last_login.isoformat() if u.last_login else None,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str = Query(...),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Admin only: update a user's role."""
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required.")

    from app.models.user import User
    valid_roles = ["ceo", "admin", "investigator", "student"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.role = role
    db.commit()
    return {"message": f"Role updated to {role} for user {user.username}"}

