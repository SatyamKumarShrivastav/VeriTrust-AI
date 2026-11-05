"""
VeriTrust AI — FastAPI Application Entry Point
"""
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.connection import init_db, check_db_connection
from app.api.v1.endpoints import auth, evidence, dashboard
from app.services.integrity_service import ensure_key_pair

# ─── Logging configuration ────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("veritrust")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("=" * 60)
    logger.info("VeriTrust AI starting up...")
    logger.info("=" * 60)

    # Ensure required directories exist
    for d in [settings.UPLOAD_DIR, settings.REPORTS_DIR, settings.KEYS_DIR, "./logs"]:
        Path(d).mkdir(parents=True, exist_ok=True)

    # Initialize Ed25519 key pair
    try:
        ensure_key_pair()
        logger.info("Cryptographic key pair ready.")
    except Exception as e:
        logger.error(f"Key pair initialization failed: {e}")

    # Initialize database
    try:
        init_db()
        logger.info("Database initialized.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

    logger.info("VeriTrust AI is ready.")
    yield
    logger.info("VeriTrust AI shutting down.")


# ─── FastAPI Application ──────────────────────────────────────
app = FastAPI(
    title="VeriTrust AI",
    description=(
        "An AI-Powered Digital Evidence Integrity, Verification and Security Platform "
        "Using Blockchain and Automated Testing.\n\n"
        "**Tagline**: Detect the Fake. Verify the Evidence. Preserve the Trust.\n\n"
        "**Academic Disclaimer**: This is a software demonstration for Semester VII "
        "Knowledge Demonstration. It is not a substitute for accredited forensic procedures."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global error handler ─────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return a safe error response without exposing internal details."""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please contact support."},
    )


# ─── Routes ──────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(evidence.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "app": "VeriTrust AI",
        "version": "1.0.0",
        "database": check_db_connection(),
    }


@app.get("/", tags=["System"])
def root():
    return {
        "app": "VeriTrust AI",
        "tagline": "Detect the Fake. Verify the Evidence. Preserve the Trust.",
        "docs": "/api/docs",
        "version": "1.0.0",
    }

