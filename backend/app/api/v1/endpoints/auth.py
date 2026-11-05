"""
VeriTrust AI — Authentication Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
"""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_current_active_user, ROLE_STUDENT,
)
from app.database.connection import get_db
from app.models.user import User
from app.models.report import AuditLog
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


def log_audit(db: Session, action: str, user_id=None, success=True, detail=None, request=None):
    ip = None
    ua = None
    if request:
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent", "")[:200]
    log = AuditLog(
        user_id=user_id,
        action=action,
        success=success,
        detail=detail,
        ip_address=ip,
        user_agent=ua,
        resource_type="auth",
    )
    db.add(log)
    db.commit()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check duplicates
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken.")

    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        organization=payload.organization,
        role=ROLE_STUDENT,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit(db, "USER_REGISTERED", user.id, True, f"User {user.email} registered.", request)
    logger.info(f"New user registered: {user.email}")
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate and return access + refresh tokens."""
    # Allow login with email or username
    user = db.query(User).filter(
        (User.email == payload.username) | (User.username == payload.username)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        log_audit(db, "LOGIN_FAILED", None, False, f"Failed login for: {payload.username}", request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled.")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    log_audit(db, "LOGIN_SUCCESS", user.id, True, None, request)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
def logout(request: Request, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Record logout event. Token invalidation requires client-side token removal."""
    log_audit(db, "LOGOUT", current_user.id, True, None, request)
    return {"message": "Logged out successfully. Please remove the token client-side."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_active_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.organization is not None:
        current_user.organization = payload.organization
    if payload.bio is not None:
        current_user.bio = payload.bio
    db.commit()
    db.refresh(current_user)
    return current_user

