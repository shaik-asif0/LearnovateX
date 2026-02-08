# ==================== IMPORTS ====================
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta, date
import jwt
import bcrypt
import asyncio
import PyPDF2
import io
import sqlite3
import json
import httpx
import secrets
import smtplib
from email.message import EmailMessage
import hashlib
import re
import shutil

# OpenAI SDK
# - AzureOpenAI: for Azure OpenAI resources (requires endpoint + deployment)
# - OpenAI: for OpenAI Platform (openai.com) API keys
from openai import AzureOpenAI, OpenAI


# from fastapi.middleware.cors import CORSMiddleware
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # allow all for now
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# ==================== DATA MODELS ====================
class AchievementItem(BaseModel):
    id: int
    title: str
    desc: str
    icon: str
    earned: bool
    points: int
    progress: int = 0
    target: int = 0

class AchievementCategory(BaseModel):
    category: str
    items: List[AchievementItem]


class AssistantChatRequest(BaseModel):
    message: str
    context_path: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None


class AssistantChatResponse(BaseModel):
    response: str

# ==================== APP SETUP ====================
# Create the main app without a prefix
app = FastAPI()

default_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://purple-river-029d38c00.2.azurestaticapps.net",
]

# Add a function to detect offline or online mode
def is_offline_mode():
    return os.environ.get("APP_MODE", "offline").lower() == "offline"

# Update CORS origins based on mode
if is_offline_mode():
    cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    cors_origin_regex = None
else:
    cors_origins_env = os.environ.get("CORS_ORIGINS")
    if cors_origins_env:
        cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    else:
        cors_origins = default_cors_origins
    cors_origin_regex = os.environ.get("CORS_ORIGIN_REGEX", r"https://.*\.azurestaticapps\.net")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

logger = logging.getLogger(__name__)

# ==================== ROUTES ====================

ROOT_DIR = Path(__file__).parent
# Load local env file.
# IMPORTANT: Do NOT override cloud/App Service environment variables by default.
# For local development, we always prefer values from `.env` so the app runs
# consistently even if the shell already has empty/old env vars.
#
# In Azure/App Service, you can still force override explicitly:
#   DOTENV_OVERRIDE=true
is_azure_app_service = bool(os.environ.get("WEBSITE_SITE_NAME") or os.environ.get("WEBSITE_INSTANCE_ID"))
if is_azure_app_service:
    dotenv_override = os.environ.get("DOTENV_OVERRIDE", "").strip().lower() == "true"
else:
    dotenv_override = True
load_dotenv(ROOT_DIR / ".env", override=dotenv_override)

# Database Configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./learnovatex.db')
SQLITE_DB_PATH = ROOT_DIR / 'learnovatex.db'

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'learnovatex_super_secure_jwt_key_2026')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_DAYS = int(os.environ.get('JWT_EXPIRATION_DAYS', 7))
JWT_EXPIRATION_DELTA = timedelta(days=JWT_EXPIRATION_DAYS)

# AI Mode Configuration: 'demo', 'azure', 'openai'
AI_MODE = os.environ.get('AI_MODE', 'demo')

# Azure OpenAI Configuration (for future use)
AZURE_OPENAI_API_KEY = os.environ.get('AZURE_OPENAI_API_KEY', '')
AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT', '')
AZURE_OPENAI_DEPLOYMENT = os.environ.get('AZURE_OPENAI_DEPLOYMENT', '')

# OpenAI (non-Azure) Configuration
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
# Model name for OpenAI Platform (examples: gpt-4o-mini, gpt-4.1-mini)
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

# File Storage Configuration
UPLOAD_DIR = os.environ.get('UPLOAD_DIR', 'uploads')
RESUME_UPLOAD_DIR = os.environ.get('RESUME_UPLOAD_DIR', 'uploads/resumes')
CODE_UPLOAD_DIR = os.environ.get('CODE_UPLOAD_DIR', 'uploads/code_submissions')
MAX_FILE_SIZE_MB = int(os.environ.get('MAX_FILE_SIZE_MB', 5))
TUTOR_CONTEXT_MAX_FILE_SIZE_MB = int(os.environ.get('TUTOR_CONTEXT_MAX_FILE_SIZE_MB', 20))
TESSERACT_CMD = os.environ.get('TESSERACT_CMD', '').strip()
TESSERACT_LANG = os.environ.get('TESSERACT_LANG', 'eng').strip() or 'eng'
ALLOWED_RESUME_FORMATS = os.environ.get('ALLOWED_RESUME_FORMATS', 'pdf').split(',')


def _detect_tesseract_cmd() -> str:
    # 1) Explicit env var
    if TESSERACT_CMD:
        return TESSERACT_CMD

    # 2) In PATH
    found = shutil.which("tesseract")
    if found:
        return found

    # 3) Common Windows install paths
    candidates = [
        r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
        r"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
    ]
    for p in candidates:
        try:
            if os.path.exists(p):
                return p
        except Exception:
            continue

    return ""

# Ensure upload directories exist and are served
UPLOADS_ROOT = ROOT_DIR / UPLOAD_DIR
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)
(ROOT_DIR / RESUME_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
(ROOT_DIR / CODE_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Serve uploaded files (screenshots, avatars, resumes, etc.)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_ROOT)), name="uploads")

# Application Limits
MAX_DAILY_AI_REQUESTS = int(os.environ.get('MAX_DAILY_AI_REQUESTS', 20))
MAX_CODE_SUBMISSIONS_PER_DAY = int(os.environ.get('MAX_CODE_SUBMISSIONS_PER_DAY', 50))
MAX_INTERVIEWS_PER_DAY = int(os.environ.get('MAX_INTERVIEWS_PER_DAY', 5))

# Logging Configuration
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FILE = os.environ.get('LOG_FILE', 'logs/learnovatex.log')

# Email Configuration (optional)
def _env_str(name: str) -> str:
    val = os.environ.get(name, "")
    if val is None:
        return ""
    # Trim and remove wrapping quotes
    val = str(val).strip()
    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
        val = val[1:-1].strip()
    return val


SMTP_HOST = _env_str('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT') or 587)
SMTP_USERNAME = _env_str('SMTP_USERNAME')
SMTP_PASSWORD = _env_str('SMTP_PASSWORD')
EMAIL_FROM = _env_str('EMAIL_FROM')

# Gmail app passwords are shown with spaces; allow either format.
if SMTP_HOST.endswith("gmail.com"):
    SMTP_PASSWORD = SMTP_PASSWORD.replace(" ", "")

# Transport options
SMTP_USE_SSL = os.environ.get('SMTP_USE_SSL', 'false').lower() == 'true'
SMTP_USE_STARTTLS = os.environ.get('SMTP_USE_STARTTLS', 'true').lower() == 'true'

SMTP_CONFIGURED = bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD and EMAIL_FROM)

# If ENABLE_EMAIL isn't explicitly set, auto-enable when SMTP is configured.
_enable_email_raw = os.environ.get('ENABLE_EMAIL')
if _enable_email_raw is None:
    ENABLE_EMAIL = SMTP_CONFIGURED
else:
    ENABLE_EMAIL = _enable_email_raw.lower() == 'true'

# Extra safety: allow returning debug OTP only when explicitly enabled.
RETURN_DEBUG_OTP = os.environ.get('RETURN_DEBUG_OTP', 'false').lower() == 'true'

# App Configuration
APP_NAME = os.environ.get('APP_NAME', 'LearnovateX')
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
DEBUG = os.environ.get('DEBUG', 'true').lower() == 'true'

# AI Configuration
# Check AI mode and print appropriate message
if AI_MODE == 'azure' and AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT:
    print("✓ Azure OpenAI configured - AI features will use real-time responses")
elif AI_MODE == 'openai' and OPENAI_API_KEY:
    print("✓ OpenAI configured - AI features will use real-time responses")
elif AI_MODE in ('azure', 'openai'):
    print(f"⚠ {AI_MODE} mode selected but not configured - using demo mode")
else:
    print("ℹ Running in demo mode - AI features will use sample responses")

# ==================== MODELS ====================

class UserRole(str):
    STUDENT = "student"
    JOB_SEEKER = "job_seeker"
    COMPANY = "company"
    COLLEGE_ADMIN = "college_admin"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    # Only returned in non-production debug mode when email sending is disabled.
    debug_otp: Optional[str] = None


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class VerifyOtpResponse(BaseModel):
    verified: bool


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str
    avatar_url: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None
    updated_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None


class AvatarUploadResponse(BaseModel):
    avatar_url: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class TutorMessage(BaseModel):
    message: str
    topic: Optional[str] = None
    difficulty: Optional[str] = "intermediate"
    context_ids: Optional[List[str]] = None

class TutorResponse(BaseModel):
    response: str
    session_id: str


class TutorContextUploadResponse(BaseModel):
    context_id: str
    kind: str
    filename: Optional[str] = None
    text_extracted: Optional[bool] = None
    warning: Optional[str] = None


class TutorYouTubeContextRequest(BaseModel):
    url: str


class TutorYouTubeContextResponse(BaseModel):
    context_id: str
    kind: str
    video_id: Optional[str] = None

class CodeSubmission(BaseModel):
    code: str
    language: str
    problem_id: str
    user_id: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    solve_time_seconds: Optional[int] = None


class ActivityEvent(BaseModel):
    event_type: str
    path: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class ApplyTrackerCreate(BaseModel):
    role: str
    source: str
    url: str
    match_tag: Optional[str] = None
    status: Optional[str] = "planned"  # planned|applied|interview|offer|rejected


class ApplyTrackerUpdate(BaseModel):
    status: Optional[str] = None


class ApplyTrackerItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    role: str
    source: str
    url: str
    match_tag: Optional[str] = None
    status: str
    created_at: str
    updated_at: str

class CodeEvaluation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    problem_id: str
    code: str
    language: str
    evaluation: str
    passed: bool
    suggestions: str
    score: int
    created_at: str

class ResumeAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    filename: str
    file_url: Optional[str] = None
    text_content: str
    credibility_score: int
    projects_score: Optional[int] = None
    skills_score: Optional[int] = None
    experience_score: Optional[int] = None
    ats_score: Optional[int] = None
    fake_skills: List[str]
    suggestions: List[str]
    analysis: str
    created_at: str

class InterviewQuestion(BaseModel):
    question: str
    type: str  # technical, behavioral, etc.

class CourseEnrollment(BaseModel):
    course_id: int
    course_title: str
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    screenshot_url: Optional[str] = None

class InternshipApplication(BaseModel):
    internship_id: int
    internship_title: str
    company: str
    location: str
    duration: str
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    screenshot_url: Optional[str] = None

class InterviewResponse(BaseModel):
    question_id: str
    answer: str

class InterviewEvaluation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    interview_type: str
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    evaluation: str
    readiness_score: int
    strengths: List[str]
    weaknesses: List[str]
    created_at: str

class ProgressData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    topic: str
    difficulty: str
    score: int
    time_taken: int
    correct: bool
    created_at: str

class TestCreate(BaseModel):
    title: str
    description: str
    questions: List[Dict[str, Any]]
    duration: int  # in minutes
    company_id: str

class Test(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    questions: List[Dict[str, Any]]
    duration: int
    company_id: str
    created_at: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def _validate_password_strength(password: str) -> None:
    # Requirements:
    # - Minimum 8 characters
    # - At least 1 uppercase letter
    # - At least 1 number
    # - At least 1 special character
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)

    if not has_upper:
        raise HTTPException(status_code=400, detail="Password must include at least 1 uppercase letter")
    if not has_digit:
        raise HTTPException(status_code=400, detail="Password must include at least 1 number")
    if not has_special:
        raise HTTPException(status_code=400, detail="Password must include at least 1 special character")


def _generate_otp_6() -> str:
    # 000000 - 999999
    return f"{secrets.randbelow(1_000_000):06d}"


def _hash_otp(otp: str) -> str:
    return bcrypt.hashpw(otp.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _verify_otp(otp: str, otp_hash: str) -> bool:
    return bcrypt.checkpw(otp.encode('utf-8'), otp_hash.encode('utf-8'))


def _send_email_smtp(to_email: str, subject: str, body_text: str, body_html: Optional[str] = None) -> None:
    if not SMTP_CONFIGURED:
        raise RuntimeError("SMTP is not configured")

    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    smtp_cls = smtplib.SMTP_SSL if SMTP_USE_SSL else smtplib.SMTP
    with smtp_cls(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.ehlo()
        if (not SMTP_USE_SSL) and SMTP_USE_STARTTLS:
            server.starttls()
            server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)


def _email_status() -> dict:
    # Return safe diagnostics only (no passwords)
    env_file_path = str(ROOT_DIR / ".env")
    env_file_exists = (ROOT_DIR / ".env").exists()
    missing = []
    if not SMTP_HOST:
        missing.append("SMTP_HOST")
    if not SMTP_PORT:
        missing.append("SMTP_PORT")
    if not SMTP_USERNAME:
        missing.append("SMTP_USERNAME")
    if not SMTP_PASSWORD:
        missing.append("SMTP_PASSWORD")
    if not EMAIL_FROM:
        missing.append("EMAIL_FROM")

    configured = len(missing) == 0
    return {
        "enabled": bool(ENABLE_EMAIL),
        "configured": configured,
        "missing": missing,
        "dotenv": {
            "env_file": env_file_path,
            "env_file_exists": env_file_exists,
            "override": bool(dotenv_override),
            "is_azure_app_service": bool(is_azure_app_service),
        },
        "password_set": bool(SMTP_PASSWORD),
        "password_len": len(SMTP_PASSWORD) if SMTP_PASSWORD else 0,
        "host": SMTP_HOST or None,
        "port": SMTP_PORT or None,
        "use_starttls": bool(SMTP_USE_STARTTLS),
        "use_ssl": bool(SMTP_USE_SSL),
        "from": EMAIL_FROM or None,
    }


async def send_password_reset_otp_email(to_email: str, otp: str, ttl_minutes: int) -> None:
    subject = f"{APP_NAME} Password Reset Code"
    body_text = (
        f"Your {APP_NAME} password reset code is: {otp}\n\n"
        f"This code expires in {ttl_minutes} minutes.\n"
        "If you didn't request a password reset, you can ignore this email."
    )
    body_html = f"""
    <div style=\"font-family: Arial, Helvetica, sans-serif; line-height: 1.5;\">
      <h2 style=\"margin:0 0 12px 0;\">{APP_NAME} Password Reset</h2>
      <p style=\"margin:0 0 12px 0;\">Use this code to reset your password:</p>
      <div style=\"font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0 16px 0;\">{otp}</div>
      <p style=\"margin:0 0 12px 0;\">This code expires in <b>{ttl_minutes} minutes</b>.</p>
      <p style=\"margin:0; color:#666;\">If you didn't request this, you can ignore this email.</p>
    </div>
    """.strip()
    await asyncio.to_thread(_send_email_smtp, to_email, subject, body_text, body_html)


def _get_latest_reset_otp_row(email: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """
            SELECT id, email, otp_hash, expires_at, created_at, used_at, attempts
            FROM password_reset_otps
            WHERE email = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (email,),
        )
        return _row_to_dict(cursor.fetchone())


def _create_reset_otp(email: str, ttl_minutes: int) -> str:
    otp = _generate_otp_6()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=ttl_minutes)

    with _sqlite_connection() as conn:
        conn.execute(
            """
            INSERT INTO password_reset_otps (id, email, otp_hash, expires_at, created_at, used_at, attempts)
            VALUES (?, ?, ?, ?, ?, NULL, 0)
            """,
            (
                str(uuid.uuid4()),
                email,
                _hash_otp(otp),
                expires_at.isoformat(),
                now.isoformat(),
            ),
        )
        conn.commit()
    return otp


def _mark_reset_otp_used(email: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE password_reset_otps SET used_at = ? WHERE email = ? AND used_at IS NULL",
            (now, email),
        )
        conn.commit()


def _increment_reset_otp_attempts(row_id: str) -> None:
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE password_reset_otps SET attempts = COALESCE(attempts, 0) + 1 WHERE id = ?",
            (row_id,),
        )
        conn.commit()


def _update_user_password(email: str, new_password_hash: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        cur = conn.execute(
            "UPDATE users SET password = ?, updated_at = ? WHERE email = ?",
            (new_password_hash, now, email),
        )
        conn.commit()
        if cur.rowcount <= 0:
            raise HTTPException(status_code=404, detail="User not found")


def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + JWT_EXPIRATION_DELTA
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await fetch_sqlite_user(payload['email'])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _sqlite_connection():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _row_to_dict(row: Optional[sqlite3.Row]) -> Optional[dict]:
    return dict(row) if row else None


def _init_sqlite_db():
    with _sqlite_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL,
                avatar_url TEXT,
                profile_data TEXT,
                updated_at TEXT
            );
            """
        )

        # Safe migrations for existing databases
        for statement in [
            "ALTER TABLE users ADD COLUMN avatar_url TEXT",
            "ALTER TABLE users ADD COLUMN profile_data TEXT",
            "ALTER TABLE users ADD COLUMN updated_at TEXT",
        ]:
            try:
                conn.execute(statement)
            except sqlite3.OperationalError:
                # Column likely already exists
                pass
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                topic TEXT,
                difficulty TEXT,
                question TEXT,
                response TEXT,
                created_at TEXT NOT NULL
            );
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tutor_contexts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                kind TEXT NOT NULL,
                source_name TEXT,
                source_url TEXT,
                text_content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        try:
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_tutor_contexts_user_id ON tutor_contexts(user_id)"
            )
        except Exception:
            pass

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS activity_events (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                path TEXT,
                duration_seconds INTEGER,
                metadata_json TEXT,
                created_at TEXT NOT NULL
            );
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS login_streaks (
                user_id TEXT PRIMARY KEY,
                current_streak INTEGER NOT NULL DEFAULT 0,
                longest_streak INTEGER NOT NULL DEFAULT 0,
                last_login_at TEXT,
                updated_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS code_evaluations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                problem_id TEXT,
                topic TEXT,
                difficulty TEXT,
                solve_time_seconds INTEGER,
                code TEXT,
                language TEXT,
                evaluation TEXT,
                passed INTEGER,
                suggestions TEXT,
                score INTEGER,
                created_at TEXT NOT NULL
            );
            """
        )

        # Safe migrations for code_evaluations (older DBs)
        for statement in [
            "ALTER TABLE code_evaluations ADD COLUMN topic TEXT",
            "ALTER TABLE code_evaluations ADD COLUMN difficulty TEXT",
            "ALTER TABLE code_evaluations ADD COLUMN solve_time_seconds INTEGER",
        ]:
            try:
                conn.execute(statement)
            except sqlite3.OperationalError:
                pass
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS resume_analyses (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT,
                file_url TEXT,
                text_content TEXT,
                credibility_score INTEGER,
                projects_score INTEGER,
                skills_score INTEGER,
                experience_score INTEGER,
                ats_score INTEGER,
                fake_skills TEXT,
                suggestions TEXT,
                analysis TEXT,
                created_at TEXT NOT NULL
            );
            """
        )

        # Safe migrations for resume_analyses (older DBs)
        for statement in [
            "ALTER TABLE resume_analyses ADD COLUMN projects_score INTEGER",
            "ALTER TABLE resume_analyses ADD COLUMN skills_score INTEGER",
            "ALTER TABLE resume_analyses ADD COLUMN experience_score INTEGER",
            "ALTER TABLE resume_analyses ADD COLUMN ats_score INTEGER",
            "ALTER TABLE resume_analyses ADD COLUMN file_url TEXT",
        ]:
            try:
                conn.execute(statement)
            except sqlite3.OperationalError:
                pass
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS interview_evaluations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                interview_type TEXT,
                questions TEXT,
                answers TEXT,
                evaluation TEXT,
                readiness_score INTEGER,
                confidence_score INTEGER,
                communication_score INTEGER,
                technical_depth_score INTEGER,
                strengths TEXT,
                weaknesses TEXT,
                created_at TEXT NOT NULL
            );
            """
        )

        # Safe migrations for interview_evaluations (older DBs)
        for statement in [
            "ALTER TABLE interview_evaluations ADD COLUMN confidence_score INTEGER",
            "ALTER TABLE interview_evaluations ADD COLUMN communication_score INTEGER",
            "ALTER TABLE interview_evaluations ADD COLUMN technical_depth_score INTEGER",
        ]:
            try:
                conn.execute(statement)
            except sqlite3.OperationalError:
                pass

        # Career Readiness Dashboard support tables
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS career_readiness_snapshots (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                snapshot_date TEXT NOT NULL,
                readiness_score REAL NOT NULL,
                breakdown_json TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS daily_action_locks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action_date TEXT NOT NULL,
                action_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS weekly_checklist_states (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                week_start TEXT NOT NULL,
                done_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, week_start)
            );
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS apply_tracker (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                source TEXT NOT NULL,
                url TEXT NOT NULL,
                match_tag TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tests (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                questions TEXT,
                duration INTEGER,
                company_id TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL UNIQUE,
                progress_data TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        # College Admin tables
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS announcements (
                id TEXT PRIMARY KEY,
                college_admin_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'general',
                target_students TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS student_messages (
                id TEXT PRIMARY KEY,
                from_id TEXT NOT NULL,
                to_id TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                read INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );
            """
        )
        # Company Portal tables
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS job_postings (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                title TEXT NOT NULL,
                department TEXT,
                location TEXT,
                type TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                description TEXT,
                requirements TEXT,
                status TEXT DEFAULT 'active',
                applications INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS candidate_actions (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                candidate_id TEXT NOT NULL,
                action TEXT NOT NULL,
                notes TEXT,
                interview_date TEXT,
                interview_type TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                title TEXT NOT NULL,
                type TEXT,
                questions TEXT,
                duration INTEGER,
                passing_score INTEGER,
                status TEXT DEFAULT 'active',
                assigned_count INTEGER DEFAULT 0,
                completed_count INTEGER DEFAULT 0,
                avg_score REAL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            """
        )
        # Premium enrollment tables
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                course_id INTEGER NOT NULL,
                course_title TEXT NOT NULL,
                enrollment_date TEXT NOT NULL,
                status TEXT DEFAULT 'enrolled',
                name TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                qualification TEXT,
                experience TEXT,
                screenshot_url TEXT
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS internship_applications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                internship_id INTEGER NOT NULL,
                internship_title TEXT NOT NULL,
                application_date TEXT NOT NULL,
                status TEXT DEFAULT 'applied',
                company TEXT,
                location TEXT,
                duration TEXT,
                name TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                qualification TEXT,
                experience TEXT,
                screenshot_url TEXT
            );
            """
        )

        # Password reset OTPs
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS password_reset_otps (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                otp_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                used_at TEXT,
                attempts INTEGER DEFAULT 0
            );
            """
        )

        # Personal goals tracking (real-time SaaS tracking)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS personal_goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'custom',
                target REAL NOT NULL DEFAULT 1,
                deadline TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )

        # Safe migrations for older DBs
        for statement in [
            "ALTER TABLE password_reset_otps ADD COLUMN used_at TEXT",
            "ALTER TABLE password_reset_otps ADD COLUMN attempts INTEGER DEFAULT 0",
        ]:
            try:
                conn.execute(statement)
            except sqlite3.OperationalError:
                pass

        try:
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email)"
            )
        except Exception:
            pass


def _insert_sqlite_user(user_doc: dict) -> bool:
    try:
        with _sqlite_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    user_doc['id'],
                    user_doc['email'],
                    user_doc['password'],
                    user_doc['name'],
                    user_doc['role'],
                    user_doc['created_at'],
                ),
            )
            conn.commit()
            return cursor.rowcount > 0
    except sqlite3.IntegrityError as e:
        logger.error(f"Failed to insert user: {e}")
        raise
    except Exception as e:
        logger.error(f"Database error during user insert: {e}")
        raise


def _get_sqlite_user(email: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, email, password, name, role, created_at, avatar_url, profile_data, updated_at FROM users WHERE email = ?",
            (email,),
        )
        return _row_to_dict(cursor.fetchone())


async def store_sqlite_user(user_doc: dict):
    await asyncio.to_thread(_insert_sqlite_user, user_doc)


async def fetch_sqlite_user(email: str) -> Optional[dict]:
    return await asyncio.to_thread(_get_sqlite_user, email)


def _get_sqlite_user_public_by_id(user_id: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, email, name, role, created_at, avatar_url, profile_data, updated_at FROM users WHERE id = ?",
            (user_id,),
        )
        return _row_to_dict(cursor.fetchone())


async def fetch_sqlite_user_public_by_id(user_id: str) -> Optional[dict]:
    return await asyncio.to_thread(_get_sqlite_user_public_by_id, user_id)


def _update_sqlite_user_profile(user_id: str, name: Optional[str], profile_data: Optional[dict]):
    updated_at = datetime.now(timezone.utc).isoformat()
    profile_json = json.dumps(profile_data) if profile_data is not None else None

    with _sqlite_connection() as conn:
        if name is not None and profile_data is not None:
            conn.execute(
                "UPDATE users SET name = ?, profile_data = ?, updated_at = ? WHERE id = ?",
                (name, profile_json, updated_at, user_id),
            )
        elif name is not None:
            conn.execute(
                "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
                (name, updated_at, user_id),
            )
        elif profile_data is not None:
            conn.execute(
                "UPDATE users SET profile_data = ?, updated_at = ? WHERE id = ?",
                (profile_json, updated_at, user_id),
            )
        else:
            return
        conn.commit()


async def update_sqlite_user_profile(user_id: str, name: Optional[str], profile_data: Optional[dict]):
    await asyncio.to_thread(_update_sqlite_user_profile, user_id, name, profile_data)


def _update_sqlite_user_avatar(user_id: str, avatar_url: str):
    updated_at = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?",
            (avatar_url, updated_at, user_id),
        )
        conn.commit()


async def update_sqlite_user_avatar(user_id: str, avatar_url: str):
    await asyncio.to_thread(_update_sqlite_user_avatar, user_id, avatar_url)


def _insert_learning_history(history_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO learning_history (id, user_id, topic, difficulty, question, response, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                history_doc['id'],
                history_doc['user_id'],
                history_doc.get('topic'),
                history_doc.get('difficulty'),
                history_doc.get('question'),
                history_doc.get('response'),
                history_doc['created_at'],
            ),
        )


def _insert_tutor_context(context_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO tutor_contexts (id, user_id, kind, source_name, source_url, text_content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                context_doc["id"],
                context_doc["user_id"],
                context_doc["kind"],
                context_doc.get("source_name"),
                context_doc.get("source_url"),
                context_doc["text_content"],
                context_doc["created_at"],
            ),
        )
        conn.commit()


def _select_tutor_contexts_by_ids(user_id: str, context_ids: List[str]) -> List[dict]:
    if not context_ids:
        return []
    # Limit number of contexts fetched to avoid huge prompts
    ids = [str(x) for x in context_ids if x]
    ids = ids[:10]
    placeholders = ",".join(["?"] * len(ids))
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            f"SELECT id, user_id, kind, source_name, source_url, text_content, created_at FROM tutor_contexts WHERE user_id = ? AND id IN ({placeholders}) ORDER BY created_at DESC",
            (user_id, *ids),
        )
        rows = cursor.fetchall()
    return [dict(r) for r in rows]


async def store_tutor_context(context_doc: dict):
    await asyncio.to_thread(_insert_tutor_context, context_doc)


async def fetch_tutor_contexts_by_ids(user_id: str, context_ids: List[str]) -> List[dict]:
    return await asyncio.to_thread(_select_tutor_contexts_by_ids, user_id, context_ids)


def _extract_text_from_pdf_bytes(contents: bytes) -> str:
    pdf_file = io.BytesIO(contents)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text_content = ""
    for page in pdf_reader.pages:
        try:
            text_content += (page.extract_text() or "") + "\n"
        except Exception:
            continue
    return text_content.strip()


def _extract_text_from_docx_bytes(contents: bytes) -> str:
    try:
        from docx import Document  # python-docx
    except Exception:
        raise RuntimeError("DOCX support requires 'python-docx' package")

    doc = Document(io.BytesIO(contents))
    parts: List[str] = []
    for p in doc.paragraphs:
        t = (p.text or "").strip()
        if t:
            parts.append(t)
    return "\n".join(parts).strip()


def _extract_text_from_image_bytes(contents: bytes) -> str:
    """Best-effort OCR.

    - First tries pytesseract (requires system Tesseract + Pillow).
    - If not available, returns empty string (caller can decide fallback).
    """
    try:
        from PIL import Image
        import pytesseract
        from pytesseract import TesseractNotFoundError
    except Exception:
        return ""

    tesseract_cmd = _detect_tesseract_cmd()
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    # Detect missing system Tesseract early for a clearer error.
    try:
        _ = pytesseract.get_tesseract_version()
    except TesseractNotFoundError:
        raise RuntimeError(
            "OCR is not configured (Tesseract not found). Install Tesseract OCR and add it to PATH, "
            "or set TESSERACT_CMD to the full path of tesseract.exe (e.g. C:/Program Files/Tesseract-OCR/tesseract.exe)."
        )
    except Exception:
        # If version check fails for some other reason, keep best-effort behavior.
        pass

    try:
        img = Image.open(io.BytesIO(contents))
        # Ensure a common color mode for OCR
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img, lang=TESSERACT_LANG)
        return (text or "").strip()
    except Exception:
        return ""


def _youtube_video_id(url: str) -> Optional[str]:
    if not url:
        return None
    s = str(url).strip()
    # youtu.be/<id>
    m = re.search(r"youtu\.be\/([A-Za-z0-9_-]{6,})", s)
    if m:
        return m.group(1)
    # youtube.com/watch?v=<id>
    m = re.search(r"[?&]v=([A-Za-z0-9_-]{6,})", s)
    if m:
        return m.group(1)
    # youtube.com/shorts/<id>
    m = re.search(r"youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})", s)
    if m:
        return m.group(1)
    return None


def _truncate_text(text: str, max_chars: int) -> str:
    if not text:
        return ""
    s = str(text)
    if len(s) <= max_chars:
        return s
    return s[:max_chars] + "\n... (truncated)"


def _insert_code_evaluation(eval_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO code_evaluations (id, user_id, problem_id, topic, difficulty, solve_time_seconds, code, language, evaluation, passed, suggestions, score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                eval_doc['id'],
                eval_doc['user_id'],
                eval_doc['problem_id'],
                eval_doc.get('topic'),
                eval_doc.get('difficulty'),
                eval_doc.get('solve_time_seconds'),
                eval_doc['code'],
                eval_doc['language'],
                eval_doc['evaluation'],
                1 if eval_doc['passed'] else 0,
                eval_doc['suggestions'],
                eval_doc['score'],
                eval_doc['created_at'],
            ),
        )


def _insert_course_enrollment(enrollment_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO course_enrollments (id, user_id, course_id, course_title, enrollment_date, status, name, email, phone, address, qualification, experience, screenshot_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                enrollment_doc['id'],
                enrollment_doc['user_id'],
                enrollment_doc['course_id'],
                enrollment_doc['course_title'],
                enrollment_doc['enrollment_date'],
                enrollment_doc.get('status', 'enrolled'),
                enrollment_doc.get('name'),
                enrollment_doc.get('email'),
                enrollment_doc.get('phone'),
                enrollment_doc.get('address'),
                enrollment_doc.get('qualification'),
                enrollment_doc.get('experience'),
                enrollment_doc.get('screenshot_url'),
            ),
        )


def _insert_internship_application(application_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO internship_applications (id, user_id, internship_id, internship_title, application_date, status, company, location, duration, name, email, phone, address, qualification, experience, screenshot_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                application_doc['id'],
                application_doc['user_id'],
                application_doc['internship_id'],
                application_doc['internship_title'],
                application_doc['application_date'],
                application_doc.get('status', 'applied'),
                application_doc.get('company'),
                application_doc.get('location'),
                application_doc.get('duration'),
                application_doc.get('name'),
                application_doc.get('email'),
                application_doc.get('phone'),
                application_doc.get('address'),
                application_doc.get('qualification'),
                application_doc.get('experience'),
                application_doc.get('screenshot_url'),
            ),
        )


def _fetch_course_enrollments() -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, course_id, course_title, enrollment_date, status, name, email, phone, address, qualification, experience, screenshot_url FROM course_enrollments ORDER BY enrollment_date DESC"
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


def _update_enrollment_status(enrollment_id: str, status: str):
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE course_enrollments SET status = ? WHERE id = ?",
            (status, enrollment_id),
        )


def _fetch_internship_applications() -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, internship_id, internship_title, application_date, status, company, location, duration, name, email, phone, address, qualification, experience, screenshot_url FROM internship_applications ORDER BY application_date DESC"
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


def _update_application_status(application_id: str, status: str):
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE internship_applications SET status = ? WHERE id = ?",
            (status, application_id),
        )


def _fetch_user_enrollments(user_id: str) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, course_id, course_title, enrollment_date, status FROM course_enrollments WHERE user_id = ?",
            (user_id,)
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


def _fetch_user_applications(user_id: str) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, internship_id, internship_title, application_date, status FROM internship_applications WHERE user_id = ?",
            (user_id,)
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


def _fetch_code_submissions(user_id: str, limit: int = 100) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, problem_id, topic, difficulty, solve_time_seconds, code, language, evaluation, passed, suggestions, score, created_at FROM code_evaluations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()
    submissions = [dict(row) for row in rows]
    for entry in submissions:
        entry['passed'] = bool(entry.get('passed'))
    return submissions


def _delete_code_submission(user_id: str, submission_id: str) -> bool:
    with _sqlite_connection() as conn:
        cur = conn.execute(
            "DELETE FROM code_evaluations WHERE id = ? AND user_id = ?",
            (submission_id, user_id),
        )
        conn.commit()
        return bool(cur.rowcount and cur.rowcount > 0)


def _count_table_rows(table: str, user_id: str) -> int:
    with _sqlite_connection() as conn:
        cursor = conn.execute(f"SELECT COUNT(*) as total FROM {table} WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
    return row['total'] if row else 0


def _get_avg_code_score(user_id: str) -> float:
    with _sqlite_connection() as conn:
        cursor = conn.execute("SELECT AVG(score) as avg_score FROM code_evaluations WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
    avg = row['avg_score']
    return float(avg) if avg is not None else 0.0


def _get_avg_resume_credibility(user_id: str) -> float:
    with _sqlite_connection() as conn:
        cursor = conn.execute("SELECT AVG(credibility_score) as avg_score FROM resume_analyses WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
    avg = row['avg_score']
    return float(avg) if avg is not None else 0.0


def _get_avg_interview_readiness(user_id: str) -> float:
    with _sqlite_connection() as conn:
        cursor = conn.execute("SELECT AVG(readiness_score) as avg_score FROM interview_evaluations WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
    avg = row['avg_score']
    return float(avg) if avg is not None else 0.0


def _calculate_learning_consistency(user_id: str) -> float:
    # Calculate learning consistency based on recent activity
    # For simplicity, we'll use the number of learning sessions in the last 30 days
    # Normalized to a score out of 100
    with _sqlite_connection() as conn:
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        cursor = conn.execute("SELECT COUNT(*) as count FROM learning_history WHERE user_id = ? AND created_at >= ?", (user_id, thirty_days_ago))
        row = cursor.fetchone()
        count = row['count']
        # Assume 30 sessions in 30 days is perfect consistency (100)
        # Scale accordingly, cap at 100
        return min(count * (100.0 / 30.0), 100.0)


def _parse_iso_datetime(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None


def _calculate_learning_streak_stats(user_id: str) -> dict:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT created_at FROM learning_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5000",
            (user_id,),
        )
        rows = cursor.fetchall()

    # sqlite3.Row supports dict-style indexing (row["col"]) but not .get()
    timestamps = [r["created_at"] for r in rows if r and r["created_at"]]
    datetimes = [dt for dt in (_parse_iso_datetime(ts) for ts in timestamps) if dt]
    if not datetimes:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "active_days_30": 0,
            "last_activity_at": None,
        }

    # Normalize to UTC date
    dates = {dt.astimezone(timezone.utc).date() for dt in datetimes}
    today = datetime.now(timezone.utc).date()

    # Current streak
    current = 0
    d = today
    while d in dates:
        current += 1
        d = d - timedelta(days=1)

    # Longest streak
    sorted_dates = sorted(dates)
    longest = 1
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    thirty_days_ago = today - timedelta(days=29)
    active_30 = sum(1 for day in dates if day >= thirty_days_ago)
    last_activity_at = max(datetimes).astimezone(timezone.utc).isoformat()

    return {
        "current_streak": int(current),
        "longest_streak": int(longest),
        "active_days_30": int(active_30),
        "last_activity_at": last_activity_at,
    }


async def get_learning_streak_stats(user_id: str) -> dict:
    return await asyncio.to_thread(_calculate_learning_streak_stats, user_id)


async def store_learning_history(history_doc: dict):
    await asyncio.to_thread(_insert_learning_history, history_doc)


async def store_course_enrollment(enrollment_doc: dict):
    await asyncio.to_thread(_insert_course_enrollment, enrollment_doc)


async def store_internship_application(application_doc: dict):
    await asyncio.to_thread(_insert_internship_application, application_doc)


async def store_code_evaluation(eval_doc: dict):
    await asyncio.to_thread(_insert_code_evaluation, eval_doc)


async def get_user_code_submissions(user_id: str) -> List[dict]:
    return await asyncio.to_thread(_fetch_code_submissions, user_id)


async def fetch_code_submissions(user_id: str, limit: int = 100) -> List[dict]:
    return await asyncio.to_thread(_fetch_code_submissions, user_id, limit)


async def count_code_submissions(user_id: str) -> int:
    return await asyncio.to_thread(_count_table_rows, "code_evaluations", user_id)


async def count_resume_analyses(user_id: str) -> int:
    return await asyncio.to_thread(_count_table_rows, "resume_analyses", user_id)


async def count_interview_evaluations(user_id: str) -> int:
    return await asyncio.to_thread(_count_table_rows, "interview_evaluations", user_id)


async def count_learning_sessions(user_id: str) -> int:
    return await asyncio.to_thread(_count_table_rows, "learning_history", user_id)


async def get_avg_code_score(user_id: str) -> float:
    return await asyncio.to_thread(_get_avg_code_score, user_id)


async def get_avg_resume_credibility(user_id: str) -> float:
    return await asyncio.to_thread(_get_avg_resume_credibility, user_id)


async def get_avg_interview_readiness(user_id: str) -> float:
    return await asyncio.to_thread(_get_avg_interview_readiness, user_id)


async def calculate_learning_consistency(user_id: str) -> float:
    return await asyncio.to_thread(_calculate_learning_consistency, user_id)


async def calculate_career_readiness_score(user_id: str) -> float:
    # Calculate CRS based on weighted average of components
    coding_score = await get_avg_code_score(user_id)
    resume_score = await get_avg_resume_credibility(user_id)
    interview_score = await get_avg_interview_readiness(user_id)
    learning_score = await calculate_learning_consistency(user_id)
    
    # Weights: coding 30%, resume 25%, interview 25%, learning 20%
    crs = (coding_score * 0.3) + (resume_score * 0.25) + (interview_score * 0.25) + (learning_score * 0.2)
    return round(crs, 2)


def _insert_resume_analysis(doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO resume_analyses (id, user_id, filename, file_url, text_content, credibility_score, projects_score, skills_score, experience_score, ats_score, fake_skills, suggestions, analysis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                doc['id'],
                doc['user_id'],
                doc.get('filename'),
                doc.get('file_url'),
                doc.get('text_content'),
                doc.get('credibility_score'),
                doc.get('projects_score'),
                doc.get('skills_score'),
                doc.get('experience_score'),
                doc.get('ats_score'),
                json.dumps(doc.get('fake_skills', [])),
                json.dumps(doc.get('suggestions', [])),
                doc.get('analysis'),
                doc['created_at'],
            ),
        )


def _row_to_resume(doc: sqlite3.Row) -> dict:
    row = dict(doc)
    row['fake_skills'] = json.loads(row['fake_skills']) if row.get('fake_skills') else []
    row['suggestions'] = json.loads(row['suggestions']) if row.get('suggestions') else []
    return row


def _fetch_resume_history(user_id: str, limit: int = 50) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, filename, file_url, text_content, credibility_score, projects_score, skills_score, experience_score, ats_score, fake_skills, suggestions, analysis, created_at FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()
    return [_row_to_resume(row) for row in rows]


def _get_latest_resume(user_id: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, filename, file_url, text_content, credibility_score, projects_score, skills_score, experience_score, ats_score, fake_skills, suggestions, analysis, created_at FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        )
        row = cursor.fetchone()
    if not row:
        return None
    return _row_to_resume(row)


async def store_resume_analysis(doc: dict):
    await asyncio.to_thread(_insert_resume_analysis, doc)


async def fetch_resume_history(user_id: str) -> List[dict]:
    return await asyncio.to_thread(_fetch_resume_history, user_id)


async def fetch_latest_resume(user_id: str) -> Optional[dict]:
    return await asyncio.to_thread(_get_latest_resume, user_id)


def _row_to_interview(doc: sqlite3.Row) -> dict:
    row = dict(doc)
    row["questions"] = json.loads(row["questions"]) if row.get("questions") else []
    row["answers"] = json.loads(row["answers"]) if row.get("answers") else []
    row["strengths"] = json.loads(row["strengths"]) if row.get("strengths") else []
    row["weaknesses"] = json.loads(row["weaknesses"]) if row.get("weaknesses") else []
    return row


def _fetch_interview_history(user_id: str, limit: int = 50) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, interview_type, questions, answers, evaluation, readiness_score, confidence_score, communication_score, technical_depth_score, strengths, weaknesses, created_at FROM interview_evaluations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()
    return [_row_to_interview(row) for row in rows]


async def fetch_interview_history(user_id: str, limit: int = 50) -> List[dict]:
    return await asyncio.to_thread(_fetch_interview_history, user_id, limit)


def _insert_interview_evaluation(eval_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO interview_evaluations (id, user_id, interview_type, questions, answers, evaluation, readiness_score, confidence_score, communication_score, technical_depth_score, strengths, weaknesses, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                eval_doc['id'],
                eval_doc['user_id'],
                eval_doc.get('interview_type'),
                json.dumps(eval_doc.get('questions', [])),
                json.dumps(eval_doc.get('answers', [])),
                eval_doc.get('evaluation'),
                eval_doc.get('readiness_score'),
                eval_doc.get('confidence_score'),
                eval_doc.get('communication_score'),
                eval_doc.get('technical_depth_score'),
                json.dumps(eval_doc.get('strengths', [])),
                json.dumps(eval_doc.get('weaknesses', [])),
                eval_doc['created_at'],
            ),
        )


def _clamp_0_100(value: Any) -> float:
    try:
        v = float(value)
    except Exception:
        v = 0.0
    return max(0.0, min(100.0, v))


def _normalize_text(value: Optional[str]) -> str:
    return (value or "").lower()


def _infer_resume_section_scores(text_content: Optional[str]) -> dict:
    text = _normalize_text(text_content)
    if not text.strip():
        return {"projects": 0, "skills": 0, "experience": 0, "ats": 0}

    def score_for(section_keywords: List[str], base: int) -> int:
        hits = sum(1 for k in section_keywords if k in text)
        return max(0, min(100, base + hits * 15))

    projects = score_for(["project", "github", "portfolio", "demo", "capstone"], 35)
    skills = score_for(["skills", "python", "java", "react", "sql", "aws", "docker"], 30)
    experience = score_for(["experience", "intern", "internship", "work", "employment"], 25)
    ats = score_for(["achievements", "metrics", "%", "impact", "results", "keywords"], 25)
    return {"projects": projects, "skills": skills, "experience": experience, "ats": ats}


def _extract_known_skills(user_profile_data: Optional[str], resume_text: Optional[str], learning_topics: List[str]) -> List[str]:
    skills = set()

    if user_profile_data:
        try:
            pd = json.loads(user_profile_data)
            for key in ["skills", "tech", "technologies", "stack"]:
                val = pd.get(key)
                if isinstance(val, list):
                    for s in val:
                        if isinstance(s, str) and s.strip():
                            skills.add(s.strip().lower())
                elif isinstance(val, str):
                    for s in val.split(","):
                        if s.strip():
                            skills.add(s.strip().lower())
        except Exception:
            pass

    text = _normalize_text(resume_text)
    keyword_bank = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "node",
        "express",
        "fastapi",
        "sql",
        "mongodb",
        "sqlite",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "git",
        "dsa",
        "system design",
        "ml",
        "machine learning",
        "pandas",
        "numpy",
        "power bi",
        "excel",
    ]
    for kw in keyword_bank:
        if kw in text:
            skills.add(kw)

    for topic in learning_topics:
        if isinstance(topic, str) and topic.strip():
            skills.add(topic.strip().lower())

    return sorted(skills)


def _role_profiles() -> List[dict]:
    return [
        {"role": "Frontend Developer", "required_skills": ["javascript", "react"], "min": {"coding": 60, "resume": 60, "interview": 50, "learning": 40}},
        {"role": "Backend Developer", "required_skills": ["python", "fastapi", "sql"], "min": {"coding": 60, "resume": 60, "interview": 50, "learning": 40}},
        {"role": "Full-Stack Developer", "required_skills": ["react", "api", "sql"], "min": {"coding": 65, "resume": 65, "interview": 55, "learning": 45}},
        {"role": "Data Analyst", "required_skills": ["sql", "excel", "power bi"], "min": {"coding": 45, "resume": 60, "interview": 45, "learning": 40}},
        {"role": "Data Scientist", "required_skills": ["python", "pandas", "machine learning", "sql"], "min": {"coding": 60, "resume": 65, "interview": 55, "learning": 45}},
        {"role": "ML Engineer", "required_skills": ["python", "machine learning", "docker"], "min": {"coding": 65, "resume": 65, "interview": 55, "learning": 45}},
        {"role": "DevOps Engineer", "required_skills": ["docker", "kubernetes", "aws"], "min": {"coding": 50, "resume": 60, "interview": 50, "learning": 45}},
    ]


def _compute_role_eligibility(breakdown: dict, known_skills: List[str]) -> List[dict]:
    coding = _clamp_0_100(breakdown.get("coding", {}).get("score", 0))
    resume = _clamp_0_100(breakdown.get("resume", {}).get("score", 0))
    interview = _clamp_0_100(breakdown.get("interview", {}).get("score", 0))
    learning = _clamp_0_100(breakdown.get("learning", {}).get("score", 0))

    skills_set = set((s or "").lower() for s in known_skills)
    results = []

    for profile in _role_profiles():
        req = [s.lower() for s in profile["required_skills"]]
        missing = [s for s in req if s not in skills_set]
        skill_match = 1.0 - (len(missing) / max(1, len(req)))

        mins = profile["min"]
        component_fit = (
            min(1.0, coding / max(1, mins["coding"]))
            * min(1.0, resume / max(1, mins["resume"]))
            * min(1.0, interview / max(1, mins["interview"]))
            * min(1.0, learning / max(1, mins["learning"]))
        )

        eligibility = round(_clamp_0_100((skill_match * 0.55 + component_fit * 0.45) * 100), 1)

        actions = []
        if coding < mins["coding"]:
            actions.append("Practice coding daily (2 Medium problems)")
        if resume < mins["resume"]:
            actions.append("Improve resume bullets with metrics")
        if interview < mins["interview"]:
            actions.append("Complete 2 mock interviews this week")
        if missing:
            actions.append(f"Learn missing skills: {', '.join(missing[:4])}")
        if not actions:
            actions.append("Maintain momentum and apply to roles")

        results.append(
            {
                "role": profile["role"],
                "eligibility_percentage": eligibility,
                "missing_skills": missing,
                "required_improvement_actions": actions[:4],
                "resume_match_score": round(resume, 1),
                "interview_readiness_score": round(interview, 1),
            }
        )

    results.sort(key=lambda r: r.get("eligibility_percentage", 0), reverse=True)
    return results


def _job_search_links(role: str, location: str) -> List[dict]:
    from urllib.parse import quote_plus

    q = quote_plus(f"{role} {location} entry level")
    return [
        {"source": "LinkedIn", "title": f"{role} jobs on LinkedIn", "url": f"https://www.linkedin.com/jobs/search/?keywords={q}"},
        {"source": "Indeed", "title": f"{role} jobs on Indeed", "url": f"https://in.indeed.com/jobs?q={q}"},
        {"source": "Wellfound", "title": f"{role} jobs on Wellfound", "url": f"https://wellfound.com/jobs?search={q}"},
    ]


def _today_iso_date() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _select_daily_action_lock(user_id: str, action_date: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        row = conn.execute(
            "SELECT action_json FROM daily_action_locks WHERE user_id = ? AND action_date = ? ORDER BY created_at DESC LIMIT 1",
            (user_id, action_date),
        ).fetchone()
    if not row:
        return None
    try:
        return json.loads(row["action_json"])
    except Exception:
        return None


def _insert_daily_action_lock(user_id: str, action_date: str, action: dict) -> dict:
    lock_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO daily_action_locks (id, user_id, action_date, action_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (lock_id, user_id, action_date, json.dumps(action), now),
        )
        conn.commit()
    return action


def _week_start_monday_iso_date(now: Optional[datetime] = None) -> str:
    dt = now or datetime.now(timezone.utc)
    d = dt.date()
    # Monday=0..Sunday=6
    monday = d - timedelta(days=d.weekday())
    return monday.isoformat()


def _select_weekly_checklist_state(user_id: str, week_start: str) -> dict:
    with _sqlite_connection() as conn:
        row = conn.execute(
            "SELECT done_json FROM weekly_checklist_states WHERE user_id = ? AND week_start = ? LIMIT 1",
            (user_id, week_start),
        ).fetchone()
    if not row:
        return {}
    try:
        parsed = json.loads(row["done_json"])
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _upsert_weekly_checklist_state(user_id: str, week_start: str, done_map: dict) -> dict:
    state_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    payload = done_map if isinstance(done_map, dict) else {}
    with _sqlite_connection() as conn:
        conn.execute(
            """
            INSERT INTO weekly_checklist_states (id, user_id, week_start, done_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, week_start)
            DO UPDATE SET done_json = excluded.done_json, updated_at = excluded.updated_at
            """,
            (state_id, user_id, week_start, json.dumps(payload), now, now),
        )
        conn.commit()
    return payload


def _patch_weekly_checklist_item(user_id: str, week_start: str, item_id: str, done: bool) -> dict:
    current = _select_weekly_checklist_state(user_id, week_start)
    next_map = dict(current) if isinstance(current, dict) else {}
    next_map[str(item_id)] = bool(done)
    return _upsert_weekly_checklist_state(user_id, week_start, next_map)


def _compute_streak_from_dates(dates: List[date]) -> dict:
    unique_days = sorted(set([d for d in dates if isinstance(d, date)]))
    if not unique_days:
        return {"current": 0, "longest": 0, "last_day": None}

    longest = 1
    run = 1
    for i in range(1, len(unique_days)):
        if (unique_days[i] - unique_days[i - 1]).days == 1:
            run += 1
        else:
            longest = max(longest, run)
            run = 1
    longest = max(longest, run)

    last_day = unique_days[-1]
    current = 1
    d = last_day
    day_set = set(unique_days)
    while (d - timedelta(days=1)) in day_set:
        current += 1
        d = d - timedelta(days=1)

    return {"current": int(current), "longest": int(longest), "last_day": last_day}


def _get_coding_streak_for_ui(user_id: str, now: Optional[datetime] = None) -> dict:
    dt = now or datetime.now(timezone.utc)
    submissions = _fetch_code_submissions(user_id, 500)

    solved_datetimes: List[datetime] = []
    for s in submissions:
        try:
            if not bool(s.get("passed")):
                continue
            created_at = s.get("created_at")
            if not created_at:
                continue
            # created_at is stored as ISO string; treat as UTC.
            solved_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            if solved_dt.tzinfo is None:
                solved_dt = solved_dt.replace(tzinfo=timezone.utc)
            solved_datetimes.append(solved_dt.astimezone(timezone.utc))
        except Exception:
            continue

    if not solved_datetimes:
        return {
            "current_streak": 0,
            "display_current_streak": 0,
            "longest_streak": 0,
            "last_solved_at": None,
        }

    last_solved_at = max(solved_datetimes)
    day_list = [d.date() for d in solved_datetimes]
    streak = _compute_streak_from_dates(day_list)

    display_current = streak["current"]
    if (dt - last_solved_at) > timedelta(hours=24):
        display_current = 0

    return {
        "current_streak": int(streak["current"]),
        "display_current_streak": int(display_current),
        "longest_streak": int(streak["longest"]),
        "last_solved_at": last_solved_at.isoformat(),
    }


def _insert_snapshot_if_missing(user_id: str, snapshot_date: str, readiness_score: float, breakdown: dict) -> None:
    with _sqlite_connection() as conn:
        exists = conn.execute(
            "SELECT 1 FROM career_readiness_snapshots WHERE user_id = ? AND snapshot_date = ? LIMIT 1",
            (user_id, snapshot_date),
        ).fetchone()
        if exists:
            return
        snap_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "INSERT INTO career_readiness_snapshots (id, user_id, snapshot_date, readiness_score, breakdown_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (snap_id, user_id, snapshot_date, float(readiness_score), json.dumps(breakdown), now),
        )
        conn.commit()


def _fetch_snapshots(user_id: str, days: int = 30) -> List[dict]:
    days = max(1, min(int(days), 365))
    with _sqlite_connection() as conn:
        rows = conn.execute(
            "SELECT snapshot_date, readiness_score, breakdown_json FROM career_readiness_snapshots WHERE user_id = ? ORDER BY snapshot_date DESC LIMIT ?",
            (user_id, days),
        ).fetchall()
    items: List[dict] = []
    for r in rows:
        try:
            breakdown = json.loads(r["breakdown_json"]) if r["breakdown_json"] else None
        except Exception:
            breakdown = None
        items.append({"date": r["snapshot_date"], "readiness_score": float(r["readiness_score"]), "breakdown": breakdown})
    return list(reversed(items))


def _fetch_distinct_learning_topics(user_id: str, limit: int = 200) -> List[str]:
    with _sqlite_connection() as conn:
        rows = conn.execute(
            "SELECT topic FROM learning_history WHERE user_id = ? AND topic IS NOT NULL AND TRIM(topic) != '' ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
    seen = []
    for r in rows:
        t = (r["topic"] or "").strip()
        if t and t not in seen:
            seen.append(t)
    return seen


def _fetch_activity_dates(user_id: str, days: int = 120) -> List[datetime]:
    days = max(7, min(int(days), 365))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    with _sqlite_connection() as conn:
        rows = conn.execute(
            """
            SELECT created_at FROM learning_history WHERE user_id = ? AND created_at >= ?
            UNION ALL
            SELECT created_at FROM code_evaluations WHERE user_id = ? AND created_at >= ?
            UNION ALL
            SELECT created_at FROM resume_analyses WHERE user_id = ? AND created_at >= ?
            UNION ALL
            SELECT created_at FROM interview_evaluations WHERE user_id = ? AND created_at >= ?
            UNION ALL
            SELECT created_at FROM activity_events WHERE user_id = ? AND created_at >= ?
            """,
            (user_id, cutoff, user_id, cutoff, user_id, cutoff, user_id, cutoff, user_id, cutoff),
        ).fetchall()
    dts: List[datetime] = []
    for r in rows:
        dt = _parse_iso_datetime(r["created_at"]) if r and r["created_at"] else None
        if dt:
            dts.append(dt.astimezone(timezone.utc))
    return dts


def _compute_activity_tracking(dts: List[datetime]) -> dict:
    if not dts:
        return {
            "daily_login_activity": 0,
            "active_days_7": 0,
            "active_days_30": 0,
            "active_days_90": 0,
            "missed_learning_days_30": 30,
            "last_activity_at": None,
        }

    dates = {dt.date() for dt in dts}
    today = datetime.now(timezone.utc).date()
    last_activity_at = max(dts).isoformat()

    def active_in(window_days: int) -> int:
        start = today - timedelta(days=window_days - 1)
        return sum(1 for d in dates if d >= start)

    active_7 = active_in(7)
    active_30 = active_in(30)
    active_90 = active_in(90)
    missed_30 = max(0, 30 - active_30)
    # Daily login activity is approximated as "did something today"
    daily_login = 1 if today in dates else 0

    return {
        "daily_login_activity": daily_login,
        "active_days_7": int(active_7),
        "active_days_30": int(active_30),
        "active_days_90": int(active_90),
        "missed_learning_days_30": int(missed_30),
        "last_activity_at": last_activity_at,
    }


def _insert_activity_event(user_id: str, event: ActivityEvent) -> None:
    event_type = (event.event_type or "").strip()[:50]
    if not event_type:
        raise ValueError("event_type is required")

    path = (event.path or "").strip()[:512] or None
    duration_seconds = None
    if event.duration_seconds is not None:
        try:
            duration_seconds = int(event.duration_seconds)
        except Exception:
            duration_seconds = None
        if duration_seconds is not None:
            duration_seconds = max(0, min(duration_seconds, 24 * 60 * 60))

    metadata_json = None
    if event.metadata is not None:
        try:
            metadata_json = json.dumps(event.metadata)
        except Exception:
            metadata_json = None

    event_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO activity_events (id, user_id, event_type, path, duration_seconds, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (event_id, user_id, event_type, path, duration_seconds, metadata_json, created_at),
        )
        conn.commit()


def _fetch_login_streak_row(user_id: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        row = conn.execute(
            "SELECT user_id, current_streak, longest_streak, last_login_at, updated_at FROM login_streaks WHERE user_id = ?",
            (user_id,),
        ).fetchone()
    if not row:
        return None
    return {
        "user_id": row["user_id"],
        "current_streak": int(row["current_streak"] or 0),
        "longest_streak": int(row["longest_streak"] or 0),
        "last_login_at": row["last_login_at"],
        "updated_at": row["updated_at"],
    }


def _update_login_streak_on_login(user_id: str, now: Optional[datetime] = None) -> dict:
    """Update and return login streak stats for a user.

    Rules:
    - First login => current=1, longest=1
    - If last login was <=24h ago => keep current (no increment)
    - If last login was >24h and <=48h ago => current += 1
    - If last login was >48h ago => reset to 1
    UI can show "real-time" by displaying 0 when now-last_login_at > 24h.
    """
    now_dt = now or datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    row = _fetch_login_streak_row(user_id)

    if not row or not row.get("last_login_at"):
        current = 1
        longest = 1
        last_login_at = now_iso
    else:
        last_dt = _parse_iso_datetime(row.get("last_login_at"))
        if not last_dt:
            current = 1
            longest = max(1, int(row.get("longest_streak") or 0))
            last_login_at = now_iso
        else:
            last_dt = last_dt.astimezone(timezone.utc)
            delta = now_dt - last_dt
            prev_current = int(row.get("current_streak") or 0)
            prev_longest = int(row.get("longest_streak") or 0)

            if delta <= timedelta(hours=24):
                current = max(1, prev_current)
            elif delta <= timedelta(hours=48):
                current = max(1, prev_current) + 1
            else:
                current = 1

            longest = max(prev_longest, current)
            last_login_at = now_iso

    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO login_streaks (user_id, current_streak, longest_streak, last_login_at, updated_at) VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(user_id) DO UPDATE SET current_streak=excluded.current_streak, longest_streak=excluded.longest_streak, last_login_at=excluded.last_login_at, updated_at=excluded.updated_at",
            (user_id, int(current), int(longest), last_login_at, now_iso),
        )
        conn.commit()

    return {
        "current_streak": int(current),
        "longest_streak": int(longest),
        "last_login_at": last_login_at,
        "updated_at": now_iso,
    }


def _get_login_streak_for_ui(user_id: str) -> dict:
    """Return login streak stats plus a 'display_current_streak' that auto-zeros after 24h."""
    now_dt = datetime.now(timezone.utc)
    row = _fetch_login_streak_row(user_id) or {
        "current_streak": 0,
        "longest_streak": 0,
        "last_login_at": None,
    }
    last_login_at = row.get("last_login_at")
    display_current = int(row.get("current_streak") or 0)
    if last_login_at:
        last_dt = _parse_iso_datetime(last_login_at)
        if last_dt:
            last_dt = last_dt.astimezone(timezone.utc)
            if now_dt - last_dt > timedelta(hours=24):
                display_current = 0
        else:
            display_current = 0
    else:
        display_current = 0

    return {
        "current_streak": int(row.get("current_streak") or 0),
        "display_current_streak": int(display_current),
        "longest_streak": int(row.get("longest_streak") or 0),
        "last_login_at": last_login_at,
    }


def _fetch_time_spent_seconds(user_id: str, days: int = 30) -> int:
    days = max(1, min(int(days), 365))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    with _sqlite_connection() as conn:
        row = conn.execute(
            """
            SELECT COALESCE(SUM(COALESCE(duration_seconds, 0)), 0) AS total
            FROM activity_events
            WHERE user_id = ? AND event_type = 'time_spent' AND created_at >= ?
            """,
            (user_id, cutoff),
        ).fetchone()
    try:
        return int(row["total"]) if row and row["total"] is not None else 0
    except Exception:
        return 0


def _fetch_page_analytics(user_id: str, days: int = 30, limit: int = 10) -> List[dict]:
    days = max(1, min(int(days), 365))
    limit = max(1, min(int(limit), 50))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    with _sqlite_connection() as conn:
        view_rows = conn.execute(
            """
            SELECT path, COUNT(*) AS views
            FROM activity_events
            WHERE user_id = ?
              AND event_type = 'page_view'
              AND created_at >= ?
              AND path IS NOT NULL
              AND TRIM(path) != ''
            GROUP BY path
            """,
            (user_id, cutoff),
        ).fetchall()

        time_rows = conn.execute(
            """
            SELECT path, COALESCE(SUM(COALESCE(duration_seconds, 0)), 0) AS time_spent_seconds
            FROM activity_events
            WHERE user_id = ?
              AND event_type = 'time_spent'
              AND created_at >= ?
              AND path IS NOT NULL
              AND TRIM(path) != ''
            GROUP BY path
            """,
            (user_id, cutoff),
        ).fetchall()

    merged: Dict[str, dict] = {}
    for r in view_rows or []:
        p = (r["path"] or "").strip()
        if not p:
            continue
        merged.setdefault(p, {"path": p, "views": 0, "time_spent_seconds": 0})
        try:
            merged[p]["views"] = int(r["views"] or 0)
        except Exception:
            merged[p]["views"] = 0

    for r in time_rows or []:
        p = (r["path"] or "").strip()
        if not p:
            continue
        merged.setdefault(p, {"path": p, "views": 0, "time_spent_seconds": 0})
        try:
            merged[p]["time_spent_seconds"] = int(r["time_spent_seconds"] or 0)
        except Exception:
            merged[p]["time_spent_seconds"] = 0

    items = list(merged.values())
    items.sort(key=lambda x: (int(x.get("views") or 0), int(x.get("time_spent_seconds") or 0)), reverse=True)
    return items[:limit]


def _normalize_apply_status(status: Optional[str]) -> str:
    s = (status or "planned").strip().lower()
    allowed = {"planned", "applied", "interview", "offer", "rejected"}
    return s if s in allowed else "planned"


def _upsert_apply_tracker_item(user_id: str, payload: ApplyTrackerCreate) -> dict:
    role = (payload.role or "").strip()[:120]
    source = (payload.source or "").strip()[:80]
    url = (payload.url or "").strip()[:2000]
    match_tag = (payload.match_tag or "").strip()[:80] or None
    status = _normalize_apply_status(payload.status)

    if not role or not source or not url:
        raise ValueError("role, source, and url are required")

    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        existing = conn.execute(
            "SELECT id, user_id, role, source, url, match_tag, status, created_at, updated_at FROM apply_tracker WHERE user_id = ? AND url = ? LIMIT 1",
            (user_id, url),
        ).fetchone()

        if existing:
            # Keep created_at, update status/match_tag/role/source if needed.
            conn.execute(
                "UPDATE apply_tracker SET role = ?, source = ?, match_tag = ?, status = ?, updated_at = ? WHERE id = ?",
                (role, source, match_tag, status, now, existing["id"]),
            )
            conn.commit()
            row = conn.execute(
                "SELECT id, user_id, role, source, url, match_tag, status, created_at, updated_at FROM apply_tracker WHERE id = ?",
                (existing["id"],),
            ).fetchone()
            return _row_to_dict(row) or {}

        item_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO apply_tracker (id, user_id, role, source, url, match_tag, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (item_id, user_id, role, source, url, match_tag, status, now, now),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, user_id, role, source, url, match_tag, status, created_at, updated_at FROM apply_tracker WHERE id = ?",
            (item_id,),
        ).fetchone()
        return _row_to_dict(row) or {}


def _list_apply_tracker_items(user_id: str, limit: int = 100) -> List[dict]:
    limit = max(1, min(int(limit), 300))
    with _sqlite_connection() as conn:
        rows = conn.execute(
            "SELECT id, user_id, role, source, url, match_tag, status, created_at, updated_at FROM apply_tracker WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
    return [dict(r) for r in rows]


def _update_apply_tracker_item(user_id: str, item_id: str, payload: ApplyTrackerUpdate) -> dict:
    item_id = (item_id or "").strip()
    if not item_id:
        raise ValueError("id is required")
    status = _normalize_apply_status(payload.status)
    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        row = conn.execute(
            "SELECT id FROM apply_tracker WHERE id = ? AND user_id = ? LIMIT 1",
            (item_id, user_id),
        ).fetchone()
        if not row:
            raise ValueError("Item not found")
        conn.execute(
            "UPDATE apply_tracker SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (status, now, item_id, user_id),
        )
        conn.commit()
        updated = conn.execute(
            "SELECT id, user_id, role, source, url, match_tag, status, created_at, updated_at FROM apply_tracker WHERE id = ? AND user_id = ?",
            (item_id, user_id),
        ).fetchone()
    return _row_to_dict(updated) or {}


def _delete_apply_tracker_item(user_id: str, item_id: str) -> None:
    item_id = (item_id or "").strip()
    if not item_id:
        raise ValueError("id is required")
    with _sqlite_connection() as conn:
        conn.execute(
            "DELETE FROM apply_tracker WHERE id = ? AND user_id = ?",
            (item_id, user_id),
        )
        conn.commit()


def _tracking_based_job_suggestions(
    roles: List[dict],
    location: str,
    prediction: dict,
    activity_tracking: dict,
    weak_topics: List[str],
) -> List[dict]:
    """Generate job suggestions (role + rationale + apply links) grounded in user tracking."""
    if not roles:
        return []

    biggest_blocker = (prediction or {}).get("biggest_blocker") or ""
    active_7 = None
    try:
        active_7 = int(activity_tracking.get("active_days_7"))
    except Exception:
        active_7 = None

    suggestions: List[dict] = []
    for r in roles[:3]:
        role_name = r.get("role")
        if not role_name:
            continue
        pct = float(r.get("eligibility_percentage") or 0)

        rationale_bits: List[str] = []
        if active_7 is not None:
            if active_7 >= 4:
                rationale_bits.append("Strong recent activity (active days last 7d)")
            elif active_7 <= 1:
                rationale_bits.append("Low recent activity — focus on quick wins to improve eligibility")

        if biggest_blocker:
            rationale_bits.append(f"Current blocker: {biggest_blocker}")

        if weak_topics:
            rationale_bits.append(f"Improve weak topics: {', '.join(weak_topics[:3])}")

        if not rationale_bits:
            rationale_bits.append("Based on your profile + readiness signals")

        suggestions.append(
            {
                "role": role_name,
                "eligibility_percentage": pct,
                "match_tag": "Highly Matched" if pct >= 80 else "Medium Match" if pct >= 60 else "Stretch Role",
                "rationale": " • ".join(rationale_bits),
                "apply_links": _job_search_links(str(role_name), str(location)),
                "missing_skills": r.get("missing_skills") or [],
                "recommended_actions": r.get("recommended_actions") or [],
            }
        )

    return suggestions


def _compute_crs_breakdown(coding_score: float, resume_score: float, interview_score: float, learning_score: float) -> dict:
    coding = _clamp_0_100(coding_score)
    resume = _clamp_0_100(resume_score)
    interview = _clamp_0_100(interview_score)
    learning = _clamp_0_100(learning_score)

    return {
        "coding": {"score": round(coding, 2), "weight": 30, "contribution": round(coding * 0.30, 2)},
        "resume": {"score": round(resume, 2), "weight": 25, "contribution": round(resume * 0.25, 2)},
        "interview": {"score": round(interview, 2), "weight": 25, "contribution": round(interview * 0.25, 2)},
        "learning": {"score": round(learning, 2), "weight": 20, "contribution": round(learning * 0.20, 2)},
    }


def _crs_level_badge(score: float) -> dict:
    s = _clamp_0_100(score)
    if s >= 85:
        return {"level": "Job-Ready"}
    if s >= 65:
        return {"level": "Intermediate"}
    if s >= 45:
        return {"level": "Beginner"}
    return {"level": "Novice"}


def _compute_prediction_and_action(readiness_score: float, breakdown: dict, last_activity_at: Optional[str]) -> dict:
    job_readiness = _clamp_0_100(readiness_score)
    coding = _clamp_0_100(breakdown.get("coding", {}).get("score", 0))
    resume = _clamp_0_100(breakdown.get("resume", {}).get("score", 0))
    interview = _clamp_0_100(breakdown.get("interview", {}).get("score", 0))
    learning = _clamp_0_100(breakdown.get("learning", {}).get("score", 0))

    inactive_days = None
    if last_activity_at:
        dt = _parse_iso_datetime(last_activity_at)
        if dt:
            inactive_days = int((datetime.now(timezone.utc) - dt.astimezone(timezone.utc)).total_seconds() // (60 * 60 * 24))

    base_days = round((100 - job_readiness) * 1.15)
    pace = 1.0
    if inactive_days is not None and inactive_days > 3:
        pace = 1.25
    elif learning >= 70:
        pace = 0.9
    elif learning < 40:
        pace = 1.1

    days_to_job_ready = int(min(180, max(30, round(base_days * pace))))

    biggest_blocker = "Maintain Momentum"
    if inactive_days is not None and inactive_days > 3:
        biggest_blocker = "Inactivity"
    elif resume < 80:
        biggest_blocker = "Resume Quality"
    elif interview < 70:
        biggest_blocker = "Interview Practice"
    elif coding < 70:
        biggest_blocker = "Coding Consistency"

    ai_risk_alert = None
    if inactive_days is not None and inactive_days > 3:
        ai_risk_alert = {
            "level": "High",
            "message": f"AI Risk Alert: inactivity for {inactive_days} days may slow your job-readiness timeline.",
        }

    if ai_risk_alert:
        best_action = {
            "title": "Today's Best Action",
            "task": "Do a 20-minute comeback session: 1 Easy + 1 Medium DSA problem",
            "estimated_time_minutes": 20,
            "priority": "High",
            "cta_label": "Resume Practice",
            "cta_path": "/coding",
        }
    elif coding < 70:
        best_action = {
            "title": "Today's Best Action",
            "task": "Solve 2 Medium DSA problems",
            "estimated_time_minutes": 45,
            "priority": "High",
            "cta_label": "Start Coding",
            "cta_path": "/coding",
        }
    elif resume < 80:
        best_action = {
            "title": "Today's Best Action",
            "task": "Improve 2 resume bullet points with metrics",
            "estimated_time_minutes": 25,
            "priority": "High",
            "cta_label": "Improve Resume",
            "cta_path": "/resume",
        }
    elif interview < 70:
        best_action = {
            "title": "Today's Best Action",
            "task": "Take 1 mock interview",
            "estimated_time_minutes": 30,
            "priority": "High",
            "cta_label": "Start Mock Interview",
            "cta_path": "/interview",
        }
    else:
        best_action = {
            "title": "Today's Best Action",
            "task": "Apply to 3 jobs and tailor resume keywords",
            "estimated_time_minutes": 35,
            "priority": "Medium",
            "cta_label": "Explore Jobs",
            "cta_path": "/resources",
        }

    next_milestone = "Interview-Ready" if resume >= 80 else "Resume-Ready"
    milestone_days = 10 if resume >= 80 else 15

    risk_level = "Low"
    if ai_risk_alert:
        risk_level = "High"
    elif job_readiness < 35 or learning < 40:
        risk_level = "Medium"

    confidence = 92
    if inactive_days is not None and inactive_days > 7:
        confidence = 82
    confidence = int(max(70, min(99, confidence)))

    what_if = [
        {
            "scenario": "If you practice coding daily for 14 days",
            "effect": f"Readiness increases to {int(min(100, round(job_readiness + 13.5)))}%",
        },
        {
            "scenario": "If your resume score crosses 85%",
            "effect": "Eligibility increases for Backend + Full-Stack roles",
        },
        {
            "scenario": "If you complete 5 mock interviews",
            "effect": "Interview confidence improves and risk level drops",
        },
    ]

    return {
        "estimated_days_to_job_ready": days_to_job_ready,
        "next_career_milestone": next_milestone,
        "milestone_days": milestone_days,
        "biggest_blocker": biggest_blocker,
        "risk_level": risk_level,
        "confidence_score": confidence,
        "ai_risk_alert": ai_risk_alert,
        "best_action": best_action,
        "what_if": what_if,
    }


def _weekly_plan_from_blocker(blocker: str) -> List[dict]:
    # 7-day plan, simple but actionable
    if blocker == "Resume Quality":
        return [
            {"day": "Mon", "task": "Rewrite 3 project bullets with metrics", "minutes": 30, "priority": "High"},
            {"day": "Tue", "task": "Add ATS keywords for target role", "minutes": 25, "priority": "High"},
            {"day": "Wed", "task": "Solve 2 Medium DSA problems", "minutes": 45, "priority": "High"},
            {"day": "Thu", "task": "Mock interview (technical)", "minutes": 30, "priority": "Medium"},
            {"day": "Fri", "task": "Polish skills section + reorder by relevance", "minutes": 20, "priority": "High"},
            {"day": "Sat", "task": "Build one small feature in portfolio project", "minutes": 60, "priority": "Medium"},
            {"day": "Sun", "task": "Apply to 3 jobs and tailor resume", "minutes": 35, "priority": "Medium"},
        ]
    if blocker == "Interview Practice":
        return [
            {"day": "Mon", "task": "Mock interview (HR)", "minutes": 25, "priority": "High"},
            {"day": "Tue", "task": "Solve 2 Medium DSA problems", "minutes": 45, "priority": "High"},
            {"day": "Wed", "task": "Mock interview (technical)", "minutes": 30, "priority": "High"},
            {"day": "Thu", "task": "System design basics (30 mins)", "minutes": 30, "priority": "Medium"},
            {"day": "Fri", "task": "Mock interview (technical)", "minutes": 30, "priority": "High"},
            {"day": "Sat", "task": "Review mistakes + create flashcards", "minutes": 30, "priority": "Medium"},
            {"day": "Sun", "task": "Apply to 3 jobs and book one referral ask", "minutes": 35, "priority": "Medium"},
        ]
    # Default = coding/inactivity/maintain
    return [
        {"day": "Mon", "task": "Solve 2 Medium DSA problems", "minutes": 45, "priority": "High"},
        {"day": "Tue", "task": "Solve 1 Medium SQL + 1 Medium DSA", "minutes": 50, "priority": "High"},
        {"day": "Wed", "task": "Resume: add 2 quantified achievements", "minutes": 25, "priority": "Medium"},
        {"day": "Thu", "task": "Mock interview (technical)", "minutes": 30, "priority": "Medium"},
        {"day": "Fri", "task": "Solve 2 Medium problems + review solutions", "minutes": 55, "priority": "High"},
        {"day": "Sat", "task": "Build portfolio project feature", "minutes": 60, "priority": "Medium"},
        {"day": "Sun", "task": "Apply to 3 jobs", "minutes": 35, "priority": "Medium"},
    ]


async def store_interview_evaluation(eval_doc: dict):
    await asyncio.to_thread(_insert_interview_evaluation, eval_doc)


def _insert_test(test_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO tests (id, title, description, questions, duration, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                test_doc['id'],
                test_doc['title'],
                test_doc['description'],
                json.dumps(test_doc.get('questions', [])),
                test_doc['duration'],
                test_doc['company_id'],
                test_doc['created_at'],
            ),
        )


def _fetch_company_tests(company_id: str) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, title, description, questions, duration, company_id, created_at FROM tests WHERE company_id = ? ORDER BY created_at DESC",
            (company_id,),
        )
        rows = cursor.fetchall()
    tests = []
    for row in rows:
        record = dict(row)
        record['questions'] = json.loads(record['questions']) if record.get('questions') else []
        tests.append(record)
    return tests


async def store_test(test_doc: dict):
    await asyncio.to_thread(_insert_test, test_doc)


async def get_company_tests(company_id: str) -> List[dict]:
    return await asyncio.to_thread(_fetch_company_tests, company_id)


def _select_users_by_role(role: str, limit: int = 100) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, email, name, role, created_at FROM users WHERE role = ? ORDER BY created_at DESC LIMIT ?",
            (role, limit),
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


async def fetch_users_by_role(role: str, limit: int = 100) -> List[dict]:
    return await asyncio.to_thread(_select_users_by_role, role, limit)

# ==================== AI RESPONSE FUNCTIONS ====================

def _check_internet_connectivity() -> bool:
    """Check if internet connection is available"""
    try:
        import socket
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

def _get_demo_response(prompt: str, response_type: str = "tutor") -> str:
    """Generate demo responses when AWS is not configured"""
    
    if "code" in prompt.lower() or response_type == "code":
        return """CORRECT: Yes
TIME_COMPLEXITY: O(n) - Linear time complexity
SPACE_COMPLEXITY: O(1) - Constant space complexity  
QUALITY: 8
SCORE: 85
SUGGESTIONS: 
- Consider adding input validation
- Add docstrings for better documentation
- Use more descriptive variable names
- Consider edge cases like empty inputs

Great job! Your code demonstrates solid programming practices. The logic is correct and efficient. 
To improve further, consider adding error handling and unit tests."""

    elif "resume" in prompt.lower() or response_type == "resume":
        return """CREDIBILITY_SCORE: 78
FAKE_SKILLS: None detected
SUGGESTIONS:
- Add quantifiable achievements with metrics
- Include more technical keywords for ATS optimization
- Add a professional summary section
- Include relevant certifications
- Improve formatting for better readability

ANALYSIS: The resume shows good foundational experience. Skills listed appear genuine and relevant to the target role. 
Consider adding specific project outcomes and metrics to strengthen credibility. 
The education section is well-presented. Work experience could benefit from more action verbs and quantifiable results."""

    elif "interview" in prompt.lower() or response_type == "interview":
        if "generate" in prompt.lower() or "Q1" not in prompt:
            return """Q1: Tell me about a challenging project you worked on and how you overcame obstacles.
Q2: How do you stay updated with the latest technologies in your field?
Q3: Describe your approach to debugging a complex issue in production.
Q4: How do you handle disagreements with team members on technical decisions?
Q5: Where do you see yourself professionally in 5 years?"""
        else:
            return """READINESS_SCORE: 75
STRENGTHS: Good communication skills, Technical knowledge, Problem-solving ability
WEAKNESSES: Could provide more specific examples, Need deeper technical explanations, Consider STAR method for behavioral questions

FEEDBACK: Overall, you demonstrated solid interview skills. Your answers show good understanding of concepts.
To improve: Use specific examples from your experience, quantify achievements where possible, and practice the STAR method 
(Situation, Task, Action, Result) for behavioral questions. Consider preparing 2-3 strong project stories you can adapt to different questions."""

    else:  # Default tutor response
        if "REFERENCE MATERIAL" in (prompt or ""):
            # Best-effort: extract the reference material block and summarize it.
            # This keeps attachments useful even when Azure OpenAI is not configured.
            material = ""
            try:
                m = re.search(
                    r"REFERENCE MATERIAL\s*\(.*?\):\s*(.*?)\n\nInstructions:",
                    prompt,
                    flags=re.IGNORECASE | re.DOTALL,
                )
                if m:
                    material = (m.group(1) or "").strip()
            except Exception:
                material = ""

            if not material:
                # fallback: grab a chunk of the prompt
                material = (prompt or "")[-2000:].strip()

            # Extract student question (if present)
            question = ""
            try:
                qm = re.search(r"Student Question:\s*(.*)", prompt, flags=re.IGNORECASE)
                if qm:
                    question = (qm.group(1) or "").strip()
            except Exception:
                question = ""

            snippet = material[:1400].strip()
            lines = [ln.strip() for ln in snippet.splitlines() if ln.strip()]
            summary_points = lines[:5]
            summary = "\n".join([f"- {p}" for p in summary_points]) if summary_points else snippet

            return (
                "Based on the reference material you provided, here’s a clear explanation:\n\n"
                + (f"Question: {question}\n\n" if question else "")
                + "Summary of the material:\n"
                + (summary + "\n\n")
                + "If you tell me what exactly you want (summary, key points, Q&A, explain a topic), I can tailor the answer."
            )

        return """Great question! Let me explain this concept step by step:

**Overview:**
This is a fundamental concept in programming that you'll use frequently.

**Key Points:**
1. **Definition**: Understanding the core concept is essential for building more complex solutions.

2. **How it works**: 
   - The process begins with input validation
   - Data is then processed according to the algorithm
   - Results are returned in a structured format

3. **Example**:
```python
# Simple example demonstrating the concept
def example_function(data):
    # Process the data
    result = process(data)
    return result
```

4. **Best Practices**:
   - Always validate inputs
   - Use meaningful variable names
   - Add comments for complex logic
   - Test edge cases

5. **Common Mistakes to Avoid**:
   - Don't skip input validation
   - Avoid deeply nested code
   - Remember to handle errors gracefully

**Practice Exercise:**
Try implementing a simple version of this concept with the following requirements:
- Accept user input
- Validate the input
- Process and return results

Would you like me to elaborate on any specific part?"""


def _call_azure_openai_sync(prompt: str, system_instruction: str = None) -> str:
    """Synchronous function to call Azure OpenAI API"""
    try:
        client = AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2024-02-01",
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=messages,
            max_tokens=2000,
            temperature=0.7,
        )

        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Error calling Azure OpenAI: {e}")
        return f"Error: Unable to get AI response. Please try again. ({str(e)})"


def _call_openai_sync(prompt: str, system_instruction: str = None) -> str:
    """Synchronous function to call OpenAI Platform (non-Azure) API"""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=2000,
            temperature=0.7,
        )

        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error calling OpenAI: {e}")
        return f"Error: Unable to get AI response. Please try again. ({str(e)})"


async def get_ai_response(prompt: str, session_id: str, system_instruction: str = None, response_type: str = "tutor") -> str:
    """Get AI response - uses configured AI service or demo mode"""
    
    # Determine response type from prompt content
    if "code" in prompt.lower() or "evaluate" in prompt.lower():
        response_type = "code"
    elif "resume" in prompt.lower() or "credibility" in prompt.lower():
        response_type = "resume"
    elif "interview" in prompt.lower() or "Q1:" in prompt or "Q2:" in prompt:
        response_type = "interview"
    
    # Check AI mode - if demo, always use demo responses
    if AI_MODE == 'demo':
        logger.info("Using demo mode for AI response")
        return _get_demo_response(prompt, response_type)
    
    # Check internet connectivity for real AI modes
    if AI_MODE in ('azure', 'openai') and not _check_internet_connectivity():
        logger.warning("No internet connection, falling back to demo mode")
        return _get_demo_response(prompt, response_type)

    # Check if provider is configured
    if AI_MODE == 'azure':
        if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_DEPLOYMENT:
            logger.warning("Azure OpenAI not configured, falling back to demo mode")
            return _get_demo_response(prompt, response_type)
    elif AI_MODE == 'openai':
        if not OPENAI_API_KEY:
            logger.warning("OpenAI not configured, falling back to demo mode")
            return _get_demo_response(prompt, response_type)
    else:
        logger.warning(f"Unknown AI_MODE '{AI_MODE}', falling back to demo mode")
        return _get_demo_response(prompt, response_type)
    
    # Set appropriate system instruction based on response type
    default_system_instructions = {
        "tutor": "You are an expert tutor and programming instructor. Provide clear, step-by-step explanations with code examples when appropriate.",
        "code": "You are a code reviewer and programming expert. Analyze code for correctness, efficiency, and best practices. Provide constructive feedback.",
        "resume": "You are a career counselor and resume expert. Analyze resumes for ATS compatibility, content quality, and improvement suggestions.",
        "interview": "You are an experienced interviewer. Ask relevant technical questions and provide constructive feedback on answers."
    }
    
    system_instruction = system_instruction or default_system_instructions.get(response_type, default_system_instructions["tutor"])
    
    for attempt in range(3):
        try:
            if attempt > 0:
                await asyncio.sleep(2 * attempt)
            
            if AI_MODE == 'azure':
                response = await asyncio.to_thread(
                    _call_azure_openai_sync,
                    prompt,
                    system_instruction
                )
            else:
                response = await asyncio.to_thread(
                    _call_openai_sync,
                    prompt,
                    system_instruction
                )
            
            if not response.startswith("Error:"):
                logger.info(f"Successfully got AI response (mode: {AI_MODE}, type: {response_type})")
                return response

            # If the provider is configured but the account has no quota/billing,
            # return a clear error instead of misleading demo content.
            lowered = response.lower()
            if "insufficient_quota" in lowered or "exceeded your current quota" in lowered:
                return (
                    "OpenAI quota/billing issue: your account has no available quota for API calls. "
                    "Please check Billing/Usage in your OpenAI dashboard (add a payment method or credits), "
                    "then try again."
                )
            
            # If AI call fails, fall back to demo mode
            if attempt == 2:
                logger.warning(f"AI provider '{AI_MODE}' failed, falling back to demo mode")
                return _get_demo_response(prompt, response_type)
                
        except Exception as e:
            logger.error(f"Error calling AI provider '{AI_MODE}' (attempt {attempt + 1}): {e}")
            if attempt == 2:
                logger.warning(f"AI provider '{AI_MODE}' failed, falling back to demo mode")
                return _get_demo_response(prompt, response_type)
    
    return _get_demo_response(prompt, response_type)


# Backwards compatibility alias
async def get_gemini_response(prompt: str, session_id: str) -> str:
    """Backwards compatible wrapper - now uses AI service or demo mode"""
    return await get_ai_response(prompt, session_id)

# ==================== MISSING HELPER FUNCTIONS ====================

async def store_job(job_doc: dict):
    """Store a job posting in the database"""
    await asyncio.to_thread(_insert_job, job_doc)

async def get_company_jobs(company_id: str) -> List[dict]:
    """Get all jobs for a company"""
    return await asyncio.to_thread(_fetch_company_jobs, company_id)

async def delete_test(test_id: str):
    """Delete a test from the database"""
    await asyncio.to_thread(_delete_test_record, test_id)

async def delete_job_record(job_id: str):
    """Delete a job from the database"""
    await asyncio.to_thread(_delete_job_record, job_id)

async def update_candidate_status(candidate_id: str, status: str):
    """Update candidate application status"""
    await asyncio.to_thread(_update_candidate_status, candidate_id, status)

async def get_college_announcements(college_id: str) -> List[dict]:
    """Get all announcements for a college"""
    return await asyncio.to_thread(_fetch_college_announcements, college_id)

async def store_announcement(announcement_doc: dict):
    """Store an announcement in the database"""
    await asyncio.to_thread(_insert_announcement, announcement_doc)

async def delete_announcement_record(announcement_id: str):
    """Delete an announcement from the database"""
    await asyncio.to_thread(_delete_announcement_record, announcement_id)

async def store_message(message_doc: dict):
    """Store a message in the database"""
    await asyncio.to_thread(_insert_message, message_doc)

# Database helper functions implementation
def _insert_job(job_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO jobs (id, company_id, title, description, requirements, location, salary_range, created_at, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (job_doc['id'], job_doc['company_id'], job_doc['title'], job_doc['description'],
             json.dumps(job_doc.get('requirements', [])), job_doc.get('location'), 
             job_doc.get('salary_range'), job_doc['created_at'], job_doc.get('status', 'active'))
        )
        conn.commit()

def _fetch_company_jobs(company_id: str) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC",
            (company_id,)
        )
        rows = cursor.fetchall()
    jobs = []
    for row in rows:
        job = dict(row)
        job['requirements'] = json.loads(job.get('requirements', '[]'))
        jobs.append(job)
    return jobs

def _delete_test_record(test_id: str):
    with _sqlite_connection() as conn:
        conn.execute("DELETE FROM tests WHERE id = ?", (test_id,))
        conn.commit()

def _delete_job_record(job_id: str):
    with _sqlite_connection() as conn:
        conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        conn.commit()

def _update_candidate_status(candidate_id: str, status: str):
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE users SET application_status = ? WHERE id = ?",
            (status, candidate_id)
        )
        conn.commit()

def _fetch_college_announcements(college_id: str) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM announcements WHERE college_id = ? ORDER BY created_at DESC",
            (college_id,)
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]

def _insert_announcement(announcement_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO announcements (id, college_id, title, message, type, target_students, created_at, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (announcement_doc['id'], announcement_doc['college_id'], announcement_doc['title'],
             announcement_doc['message'], announcement_doc['type'], 
             json.dumps(announcement_doc.get('target_students', [])),
             announcement_doc['created_at'], announcement_doc['created_by'])
        )
        conn.commit()

def _delete_announcement_record(announcement_id: str):
    with _sqlite_connection() as conn:
        conn.execute("DELETE FROM announcements WHERE id = ?", (announcement_id,))
        conn.commit()

def _insert_message(message_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO messages (id, from_id, to_id, subject, message, created_at, type)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (message_doc['id'], message_doc['from_id'], message_doc['to_id'], 
             message_doc['subject'], message_doc['message'], message_doc['created_at'],
             message_doc.get('type', 'message'))
        )
        conn.commit()

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "AI Learning & Career Platform API"}


@api_router.get("/health")
async def health_check():
    """Health check endpoint with system status"""
    provider = "Demo"
    configured = False
    model = "demo-responses"
    endpoint = None

    if AI_MODE == 'azure':
        provider = "Azure OpenAI"
        configured = bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT)
        endpoint = AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_API_KEY else None
        model = AZURE_OPENAI_DEPLOYMENT if configured else "demo-responses"
    elif AI_MODE == 'openai':
        provider = "OpenAI"
        configured = bool(OPENAI_API_KEY)
        model = OPENAI_MODEL if configured else "demo-responses"

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ai_mode": AI_MODE,
        "ai_provider": provider,
        "ai_configured": configured,
        "ai_endpoint": endpoint,
        "model": model,
        "database": "sqlite",
        "version": "1.0.0"
    }


@api_router.get("/status")
async def get_status():
    """Get detailed system status"""
    ai_service = {
        "mode": "Demo Mode",
        "configured": False,
        "endpoint": None,
        "deployment": None,
        "model": "demo-responses",
        "note": "Demo mode provides sample responses. Configure OpenAI or Azure OpenAI for full AI capabilities.",
    }

    if AI_MODE == 'azure':
        configured = bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT)
        ai_service = {
            "mode": "Azure OpenAI",
            "configured": configured,
            "endpoint": AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_API_KEY else None,
            "deployment": AZURE_OPENAI_DEPLOYMENT if configured else None,
            "model": AZURE_OPENAI_DEPLOYMENT if configured else "demo-responses",
            "note": "Azure OpenAI is active" if configured else "Azure mode selected but not configured; using demo responses.",
        }
    elif AI_MODE == 'openai':
        configured = bool(OPENAI_API_KEY)
        ai_service = {
            "mode": "OpenAI",
            "configured": configured,
            "endpoint": None,
            "deployment": None,
            "model": OPENAI_MODEL if configured else "demo-responses",
            "note": "OpenAI is active" if configured else "OpenAI mode selected but not configured; using demo responses.",
        }

    return {
        "server": "running",
        "ai_mode": AI_MODE,
        "ai_service": ai_service,
        "features": {
            "ai_tutor": "active",
            "code_evaluation": "active",
            "resume_analyzer": "active",
            "mock_interviews": "active",
            "learning_paths": "active",
            "company_portal": "active",
            "college_admin": "active",
        },
        "database": {
            "type": "SQLite",
            "path": str(SQLITE_DB_PATH),
        },
        "email": _email_status(),
    }


@api_router.get("/ai/test")
async def ai_test():
    """Probe the configured AI provider once.

    This endpoint is meant for debugging environment/config issues.
    It never returns API keys and uses a minimal test request.
    """

    def _classify_error(message: str):
        lowered = (message or "").lower()
        if "insufficient_quota" in lowered or "exceeded your current quota" in lowered:
            return {
                "code": "insufficient_quota",
                "message": "OpenAI quota/billing issue. Check your plan, billing, and project limits.",
                "hint": "OpenAI Dashboard → Billing/Usage: add payment method or credits, then retry.",
            }
        if "invalid_api_key" in lowered or "incorrect api key" in lowered or "api key" in lowered and "invalid" in lowered:
            return {
                "code": "invalid_api_key",
                "message": "Invalid API key.",
                "hint": "Verify OPENAI_API_KEY in backend/.env and restart the backend.",
            }
        if "permission" in lowered or "not authorized" in lowered or "unauthorized" in lowered:
            return {
                "code": "unauthorized",
                "message": "Unauthorized request.",
                "hint": "Verify your key and org/project permissions.",
            }
        if "timeout" in lowered:
            return {
                "code": "timeout",
                "message": "Request timed out.",
                "hint": "Check internet connectivity and try again.",
            }
        return {
            "code": "request_failed",
            "message": "AI request failed.",
            "hint": "Check server logs for details.",
        }

    async def _probe_openai():
        if not OPENAI_API_KEY:
            return {
                "provider": "OpenAI",
                "mode": "openai",
                "configured": False,
                "ok": False,
                "error": {
                    "code": "missing_config",
                    "message": "OPENAI_API_KEY is not set.",
                    "hint": "Set OPENAI_API_KEY in backend/.env and restart the backend.",
                },
            }

        def _call_once():
            client = OpenAI(api_key=OPENAI_API_KEY)
            resp = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": "Reply with exactly: OK"}],
                max_tokens=5,
                temperature=0,
            )
            text = (resp.choices[0].message.content or "").strip()
            return text

        try:
            text = await asyncio.to_thread(_call_once)
            return {
                "provider": "OpenAI",
                "mode": "openai",
                "configured": True,
                "ok": True,
                "model": OPENAI_MODEL,
                "sample": text[:50],
            }
        except Exception as e:
            error = _classify_error(str(e))
            return {
                "provider": "OpenAI",
                "mode": "openai",
                "configured": True,
                "ok": False,
                "model": OPENAI_MODEL,
                "error": error,
            }

    async def _probe_azure():
        configured = bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT)
        if not configured:
            return {
                "provider": "Azure OpenAI",
                "mode": "azure",
                "configured": False,
                "ok": False,
                "error": {
                    "code": "missing_config",
                    "message": "Azure OpenAI is not configured.",
                    "hint": "Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT in backend/.env and restart.",
                },
            }

        def _call_once():
            client = AzureOpenAI(
                api_key=AZURE_OPENAI_API_KEY,
                api_version="2024-02-01",
                azure_endpoint=AZURE_OPENAI_ENDPOINT,
            )
            resp = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=[{"role": "user", "content": "Reply with exactly: OK"}],
                max_tokens=5,
                temperature=0,
            )
            text = (resp.choices[0].message.content or "").strip()
            return text

        try:
            text = await asyncio.to_thread(_call_once)
            return {
                "provider": "Azure OpenAI",
                "mode": "azure",
                "configured": True,
                "ok": True,
                "deployment": AZURE_OPENAI_DEPLOYMENT,
                "endpoint": AZURE_OPENAI_ENDPOINT,
                "sample": text[:50],
            }
        except Exception as e:
            error = _classify_error(str(e))
            return {
                "provider": "Azure OpenAI",
                "mode": "azure",
                "configured": True,
                "ok": False,
                "deployment": AZURE_OPENAI_DEPLOYMENT,
                "endpoint": AZURE_OPENAI_ENDPOINT,
                "error": error,
            }

    if AI_MODE == "openai":
        result = await _probe_openai()
    elif AI_MODE == "azure":
        result = await _probe_azure()
    else:
        result = {
            "provider": "Demo",
            "mode": "demo",
            "configured": False,
            "ok": False,
            "error": {
                "code": "demo_mode",
                "message": "AI_MODE is demo; real AI is disabled.",
                "hint": "Set AI_MODE=openai (and OPENAI_API_KEY) or AI_MODE=azure in backend/.env, then restart.",
            },
        }

    return {
        "ai_mode": AI_MODE,
        "result": result,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Authentication Routes
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    try:
        existing_sqlite = await fetch_sqlite_user(user_data.email)
        if existing_sqlite:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "name": user_data.name,
            "role": user_data.role,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await store_sqlite_user(user_doc)
        
        # Verify the user was actually stored
        stored_user = await fetch_sqlite_user(user_data.email)
        if not stored_user:
            raise HTTPException(status_code=500, detail="Failed to create user account")
        
        # Create token
        token = create_token(user_id, user_data.email)
        
        user_response = UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            created_at=user_doc["created_at"]
        )
        
        return AuthResponse(token=token, user=user_response)
    except HTTPException:
        raise
    except sqlite3.IntegrityError as e:
        logger.error(f"Registration failed - integrity error: {e}")
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    sqlite_user = await fetch_sqlite_user(credentials.email)
    if not sqlite_user or not verify_password(credentials.password, sqlite_user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Record login activity + update login streak (server-side, cross-device)
    try:
        await asyncio.to_thread(
            _insert_activity_event,
            sqlite_user["id"],
            ActivityEvent(event_type="login", path="/auth/login"),
        )
    except Exception:
        # Don't block auth on analytics
        pass

    try:
        await asyncio.to_thread(_update_login_streak_on_login, sqlite_user["id"])
    except Exception:
        # Don't block auth on streak update
        pass
    
    token = create_token(sqlite_user['id'], sqlite_user['email'])
    
    user_response = UserResponse(
        id=sqlite_user['id'],
        email=sqlite_user['email'],
        name=sqlite_user['name'],
        role=sqlite_user['role'],
        created_at=sqlite_user['created_at']
    )

    return AuthResponse(token=token, user=user_response)


@api_router.post("/auth/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest):
    user = await fetch_sqlite_user(payload.email)
    if not user:
        # Per product requirement: explicitly confirm whether email exists.
        raise HTTPException(status_code=404, detail="Email is not registered")

    email_status = _email_status()
    if (not email_status["configured"]) or (not email_status["enabled"]):
        # Email sending is required for this flow in production.
        # For non-production demo/testing, allow an explicit debug OTP fallback.
        if RETURN_DEBUG_OTP and DEBUG and ENVIRONMENT != "production":
            ttl_minutes = int(os.environ.get("RESET_OTP_TTL_MINUTES") or 10)
            ttl_minutes = max(5, min(10, ttl_minutes))
            otp = await asyncio.to_thread(_create_reset_otp, payload.email, ttl_minutes)
            return ForgotPasswordResponse(
                message="Email service is not configured. Using debug OTP (non-production only).",
                debug_otp=otp,
            )

        detail = "Email service is not configured. Configure SMTP in Azure App Service settings (SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD/EMAIL_FROM)"
        if DEBUG and ENVIRONMENT != "production":
            detail = f"Email service is not configured. Missing: {', '.join(email_status['missing']) or 'unknown'}"
        raise HTTPException(status_code=503, detail=detail)

    # Simple cooldown: prevent spamming OTP requests (60s between latest requests).
    latest = await asyncio.to_thread(_get_latest_reset_otp_row, payload.email)
    if latest and latest.get("created_at"):
        try:
            created_at = datetime.fromisoformat(latest["created_at"])
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - created_at < timedelta(seconds=60):
                raise HTTPException(
                    status_code=429,
                    detail="Please wait 60 seconds before requesting another OTP",
                )
        except HTTPException:
            raise
        except Exception:
            # If parsing fails, ignore cooldown.
            pass

    ttl_minutes = int(os.environ.get("RESET_OTP_TTL_MINUTES") or 10)
    ttl_minutes = max(5, min(10, ttl_minutes))

    otp = await asyncio.to_thread(_create_reset_otp, payload.email, ttl_minutes)

    try:
        await send_password_reset_otp_email(payload.email, otp, ttl_minutes)
    except Exception as e:
        logger.exception("Failed to send OTP email")
        detail = "Failed to send OTP email. Please check SMTP settings"
        if DEBUG and ENVIRONMENT != "production":
            detail = f"Failed to send OTP email: {str(e)}"
        raise HTTPException(status_code=500, detail=detail)

    # Optional debug OTP (off by default). Never enable this in production.
    debug_otp = None
    if RETURN_DEBUG_OTP and DEBUG and ENVIRONMENT != "production":
        debug_otp = otp
    return ForgotPasswordResponse(message="OTP sent to your email", debug_otp=debug_otp)


@api_router.post("/auth/verify-otp", response_model=VerifyOtpResponse)
async def verify_otp(payload: VerifyOtpRequest):
    # Normalize input
    otp = (payload.otp or "").strip()
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=400, detail="Invalid OTP")

    row = await asyncio.to_thread(_get_latest_reset_otp_row, payload.email)
    if not row:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if row.get("used_at"):
        raise HTTPException(status_code=400, detail="OTP already used")

    attempts = int(row.get("attempts") or 0)
    if attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP")

    try:
        expires_at = datetime.fromisoformat(row["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(status_code=400, detail="OTP expired")

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    if not _verify_otp(otp, row["otp_hash"]):
        await asyncio.to_thread(_increment_reset_otp_attempts, row["id"])
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return VerifyOtpResponse(verified=True)


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    otp = (payload.otp or "").strip()
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Validate user exists
    user = await fetch_sqlite_user(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    row = await asyncio.to_thread(_get_latest_reset_otp_row, payload.email)
    if not row or row.get("used_at"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    attempts = int(row.get("attempts") or 0)
    if attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP")

    try:
        expires_at = datetime.fromisoformat(row["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    if not _verify_otp(otp, row["otp_hash"]):
        await asyncio.to_thread(_increment_reset_otp_attempts, row["id"])
        raise HTTPException(status_code=400, detail="Invalid OTP")

    _validate_password_strength(payload.new_password)

    new_hash = hash_password(payload.new_password)
    await asyncio.to_thread(_update_user_password, payload.email, new_hash)
    await asyncio.to_thread(_mark_reset_otp_used, payload.email)

    return {"message": "Password updated successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)


@api_router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = await fetch_sqlite_user_public_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_data = None
    if user.get("profile_data"):
        try:
            profile_data = json.loads(user["profile_data"])
        except Exception:
            profile_data = None

    return UserProfileResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"],
        avatar_url=user.get("avatar_url"),
        profile_data=profile_data,
        updated_at=user.get("updated_at"),
    )


@api_router.put("/profile", response_model=UserProfileResponse)
async def update_profile(update: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    await update_sqlite_user_profile(current_user["id"], update.name, update.profile_data)

    user = await fetch_sqlite_user_public_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_data = None
    if user.get("profile_data"):
        try:
            profile_data = json.loads(user["profile_data"])
        except Exception:
            profile_data = None

    return UserProfileResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"],
        avatar_url=user.get("avatar_url"),
        profile_data=profile_data,
        updated_at=user.get("updated_at"),
    )


@api_router.post("/profile/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB")

    # Basic content-type allowlist
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    avatars_dir = UPLOADS_ROOT / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)

    original = file.filename or "avatar"
    ext = os.path.splitext(original)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
        # default to .png if unknown
        ext = ".png"

    stored_name = f"{uuid.uuid4()}{ext}"
    stored_path = avatars_dir / stored_name
    with open(stored_path, "wb") as f:
        f.write(content)

    avatar_url = f"/uploads/avatars/{stored_name}"
    await update_sqlite_user_avatar(current_user["id"], avatar_url)
    return AvatarUploadResponse(avatar_url=avatar_url)


def _safe_filename(value: str) -> str:
    if not value:
        return "resume"
    cleaned = "".join(ch for ch in str(value) if ch.isalnum() or ch in (" ", "-", "_"))
    cleaned = cleaned.strip().replace(" ", "_")
    return cleaned or "resume"


def _split_lines(text: Optional[str]) -> List[str]:
    if not text:
        return []
    lines: List[str] = []
    for raw in str(text).splitlines():
        s = raw.strip()
        if s:
            lines.append(s)
    return lines


def _as_bullets(lines: List[str]) -> List[str]:
    bullets: List[str] = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s.startswith("-") or s.startswith("•"):
            s = s.lstrip("-•").strip()
        bullets.append(s)
    return bullets


def _build_ats_resume_pdf_bytes(name: str, email: str, profile: dict, template: str = "classic") -> bytes:
    try:
        import re
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            ListFlowable,
            ListItem,
            Table,
            TableStyle,
            HRFlowable,
        )
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
    except Exception:
        raise RuntimeError("PDF generator dependency missing. Install 'reportlab'.")

    template_id = (template or "classic").strip().lower()
    allowed_templates = {
        "classic",
        "modern",
        "minimal",
        "compact",
        "timeline",
        "twocol",
        "academic",
        "tech",
        "freshers",
        "executive",
        "creative",
        "bold",
    }
    if template_id not in allowed_templates:
        template_id = "classic"

    # Template styling variations (ATS-safe: standard fonts, no graphics-heavy layout)
    font_base = "Times-Roman"
    font_bold = "Times-Bold"
    base_size = 9.5
    base_leading = 12
    name_size = 18
    section_title_size = 10.5
    section_rule = True
    rule_thickness = 1
    rule_color = colors.black
    section_upper = False
    # margins in inches: (left, right, top, bottom)
    margins = (0.65, 0.65, 0.30, 0.35)

    if template_id == "modern":
        font_base = "Helvetica"
        font_bold = "Helvetica-Bold"
        base_size = 10
        base_leading = 12
        name_size = 19
        section_title_size = 11
        rule_thickness = 0.7
        rule_color = colors.HexColor("#444444")
    elif template_id == "minimal":
        font_base = "Helvetica"
        font_bold = "Helvetica-Bold"
        base_size = 9.5
        base_leading = 11.5
        name_size = 17
        section_title_size = 10
        section_rule = False
    elif template_id == "compact":
        base_size = 9
        base_leading = 11
        name_size = 16
        section_title_size = 10
        margins = (0.55, 0.55, 0.25, 0.30)
    elif template_id == "bold":
        section_title_size = 11.5
        section_upper = True
        rule_thickness = 1.2
    elif template_id == "creative":
        font_base = "Helvetica"
        font_bold = "Helvetica-Bold"
        base_size = 10
        base_leading = 13
        name_size = 20
        section_title_size = 11
        rule_thickness = 0.7
        rule_color = colors.HexColor("#555555")
    elif template_id == "executive":
        name_size = 20
        base_size = 10
        base_leading = 13
        section_title_size = 11
    elif template_id == "timeline":
        font_base = "Helvetica"
        font_bold = "Helvetica-Bold"
        base_size = 9.5
        base_leading = 12
        section_title_size = 10.5
        rule_thickness = 0.7
        rule_color = colors.HexColor("#444444")
    elif template_id == "academic":
        font_base = "Times-Roman"
        font_bold = "Times-Bold"
        base_size = 10
        base_leading = 13
        section_title_size = 11
    elif template_id == "tech":
        font_base = "Helvetica"
        font_bold = "Helvetica-Bold"
        base_size = 9.5
        base_leading = 12
        section_title_size = 10.5
    elif template_id == "freshers":
        base_size = 10
        base_leading = 13
        name_size = 19
        section_title_size = 11

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=margins[0] * inch,
        rightMargin=margins[1] * inch,
        topMargin=margins[2] * inch,
        bottomMargin=margins[3] * inch,
        title="Resume",
        author=name or "",
    )

    styles = getSampleStyleSheet()
    base = styles["BodyText"]
    base.fontName = font_base
    base.fontSize = base_size
    base.leading = base_leading
    base.spaceAfter = 0

    name_style = ParagraphStyle(
        "Name",
        parent=base,
        fontName=font_bold,
        fontSize=name_size,
        leading=max(20, int(name_size) + 2),
        textColor=colors.black,
        spaceAfter=2,
    )
    headline_style = ParagraphStyle(
        "Headline",
        parent=base,
        fontName=font_bold,
        fontSize=10.5,
        leading=13,
        textColor=colors.black,
        spaceAfter=2,
    )
    small_style = ParagraphStyle(
        "Small",
        parent=base,
        fontSize=max(8.5, base_size - 0.5),
        leading=max(10.5, base_leading - 1),
        textColor=colors.black,
    )
    small_right_style = ParagraphStyle(
        "SmallRight",
        parent=small_style,
        alignment=2,  # right
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=base,
        fontName=font_bold,
        fontSize=section_title_size,
        leading=max(12, int(section_title_size) + 2),
        spaceBefore=5,
        spaceAfter=2,
        textColor=colors.black,
    )
    entry_bold_style = ParagraphStyle(
        "EntryBold",
        parent=base,
        fontName=font_bold,
        fontSize=base_size,
        leading=base_leading,
        textColor=colors.black,
    )

    def _esc(txt: str) -> str:
        return (txt or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def p(txt: str, st=base):
        return Paragraph(_esc(txt), st)

    def p_html(txt: str, st=base):
        return Paragraph(txt, st)

    def section_header(title: str):
        t = (title or "").strip()
        if section_upper and t:
            t = t.upper()
        story.append(p(t, section_title_style))
        if section_rule:
            story.append(
                HRFlowable(
                    width="100%",
                    thickness=rule_thickness,
                    color=rule_color,
                    spaceBefore=1,
                    spaceAfter=4,
                )
            )
        else:
            story.append(Spacer(1, 3))

    def two_col_table(rows: List[List[Paragraph]], col_widths: List[float], *, bottom_padding: int = 1):
        tbl = Table(rows, colWidths=col_widths, hAlign="LEFT")
        tbl.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), bottom_padding),
                ]
            )
        )
        return tbl

    story = []

    # Header (two columns)
    # Intentionally do NOT render a "Resume Headline" / title line.
    roll_no = (profile or {}).get("roll_no") or ""
    degree = (profile or {}).get("degree") or ""
    institute = (profile or {}).get("institute") or (profile or {}).get("university") or ""
    branch = (profile or {}).get("branch") or ""

    phone = (profile or {}).get("phone") or ""
    location = (profile or {}).get("location") or ""
    github = (profile or {}).get("github")
    linkedin = (profile or {}).get("linkedin")
    portfolio = (profile or {}).get("portfolio")

    # Contact block (right). No side labels; values only.
    contact_lines: List[str] = []
    if phone:
        contact_lines.append(_esc(str(phone)))
    if email:
        contact_lines.append(_esc(str(email)))
    # Intentionally do not render location in the ATS resume.
    if github:
        gh = str(github).strip()
        if gh:
            contact_lines.append(_esc(gh))
    if linkedin:
        li = str(linkedin).strip()
        if li:
            contact_lines.append(_esc(li))
    if portfolio:
        pf = str(portfolio).strip()
        if pf:
            contact_lines.append(_esc(pf))

    left_lines: List[str] = []
    if roll_no:
        left_lines.append(f"Roll No.: {roll_no}")
    if degree:
        left_lines.append(str(degree))
    if branch:
        left_lines.append(str(branch))
    if institute:
        left_lines.append(str(institute))

    left_cell: List = [p(name or "", name_style)]
    if left_lines:
        # Use HTML line breaks; content is escaped via _esc
        left_cell.append(p_html("<br/>".join(_esc(x) for x in left_lines), small_style))

    # Use HTML line breaks; contact_lines is already escaped via _esc
    right_cell = p_html("<br/>".join(contact_lines), small_right_style)

    story.append(
        two_col_table(
            [[left_cell, right_cell]],
            [doc.width * 0.65, doc.width * 0.35],
        )
    )
    story.append(Spacer(1, 4))

    # Professional Summary
    summary = (profile or {}).get("profile_summary") or (profile or {}).get("bio")
    if summary:
        section_header("Professional Summary")
        story.append(p(str(summary), base))

    # Education
    education_text = (profile or {}).get("education")
    if education_text:
        section_header("Education")
        edu_rows: List[List[Paragraph]] = []
        for ln in _split_lines(str(education_text)):
            parts = [p.strip() for p in ln.split("|") if p.strip()]
            if len(parts) >= 2:
                left = " | ".join(parts[:-1])
                right = parts[-1]
                edu_rows.append([p(left, entry_bold_style), p(right, small_right_style)])
            else:
                edu_rows.append([p(ln, base), p("", small_right_style)])
        story.append(two_col_table(edu_rows, [doc.width * 0.78, doc.width * 0.22]))

    # Technical Skills
    # Match screenshot format with labeled lines.
    tech_langs = (profile or {}).get("technical_languages") or ""
    tech_tools = (profile or {}).get("technical_tools") or ""
    tech_cloud = (profile or {}).get("technical_cloud") or ""

    skills_field = (profile or {}).get("skills")
    skills_list: List[str] = []
    if isinstance(skills_field, list):
        skills_list.extend([str(s).strip() for s in skills_field if str(s).strip()])
    seen = set()
    skills_dedup: List[str] = []
    for s in skills_list:
        k = s.lower()
        if k and k not in seen:
            seen.add(k)
            skills_dedup.append(s)

    if tech_langs or tech_tools or tech_cloud or skills_dedup:
        section_header("Technical Skills")
        if tech_langs:
            story.append(p_html(f"<b>Languages:</b> {_esc(str(tech_langs))}", base))
        if tech_tools:
            story.append(p_html(f"<b>Tools:</b> {_esc(str(tech_tools))}", base))
        if tech_cloud:
            story.append(p_html(f"<b>Cloud:</b> {_esc(str(tech_cloud))}", base))
        if (not tech_langs and not tech_cloud) and skills_dedup:
            if template_id == "twocol" and len(skills_dedup) >= 8:
                half = (len(skills_dedup) + 1) // 2
                left = skills_dedup[:half]
                right = skills_dedup[half:]
                story.append(
                    two_col_table(
                        [
                            [
                                p_html(f"<b>Skills:</b> {_esc(', '.join(left))}", base),
                                p(", ".join(right), base) if right else p("", base),
                            ]
                        ],
                        [doc.width * 0.50, doc.width * 0.50],
                    )
                )
            else:
                story.append(p_html(f"<b>Skills:</b> {_esc(', '.join(skills_dedup))}", base))

    # Soft Skills
    soft_skills = (profile or {}).get("soft_skills") or ""
    if soft_skills:
        section_header("Soft Skills")
        story.append(p(str(soft_skills), base))

    def add_bullets_section(title: str, text: Optional[str], *, compact: bool = False):
        lines = _split_lines(text)
        if not lines:
            return
        section_header(title)
        bullets = _as_bullets(lines)
        flow = ListFlowable(
            [ListItem(p(b, base), leftIndent=12) for b in bullets],
            bulletType="bullet",
            leftIndent=12,
        )
        if compact:
            # Make bullet sections closer to Education density.
            flow.spaceBefore = 0
            flow.spaceAfter = 0
        story.append(flow)

    def add_projects_like_section(title: str, text: Optional[str]):
        lines = _split_lines(text)
        if not lines:
            return
        section_header(title)
        for ln in lines:
            if ln.startswith("-") or ln.startswith("•"):
                continue
            if ":" in ln:
                t, d = ln.split(":", 1)
                story.append(p_html(f"<b>{_esc(t.strip())}</b>: {_esc(d.strip())}", base))
            else:
                story.append(p(ln, entry_bold_style))

        # If user provided bullets, render them after entries
        bullet_lines = [x for x in lines if x.startswith(("-", "•"))]
        if bullet_lines:
            bullets = _as_bullets(bullet_lines)
            flow = ListFlowable(
                [ListItem(p(b, base), leftIndent=12) for b in bullets],
                bulletType="bullet",
                leftIndent=12,
            )
            story.append(flow)

    # Projects
    add_projects_like_section("Projects", (profile or {}).get("projects"))

    # Internships / Experience
    # Do not fallback to the removed "employment" field.
    internships = (profile or {}).get("final_year_project")
    if not internships:
        internships = (profile or {}).get("internships")
    if internships:
        section_header("Internships")

        intern_detail_style = ParagraphStyle(
            "InternDetail",
            parent=base,
            leading=12,
            spaceBefore=0,
            spaceAfter=1,
        )

        month_re = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"

        def split_left_right_date(line: str):
            # Preferred explicit format: "Left | Right"
            if "|" in line:
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) >= 2:
                    return " | ".join(parts[:-1]), parts[-1]

            # Heuristic: detect a date-ish suffix like "May - July 2025" or "Jun 2024".
            m = re.search(
                rf"^(.*?)(\b{month_re}\b.*?\b(19|20)\d{{2}}\b)\s*$",
                line,
                flags=re.IGNORECASE,
            )
            if m:
                left = (m.group(1) or "").strip(" -–—:\t")
                right = (m.group(2) or "").strip()
                if left and right:
                    return left, right

            return line, None

        def format_company_bold(left_text: str) -> str:
            # Bold only the company/organization part.
            # Common separators: ":", "—", "-".
            raw = (left_text or "").strip()
            if not raw:
                return ""

            prefix = "• " if template_id == "timeline" else ""
            for sep in (":", "—", "-"):
                if sep in raw:
                    company, rest = raw.split(sep, 1)
                    company = company.strip()
                    rest = rest.strip()
                    if company and rest:
                        return f"{prefix}<b>{_esc(company)}</b> { _esc(sep) } {_esc(rest)}"
                    break

            return f"{prefix}<b>{_esc(raw)}</b>"

        def looks_like_new_entry(line: str) -> bool:
            if not line:
                return False
            if "|" in line:
                return True
            if re.search(rf"\b{month_re}\b.*\b(19|20)\d{{2}}\b", line, flags=re.IGNORECASE):
                return True
            if re.search(r"\b(19|20)\d{2}\b", line) and (":" in line or "—" in line or "-" in line):
                return True
            return False

        # Render with blocks separated by blank lines.
        # - First non-bullet line of a block is bold (or a two-column row if it has '|')
        # - Subsequent non-bullet lines are normal text
        # - Bullet lines render as bullets under the current block
        in_block = False
        pending_bullets: List[str] = []

        def flush_bullets():
            nonlocal pending_bullets
            if not pending_bullets:
                return
            bullets = _as_bullets(pending_bullets)
            flow = ListFlowable(
                [ListItem(p(b, intern_detail_style), leftIndent=12) for b in bullets],
                bulletType="bullet",
                leftIndent=12,
            )
            # Keep modest whitespace like other sections.
            flow.spaceBefore = 1
            flow.spaceAfter = 2
            story.append(flow)
            pending_bullets = []

        for raw in str(internships).splitlines():
            ln = raw.strip()
            if not ln:
                flush_bullets()
                in_block = False
                continue

            if ln.startswith(("-", "•")):
                pending_bullets.append(ln)
                continue

            # New entry header
            # If we're already in a block, start a new block when a header-like line appears.
            if not in_block or looks_like_new_entry(ln):
                flush_bullets()
                if in_block:
                    # Add a small gap between entries when there isn't a blank line.
                    story.append(Spacer(1, 2))
                left, right = split_left_right_date(ln)

                left_html = format_company_bold(left)
                if right:
                    story.append(
                        two_col_table(
                            [[p_html(left_html, intern_detail_style), p(str(right), small_right_style)]],
                            [doc.width * 0.78, doc.width * 0.22],
                            bottom_padding=1,
                        )
                    )
                else:
                    story.append(p_html(left_html, intern_detail_style))

                in_block = True
            else:
                # Detail line
                story.append(p(ln, intern_detail_style))

        flush_bullets()

    # Certifications / Achievements
    add_bullets_section("Certifications", (profile or {}).get("certifications"), compact=True)
    add_bullets_section(
        "Achievements",
        (profile or {}).get("achievements_text") or (profile or {}).get("achievements"),
        compact=True,
    )

    # Languages / Hobbies
    # Do not fallback to the removed "languages_known" field.
    langs = (profile or {}).get("languages")
    hobbies = (profile or {}).get("hobbies")
    if langs or hobbies:
        section_header("Languages / Hobbies")
        if langs:
            story.append(p_html(f"<b>Languages:</b> {_esc(str(langs))}", base))
        if hobbies:
            story.append(p_html(f"<b>Hobbies:</b> {_esc(str(hobbies))}", base))

    # Declaration
    declaration = (profile or {}).get("declaration")
    if declaration:
        section_header("Declaration")
        story.append(p(str(declaration), base))

    doc.build(story)
    return buf.getvalue()


@api_router.get("/profile/resume/ats")
async def download_ats_resume(
    format: str = Query("pdf"),
    template: str = Query("classic"),
    current_user: dict = Depends(get_current_user),
):
    fmt = (format or "pdf").strip().lower()
    if fmt != "pdf":
        raise HTTPException(status_code=400, detail="Only PDF format is supported")

    user = await fetch_sqlite_user_public_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_data: dict = {}
    if user.get("profile_data"):
        try:
            profile_data = json.loads(user["profile_data"]) or {}
        except Exception:
            profile_data = {}

    # Ensure hidden/removed Profile UI fields never appear in the generated PDF.
    # (These keys may still exist in stored profile_data from earlier versions.)
    for k in (
        "resume_headline",
        "key_skills",
        "employment",
        "languages_known",
    ):
        profile_data.pop(k, None)

    name = user.get("name") or ""
    email = user.get("email") or ""
    try:
        pdf_bytes = await asyncio.to_thread(_build_ats_resume_pdf_bytes, name, email, profile_data, template)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

    filename = f"{_safe_filename(name)}_ATS_Resume.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers=headers)

# AI Tutor Routes
@api_router.post("/assistant/chat", response_model=AssistantChatResponse)
async def assistant_chat(payload: AssistantChatRequest, current_user: dict = Depends(get_current_user)):
    """In-app support assistant (Azure OpenAI when configured).

    Intended for short, product/help questions about LearnovateX.
    """

    user_text = (payload.message or "").strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message is required")

    # Keep prompt concise and safe.
    path = (payload.context_path or "").strip()
    system_instruction = (
        "You are LearnovateX Support Assistant. "
        "Help users understand how to use the app (learning paths, roadmap, profile, settings, internships, notifications). "
        "Be concise, step-by-step, and reference UI locations like 'top-right profile menu' when helpful. "
        "If you are unsure, ask one clarifying question."
    )

    history = payload.history or []
    compact_history = []
    for h in history[-20:]:
        role = str(h.get("role") or "")
        content = str(h.get("content") or "")
        if role in ("user", "assistant") and content:
            compact_history.append({"role": role, "content": content[:800]})

    history_block = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in compact_history])
    prompt = (
        f"User: {current_user.get('name') or current_user.get('email') or 'User'}\n"
        f"Current page: {path or 'unknown'}\n\n"
        + (f"Recent conversation:\n{history_block}\n\n" if history_block else "")
        + f"Question: {user_text}\n\n"
        "Answer as app help."
    )

    session_id = f"{current_user['id']}_assistant_{datetime.now().timestamp()}"
    response = await get_ai_response(prompt, session_id, system_instruction=system_instruction, response_type="tutor")
    return AssistantChatResponse(response=response)


@api_router.post("/tutor/context/upload", response_model=TutorContextUploadResponse)
async def tutor_context_upload(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    max_bytes = int(TUTOR_CONTEXT_MAX_FILE_SIZE_MB) * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {TUTOR_CONTEXT_MAX_FILE_SIZE_MB}MB",
        )

    filename = (file.filename or "file").strip() or "file"
    ext = os.path.splitext(filename)[1].lower()
    content_type = (file.content_type or "").lower()

    image_exts = {
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".gif",
        ".bmp",
        ".tif",
        ".tiff",
        ".jfif",
    }

    # Accept: images, pdf, docx (doc is accepted by UI but not reliably parseable here)
    is_pdf = ext == ".pdf" or content_type == "application/pdf"
    is_docx = ext == ".docx" or content_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    is_doc = ext == ".doc" or content_type == "application/msword"
    # Some browsers/OSes send images as application/octet-stream; rely on extension too.
    is_image = content_type.startswith("image/") or (ext in image_exts)

    if not (is_pdf or is_docx or is_doc or is_image):
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload image, PDF, or DOCX")

    extracted_text = ""
    kind = "file"
    warning: Optional[str] = None
    text_extracted: Optional[bool] = None

    try:
        if is_pdf:
            extracted_text = await asyncio.to_thread(_extract_text_from_pdf_bytes, contents)
            kind = "pdf"
        elif is_docx:
            extracted_text = await asyncio.to_thread(_extract_text_from_docx_bytes, contents)
            kind = "docx"
        elif is_doc:
            # .doc is a legacy binary format and requires extra system tools.
            raise HTTPException(status_code=400, detail=".doc is not supported. Please upload .docx")
        elif is_image:
            kind = "image"
            try:
                extracted_text = await asyncio.to_thread(_extract_text_from_image_bytes, contents)
            except RuntimeError as e:
                # OCR is not configured; still allow attaching the image.
                warning = str(e) or "OCR is not configured"
                extracted_text = ""
    except HTTPException:
        raise
    except RuntimeError as e:
        msg = str(e)
        # OCR misconfiguration is a user-facing setup issue.
        if kind == "image" and msg:
            # Keep compatibility: image OCR issues are handled above now.
            warning = msg
            extracted_text = ""
        raise HTTPException(status_code=500, detail=msg or "Failed to process file")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    extracted_text = (extracted_text or "").strip()
    if not extracted_text:
        # Image OCR may not be configured; PDFs can be scanned; DOCX can contain only images.
        if kind == "image":
            # Still store a placeholder so the UI shows an attachment chip and
            # the tutor can ask the user to describe the image.
            if not warning:
                warning = "No readable text found in this image. If it contains text, enable OCR (Tesseract) or upload a clearer image."
            extracted_text = (
                "[Image attachment]\n"
                "I could not extract any readable text from this image. "
                "If you want me to answer based on it, please describe what's in the image or enable OCR on the server."
            )
            text_extracted = False
        elif kind == "pdf":
            raise HTTPException(
                status_code=400,
                detail="No readable text found in this PDF. If it's a scanned PDF (image-only), upload a searchable PDF or upload images with OCR enabled.",
            )
        elif kind == "docx":
            raise HTTPException(
                status_code=400,
                detail="No readable text found in this DOCX. If the document contains only images/scans, export it as searchable PDF or paste the text directly.",
            )
        else:
            raise HTTPException(status_code=400, detail="No readable text found in this file")
    else:
        text_extracted = True

    context_id = str(uuid.uuid4())
    context_doc = {
        "id": context_id,
        "user_id": current_user["id"],
        "kind": kind,
        "source_name": filename,
        "source_url": None,
        "text_content": _truncate_text(extracted_text, 200_000),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await store_tutor_context(context_doc)

    return TutorContextUploadResponse(
        context_id=context_id,
        kind=kind,
        filename=filename,
        text_extracted=text_extracted,
        warning=warning,
    )


@api_router.post("/tutor/context/youtube", response_model=TutorYouTubeContextResponse)
async def tutor_context_youtube(
    payload: TutorYouTubeContextRequest,
    current_user: dict = Depends(get_current_user),
):
    url = (payload.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="url is required")

    video_id = _youtube_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api._errors import (
            TranscriptsDisabled,
            NoTranscriptFound,
            VideoUnavailable,
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="YouTube transcript support requires 'youtube-transcript-api' package",
        )

    try:
        transcript = await asyncio.to_thread(
            YouTubeTranscriptApi.get_transcript,
            video_id,
            languages=["en"],
        )
        text = " ".join([(t.get("text") or "").strip() for t in transcript if (t.get("text") or "").strip()])
    except (TranscriptsDisabled, NoTranscriptFound):
        raise HTTPException(status_code=400, detail="No transcript available for this video")
    except VideoUnavailable:
        raise HTTPException(status_code=400, detail="YouTube video unavailable")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")

    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Transcript was empty")

    context_id = str(uuid.uuid4())
    context_doc = {
        "id": context_id,
        "user_id": current_user["id"],
        "kind": "youtube",
        "source_name": None,
        "source_url": url,
        "text_content": _truncate_text(text, 200_000),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await store_tutor_context(context_doc)

    return TutorYouTubeContextResponse(context_id=context_id, kind="youtube", video_id=video_id)


@api_router.post("/tutor/chat", response_model=TutorResponse)
async def tutor_chat(message: TutorMessage, current_user: dict = Depends(get_current_user)):
    session_id = f"{current_user['id']}_tutor_{datetime.now().timestamp()}"

    context_ids = message.context_ids or []
    context_block = ""
    if context_ids:
        try:
            ctx_docs = await fetch_tutor_contexts_by_ids(current_user["id"], context_ids)
        except Exception:
            ctx_docs = []

        if ctx_docs:
            parts: List[str] = []
            budget = 12_000
            used = 0
            for c in ctx_docs:
                header = None
                if c.get("kind") == "youtube":
                    header = f"YouTube: {c.get('source_url') or ''}".strip()
                else:
                    header = f"File: {c.get('source_name') or 'attachment'}".strip()

                body = (c.get("text_content") or "").strip()
                if not body:
                    continue
                remaining = budget - used
                if remaining <= 0:
                    break
                clipped = body[:remaining]
                used += len(clipped)
                parts.append(f"[{header}]\n{clipped}")
            if parts:
                context_block = "\n\n".join(parts)
    
    prompt = f"""
Topic: {message.topic if message.topic else 'General'}
Difficulty Level: {message.difficulty}
Student Question: {message.message}
"""

    if context_block:
        prompt += f"""

REFERENCE MATERIAL (from user's uploaded file(s)/YouTube transcript):
{context_block}

Instructions:
- If the question asks about the reference material, answer based strictly on it.
- If the reference material is insufficient, say what's missing and ask 1 clarifying question.
- Otherwise, answer normally as a tutor.
"""
    else:
        prompt += "\nProvide a detailed, step-by-step explanation. Use examples and analogies to make the concept clear.\n"
    
    response = await get_gemini_response(prompt, session_id)
    
    # Save to learning history
    history_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "topic": message.topic,
        "difficulty": message.difficulty,
        "question": message.message,
        "response": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await store_learning_history(history_doc)
    
    return TutorResponse(response=response, session_id=session_id)

# Code Evaluation Routes
@api_router.post("/code/evaluate", response_model=CodeEvaluation)
async def evaluate_code(submission: CodeSubmission, current_user: dict = Depends(get_current_user)):
    session_id = f"{current_user['id']}_code_{datetime.now().timestamp()}"
    
    prompt = f"""
Evaluate this {submission.language} code submission:

Code:
```{submission.language}
{submission.code}
```

Provide:
1. Is the code correct? (Yes/No)
2. Time complexity analysis
3. Space complexity analysis
4. Code quality and readability (1-10)
5. Suggestions for optimization
6. Overall score (0-100)

Format your response as:
CORRECT: [Yes/No]
TIME_COMPLEXITY: [answer]
SPACE_COMPLEXITY: [answer]
QUALITY: [1-10]
SCORE: [0-100]
SUGGESTIONS: [detailed suggestions]
"""
    
    response = await get_gemini_response(prompt, session_id)
    
    # Parse response
    lines = response.split('\n')
    passed = "CORRECT: Yes" in response or "CORRECT:Yes" in response
    score = 0
    suggestions = ""
    
    for line in lines:
        if "SCORE:" in line:
            try:
                score = int(line.split("SCORE:")[1].strip())
            except:
                score = 50
        if "SUGGESTIONS:" in line:
            suggestions = line.split("SUGGESTIONS:")[1].strip()
    
    # Save evaluation
    eval_id = str(uuid.uuid4())
    eval_doc = {
        "id": eval_id,
        "user_id": current_user['id'],
        "problem_id": submission.problem_id,
        "topic": submission.topic,
        "difficulty": submission.difficulty,
        "solve_time_seconds": submission.solve_time_seconds,
        "code": submission.code,
        "language": submission.language,
        "evaluation": response,
        "passed": passed,
        "suggestions": suggestions,
        "score": score,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await store_code_evaluation(eval_doc)
    
    return CodeEvaluation(**eval_doc)

@api_router.get("/code/submissions")
async def get_submissions(
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
):
    submissions = await fetch_code_submissions(current_user['id'], limit)
    return submissions


@api_router.delete("/code/submissions/{submission_id}")
async def delete_submission(submission_id: str, current_user: dict = Depends(get_current_user)):
    ok = await asyncio.to_thread(_delete_code_submission, current_user["id"], submission_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

# Resume Analysis Routes
@api_router.post("/resume/analyze", response_model=ResumeAnalysis)
async def analyze_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Read PDF
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    max_bytes = int(MAX_FILE_SIZE_MB) * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB")

    original_name = (file.filename or "resume.pdf").strip()
    ext = os.path.splitext(original_name)[1].lstrip(".").lower() or "pdf"
    allowed_exts = [e.strip().lower() for e in (ALLOWED_RESUME_FORMATS or []) if e and e.strip()]
    if allowed_exts and ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    analysis_id = str(uuid.uuid4())

    # Persist uploaded file for later download/view
    try:
        resume_dir_path = (ROOT_DIR / RESUME_UPLOAD_DIR).resolve()
        uploads_root_path = UPLOADS_ROOT.resolve()
        if uploads_root_path not in resume_dir_path.parents and resume_dir_path != uploads_root_path:
            # Ensure resumes are under the served /uploads mount
            resume_dir_path = (uploads_root_path / "resumes").resolve()
            resume_dir_path.mkdir(parents=True, exist_ok=True)
    except Exception:
        resume_dir_path = (UPLOADS_ROOT / "resumes")
        resume_dir_path.mkdir(parents=True, exist_ok=True)

    stored_name = f"{current_user['id']}_{analysis_id}.{ext}"
    stored_path = resume_dir_path / stored_name
    await asyncio.to_thread(stored_path.write_bytes, contents)

    # Compute served URL under /uploads
    try:
        relative_under_uploads = stored_path.resolve().relative_to(UPLOADS_ROOT.resolve()).as_posix()
        file_url = f"/uploads/{relative_under_uploads}"
    except Exception:
        file_url = None

    pdf_file = io.BytesIO(contents)
    
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
    
    session_id = f"{current_user['id']}_resume_{datetime.now().timestamp()}"
    
    prompt = f"""
Analyze this resume and detect:
1. Credibility score (0-100)
2. Potentially fake or exaggerated skills
3. Gaps or inconsistencies
4. Suggestions for improvement

Resume Content:
{text_content[:3000]}  

Provide response in format:
CREDIBILITY_SCORE: [0-100]
FAKE_SKILLS: [comma separated list or "None"]
SUGGESTIONS: [bullet points]
ANALYSIS: [detailed analysis]
"""
    
    response = await get_gemini_response(prompt, session_id)
    
    # Parse response
    credibility_score = 70  # default
    fake_skills = []
    suggestions = []
    
    lines = response.split('\n')
    for i, line in enumerate(lines):
        if "CREDIBILITY_SCORE:" in line:
            try:
                credibility_score = int(line.split("CREDIBILITY_SCORE:")[1].strip())
            except:
                pass
        if "FAKE_SKILLS:" in line:
            skills_text = line.split("FAKE_SKILLS:")[1].strip()
            if skills_text.lower() != "none":
                fake_skills = [s.strip() for s in skills_text.split(',')]
        if "SUGGESTIONS:" in line:
            # Collect following bullet points
            for j in range(i+1, min(i+5, len(lines))):
                if lines[j].strip().startswith('-') or lines[j].strip().startswith('•'):
                    suggestions.append(lines[j].strip())

    section_scores = _infer_resume_section_scores(text_content)
    
    # Save analysis
    analysis_doc = {
        "id": analysis_id,
        "user_id": current_user['id'],
        "filename": file.filename,
        "file_url": file_url,
        "text_content": text_content[:1000],  # Store first 1000 chars
        "credibility_score": credibility_score,
        "projects_score": section_scores.get("projects"),
        "skills_score": section_scores.get("skills"),
        "experience_score": section_scores.get("experience"),
        "ats_score": section_scores.get("ats"),
        "fake_skills": fake_skills,
        "suggestions": suggestions if suggestions else ["Improve technical skills section", "Add measurable achievements"],
        "analysis": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await store_resume_analysis(analysis_doc)
    
    return ResumeAnalysis(**analysis_doc)

@api_router.get("/resume/history")
async def get_resume_history(current_user: dict = Depends(get_current_user)):
    analyses = await fetch_resume_history(current_user['id'])
    return analyses


@api_router.get("/resume/latest", response_model=ResumeAnalysis)
async def get_latest_resume(current_user: dict = Depends(get_current_user)):
    latest = await fetch_latest_resume(current_user["id"])
    if not latest:
        raise HTTPException(status_code=404, detail="No resume analysis found")
    return ResumeAnalysis(**latest)


@api_router.get("/activity/heatmap")
async def get_activity_heatmap(days: int = 180, current_user: dict = Depends(get_current_user)):
    days = max(7, min(int(days), 365))
    dts = await asyncio.to_thread(_fetch_activity_dates, current_user["id"], days)
    counts: Dict[str, int] = {}
    for dt in dts:
        try:
            k = dt.astimezone(timezone.utc).date().isoformat()
        except Exception:
            continue
        counts[k] = counts.get(k, 0) + 1
    # Return as list for stable ordering in clients
    items = [{"date": k, "count": counts[k]} for k in sorted(counts.keys())]
    return {"days": days, "items": items}

# Mock Interview Routes
@api_router.post("/interview/start")
async def start_interview(interview_type: str, current_user: dict = Depends(get_current_user)):
    session_id = f"{current_user['id']}_interview_{datetime.now().timestamp()}"
    
    prompt = f"""
Generate 5 {interview_type} interview questions for a candidate.
Mix of easy, medium, and hard questions.

Provide in format:
Q1: [question]
Q2: [question]
Q3: [question]
Q4: [question]
Q5: [question]
"""
    
    response = await get_gemini_response(prompt, session_id)
    
    # Parse questions
    questions = []
    lines = response.split('\n')
    for line in lines:
        if line.strip().startswith('Q'):
            parts = line.split(':', 1)
            if len(parts) == 2:
                questions.append({
                    "id": str(uuid.uuid4()),
                    "question": parts[1].strip(),
                    "type": interview_type
                })
    
    return {"session_id": session_id, "questions": questions}

@api_router.post("/interview/evaluate", response_model=InterviewEvaluation)
async def evaluate_interview(interview_type: str, questions: List[Dict], answers: List[Dict], current_user: dict = Depends(get_current_user)):
    session_id = f"{current_user['id']}_eval_{datetime.now().timestamp()}"
    
    qa_text = ""
    for i, (q, a) in enumerate(zip(questions, answers)):
        qa_text += f"\nQ{i+1}: {q.get('question', '')}\nAnswer: {a.get('answer', '')}\n"
    
    prompt = f"""
Evaluate this {interview_type} interview:

{qa_text}

Provide:
1. Readiness score (0-100)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Overall feedback

Format:
READINESS_SCORE: [0-100]
STRENGTHS: [strength1, strength2, strength3]
WEAKNESSES: [weakness1, weakness2, weakness3]
FEEDBACK: [detailed feedback]
"""
    
    response = await get_gemini_response(prompt, session_id)
    
    # Parse response
    readiness_score = 70
    strengths = []
    weaknesses = []
    
    lines = response.split('\n')
    for line in lines:
        if "READINESS_SCORE:" in line:
            try:
                readiness_score = int(line.split("READINESS_SCORE:")[1].strip())
            except:
                pass
        if "STRENGTHS:" in line:
            str_text = line.split("STRENGTHS:")[1].strip()
            strengths = [s.strip() for s in str_text.split(',')]
        if "WEAKNESSES:" in line:
            weak_text = line.split("WEAKNESSES:")[1].strip()
            weaknesses = [w.strip() for w in weak_text.split(',')]
    
    # Save evaluation
    eval_id = str(uuid.uuid4())
    eval_doc = {
        "id": eval_id,
        "user_id": current_user['id'],
        "interview_type": interview_type,
        "questions": questions,
        "answers": answers,
        "evaluation": response,
        "readiness_score": readiness_score,
        "strengths": strengths if strengths else ["Good communication"],
        "weaknesses": weaknesses if weaknesses else ["Need more technical depth"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await store_interview_evaluation(eval_doc)
    
    return InterviewEvaluation(**eval_doc)


@api_router.get("/interview/history")
async def get_interview_history(limit: int = 50, current_user: dict = Depends(get_current_user)):
    limit = max(1, min(int(limit), 200))
    return await fetch_interview_history(current_user["id"], limit)

# Dashboard Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Get user statistics
    code_submissions = await count_code_submissions(current_user['id'])
    avg_code_score = await get_avg_code_score(current_user['id'])
    resume_analyses = await count_resume_analyses(current_user['id'])
    interviews_taken = await count_interview_evaluations(current_user['id'])
    learning_sessions = await count_learning_sessions(current_user['id'])
    crs = await calculate_career_readiness_score(current_user['id'])
    streak = await get_learning_streak_stats(current_user['id'])
    learning_consistency = await calculate_learning_consistency(current_user['id'])

    login_streak = await asyncio.to_thread(_get_login_streak_for_ui, current_user["id"])
    coding_streak = await asyncio.to_thread(_get_coding_streak_for_ui, current_user["id"])
    
    return {
        "code_submissions": code_submissions,
        "avg_code_score": round(avg_code_score, 2),
        "resume_analyses": resume_analyses,
        "interviews_taken": interviews_taken,
        "learning_sessions": learning_sessions,
        "career_readiness_score": crs,
        "learning_consistency_score": round(learning_consistency, 2),
        "current_streak": streak.get("current_streak", 0),
        "longest_streak": streak.get("longest_streak", 0),
        "active_days_30": streak.get("active_days_30", 0),
        "last_activity_at": streak.get("last_activity_at"),

        # Login-based streak (24h/48h logic)
        "login_current_streak": login_streak.get("current_streak", 0),
        "login_display_current_streak": login_streak.get("display_current_streak", 0),
        "login_longest_streak": login_streak.get("longest_streak", 0),
        "login_last_login_at": login_streak.get("last_login_at"),

        # Coding streak (based on passed code submissions)
        "coding_current_streak": coding_streak.get("current_streak", 0),
        "coding_display_current_streak": coding_streak.get("display_current_streak", 0),
        "coding_longest_streak": coding_streak.get("longest_streak", 0),
        "coding_last_solved_at": coding_streak.get("last_solved_at"),
    }


@api_router.get("/career/readiness")
async def get_career_readiness_dashboard(current_user: dict = Depends(get_current_user)):
    """SaaS-style Career Readiness aggregation endpoint.

    Returns a single payload for the Career Readiness page:
    - tracking (activity/coding/resume/interview/learning)
    - readiness score + breakdown
    - role eligibility + job links
    - prediction + what-if + daily/weekly plan
    - history timeline snapshots
    """

    user_id = current_user["id"]

    # Base metrics
    code_submissions = await count_code_submissions(user_id)
    avg_code_score = await get_avg_code_score(user_id)
    learning_sessions = await count_learning_sessions(user_id)
    learning_consistency = await calculate_learning_consistency(user_id)
    interviews_taken = await count_interview_evaluations(user_id)
    avg_interview = await get_avg_interview_readiness(user_id)
    resume_analyses = await count_resume_analyses(user_id)
    avg_resume = await get_avg_resume_credibility(user_id)

    # Prefer latest resume for section scores + recency
    latest_resume = await fetch_latest_resume(user_id)
    resume_score = float(latest_resume.get("credibility_score")) if latest_resume and latest_resume.get("credibility_score") is not None else float(avg_resume)

    streak = await get_learning_streak_stats(user_id)

    breakdown = _compute_crs_breakdown(avg_code_score, resume_score, avg_interview, learning_consistency)
    readiness_score = round(
        (breakdown["coding"]["score"] * 0.30)
        + (breakdown["resume"]["score"] * 0.25)
        + (breakdown["interview"]["score"] * 0.25)
        + (breakdown["learning"]["score"] * 0.20),
        2,
    )

    # Activity tracking derived from timestamps
    activity_dts = await asyncio.to_thread(_fetch_activity_dates, user_id, 120)
    activity_tracking = _compute_activity_tracking(activity_dts)
    time_spent_seconds_7 = await asyncio.to_thread(_fetch_time_spent_seconds, user_id, 7)
    time_spent_seconds_30 = await asyncio.to_thread(_fetch_time_spent_seconds, user_id, 30)
    activity_tracking["time_spent_seconds_7"] = int(time_spent_seconds_7)
    activity_tracking["time_spent_seconds_30"] = int(time_spent_seconds_30)
    last_activity_at = activity_tracking.get("last_activity_at") or streak.get("last_activity_at")

    pages_7d = await asyncio.to_thread(_fetch_page_analytics, user_id, 7, 10)
    pages_30d = await asyncio.to_thread(_fetch_page_analytics, user_id, 30, 10)

    # Coding stats (from stored evaluations)
    submissions = await fetch_code_submissions(user_id, 500)
    total = len(submissions)
    passed_count = sum(1 for s in submissions if s.get("passed"))
    accuracy = round((passed_count / total) * 100, 2) if total else 0.0
    solve_times = [s.get("solve_time_seconds") for s in submissions if isinstance(s.get("solve_time_seconds"), int)]
    avg_solve_time = int(sum(solve_times) / len(solve_times)) if solve_times else None

    diff_counts = {"easy": 0, "medium": 0, "hard": 0, "unknown": 0}
    topic_scores: dict = {}
    for s in submissions:
        diff = (s.get("difficulty") or "").strip().lower()
        if diff in diff_counts:
            diff_counts[diff] += 1
        else:
            diff_counts["unknown"] += 1

        t = (s.get("topic") or "").strip()
        if t:
            topic_scores.setdefault(t, []).append(float(s.get("score") or 0))

    topic_performance = [
        {"topic": t, "avg_score": round(sum(vals) / len(vals), 2), "count": len(vals)}
        for t, vals in topic_scores.items()
        if vals
    ]
    topic_performance.sort(key=lambda x: (x["avg_score"], x["count"]))
    weak_topics = [x["topic"] for x in topic_performance[:3]]

    # Resume section scores
    if latest_resume:
        projects_score = latest_resume.get("projects_score")
        skills_score = latest_resume.get("skills_score")
        experience_score = latest_resume.get("experience_score")
        ats_score = latest_resume.get("ats_score")
        if any(v is None for v in [projects_score, skills_score, experience_score, ats_score]):
            inferred = _infer_resume_section_scores(latest_resume.get("text_content"))
            projects_score = inferred.get("projects") if projects_score is None else projects_score
            skills_score = inferred.get("skills") if skills_score is None else skills_score
            experience_score = inferred.get("experience") if experience_score is None else experience_score
            ats_score = inferred.get("ats") if ats_score is None else ats_score
    else:
        inferred = _infer_resume_section_scores(None)
        projects_score = inferred.get("projects")
        skills_score = inferred.get("skills")
        experience_score = inferred.get("experience")
        ats_score = inferred.get("ats")

    # Interview breakdown
    interview_history = await fetch_interview_history(user_id, 200)
    interview_type_counts: dict = {}
    for ev in interview_history:
        it = (ev.get("interview_type") or "general").strip().lower()
        interview_type_counts[it] = interview_type_counts.get(it, 0) + 1
    last_interview_at = interview_history[0]["created_at"] if interview_history else None

    # Skills + role eligibility
    learning_topics = await asyncio.to_thread(_fetch_distinct_learning_topics, user_id, 200)
    known_skills = _extract_known_skills(
        current_user.get("profile_data") if isinstance(current_user.get("profile_data"), str) else json.dumps(current_user.get("profile_data") or {}),
        (latest_resume or {}).get("text_content") if latest_resume else None,
        learning_topics,
    )
    roles = _compute_role_eligibility(breakdown, known_skills)

    # Job links: generate search URLs per role
    # Location preference (optional)
    location_pref = "India"
    try:
        pd = current_user.get("profile_data")
        if isinstance(pd, str):
            pd = json.loads(pd)
        if isinstance(pd, dict):
            location_pref = (pd.get("location") or pd.get("preferred_location") or location_pref)
    except Exception:
        pass

    job_recommendations = []
    for r in roles[:5]:
        pct = float(r.get("eligibility_percentage") or 0)
        tag = "Stretch Role"
        if pct >= 80:
            tag = "Highly Matched"
        elif pct >= 60:
            tag = "Medium Match"

        for link in _job_search_links(r["role"], str(location_pref)):
            job_recommendations.append(
                {
                    "role": r["role"],
                    "match_tag": tag,
                    "source": link["source"],
                    "title": link["title"],
                    "url": link["url"],
                }
            )

    # Prediction + daily action lock + weekly plan
    prediction = _compute_prediction_and_action(readiness_score, breakdown, last_activity_at)
    action_date = _today_iso_date()
    locked = await asyncio.to_thread(_select_daily_action_lock, user_id, action_date)
    if not locked:
        locked = await asyncio.to_thread(_insert_daily_action_lock, user_id, action_date, prediction["best_action"])
    weekly_plan = _weekly_plan_from_blocker(prediction.get("biggest_blocker") or "")
    week_start = _week_start_monday_iso_date()
    weekly_done_map = await asyncio.to_thread(_select_weekly_checklist_state, user_id, week_start)

    # Timeline snapshots (1/day)
    await asyncio.to_thread(_insert_snapshot_if_missing, user_id, action_date, readiness_score, breakdown)
    history = await asyncio.to_thread(_fetch_snapshots, user_id, 30)

    # Confidence indicator
    confidence = prediction.get("confidence_score", 80)
    confidence_indicator = "High" if confidence >= 90 else "Medium" if confidence >= 80 else "Low"

    # Skill gaps / insights derived from top role
    top_role = roles[0] if roles else None
    skill_gaps = (top_role or {}).get("missing_skills", []) if top_role else []

    job_suggestions = _tracking_based_job_suggestions(
        roles=roles,
        location=str(location_pref),
        prediction=prediction,
        activity_tracking=activity_tracking,
        weak_topics=weak_topics,
    )

    return {
        "career_readiness_score": readiness_score,
        "level_badge": _crs_level_badge(readiness_score),
        "confidence": {"score": confidence, "indicator": confidence_indicator},
        "breakdown": breakdown,
        "tracking": {
            "activity": {
                "daily_login_activity": activity_tracking.get("daily_login_activity"),
                "active_days": {
                    "7": activity_tracking.get("active_days_7"),
                    "30": activity_tracking.get("active_days_30"),
                    "90": activity_tracking.get("active_days_90"),
                },
                "missed_learning_days_30": activity_tracking.get("missed_learning_days_30"),
                "last_activity_at": last_activity_at,
                "time_spent_seconds_7": activity_tracking.get("time_spent_seconds_7"),
                "time_spent_seconds_30": activity_tracking.get("time_spent_seconds_30"),
                "pages_7d": pages_7d,
                "pages_30d": pages_30d,
            },
            "learning": {
                "daily_login_activity": activity_tracking.get("daily_login_activity"),
                "active_days": {
                    "7": activity_tracking.get("active_days_7"),
                    "30": activity_tracking.get("active_days_30"),
                    "90": activity_tracking.get("active_days_90"),
                },
                "learning_streak": {
                    "current": streak.get("current_streak", 0),
                    "longest": streak.get("longest_streak", 0),
                },
                "learning_sessions": learning_sessions,
                "learning_consistency_score": round(float(learning_consistency), 2),
                "missed_learning_days_30": activity_tracking.get("missed_learning_days_30"),
                "last_activity_at": last_activity_at,
            },
            "coding": {
                "total_problems_solved": code_submissions,
                "easy_medium_hard": diff_counts,
                "topic_wise_performance": topic_performance,
                "accuracy_rate": accuracy,
                "average_solve_time_seconds": avg_solve_time,
                "consistency_score": round(float(learning_consistency), 2),
                "weak_topics": weak_topics,
            },
            "resume": {
                "resume_score": _clamp_0_100(resume_score),
                "sections": {
                    "projects": projects_score,
                    "skills": skills_score,
                    "experience": experience_score,
                    "ats_optimization": ats_score,
                },
                "resume_improvement_history_count": resume_analyses,
                "last_resume_review_date": (latest_resume or {}).get("created_at"),
            },
            "mock_interview": {
                "number_of_mock_interviews": interviews_taken,
                "types": interview_type_counts,
                "avg_readiness_score": round(float(avg_interview), 2),
                "last_mock_interview_date": last_interview_at,
            },
        },
        "role_eligibility": roles,
        "job_suggestions": job_suggestions,
        "job_recommendations": job_recommendations,
        "prediction": {
            "estimated_days_to_job_ready": prediction.get("estimated_days_to_job_ready"),
            "next_career_milestone": prediction.get("next_career_milestone"),
            "milestone_days": prediction.get("milestone_days"),
            "biggest_blocker": prediction.get("biggest_blocker"),
            "risk_level": prediction.get("risk_level"),
        },
        "what_if": prediction.get("what_if"),
        "action_plan": {
            "today": locked,
            "weekly": weekly_plan,
            "weekly_state": {
                "week_start": week_start,
                "done_map": weekly_done_map,
            },
        },
        "insights": {
            "skill_gaps": skill_gaps,
            "high_demand_skills": ["System Design", "Cloud (AWS/Azure)", "SQL", "DSA", "Docker"],
            "suggested_certifications": ["AWS Cloud Practitioner", "Azure Fundamentals", "Google Data Analytics"],
            "suggested_portfolio_projects": ["Full-stack CRUD app", "Resume ATS checker", "Coding tracker dashboard"],
            "networking_suggestions": ["Ask for 2 referrals", "Connect with 5 engineers on LinkedIn", "Join one local tech community"],
        },
        "history": history,
    }


class WeeklyChecklistPatch(BaseModel):
    week_start: str
    item_id: str
    done: bool


@api_router.patch("/career/weekly-checklist")
async def patch_weekly_checklist(payload: WeeklyChecklistPatch, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    week_start = (payload.week_start or "").strip()
    item_id = (payload.item_id or "").strip()
    if not week_start or len(week_start) < 10:
        raise HTTPException(status_code=400, detail="week_start is required")
    if not item_id:
        raise HTTPException(status_code=400, detail="item_id is required")

    done_map = await asyncio.to_thread(_patch_weekly_checklist_item, user_id, week_start, item_id, bool(payload.done))
    return {"ok": True, "week_start": week_start, "done_map": done_map}



@api_router.post("/activity/event")
async def post_activity_event(event: ActivityEvent, current_user: dict = Depends(get_current_user)):
    """Record lightweight activity events (page_view, time_spent, etc)."""
    user_id = current_user["id"]
    try:
        await asyncio.to_thread(_insert_activity_event, user_id, event)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to record activity event")
    return {"ok": True}


@api_router.get("/career/apply-tracker", response_model=List[ApplyTrackerItem])
async def get_apply_tracker(limit: int = Query(100, ge=1, le=300), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    items = await asyncio.to_thread(_list_apply_tracker_items, user_id, limit)
    return [ApplyTrackerItem(**i) for i in items]


@api_router.post("/career/apply-tracker", response_model=ApplyTrackerItem)
async def add_apply_tracker_item(payload: ApplyTrackerCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        item = await asyncio.to_thread(_upsert_apply_tracker_item, user_id, payload)
        return ApplyTrackerItem(**item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save apply tracker item")


@api_router.patch("/career/apply-tracker/{item_id}", response_model=ApplyTrackerItem)
async def update_apply_tracker_item(item_id: str, payload: ApplyTrackerUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        item = await asyncio.to_thread(_update_apply_tracker_item, user_id, item_id, payload)
        return ApplyTrackerItem(**item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update apply tracker item")


@api_router.delete("/career/apply-tracker/{item_id}")
async def delete_apply_tracker_item(item_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        await asyncio.to_thread(_delete_apply_tracker_item, user_id, item_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete apply tracker item")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Personal Goals – real-time SaaS tracking
# ---------------------------------------------------------------------------

class PersonalGoalCreate(BaseModel):
    title: str
    category: str = "custom"
    target: float = 1
    deadline: Optional[str] = None

class PersonalGoalUpdate(BaseModel):
    title: Optional[str] = None
    target: Optional[float] = None
    deadline: Optional[str] = None

def _list_personal_goals(user_id: str) -> list:
    with _sqlite_connection() as conn:
        rows = conn.execute(
            "SELECT id, user_id, title, category, target, deadline, created_at, updated_at FROM personal_goals WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]

def _create_personal_goal(user_id: str, payload: PersonalGoalCreate) -> dict:
    gid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO personal_goals (id, user_id, title, category, target, deadline, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
            (gid, user_id, payload.title, payload.category, float(payload.target), payload.deadline, now, now),
        )
        conn.commit()
    return {"id": gid, "user_id": user_id, "title": payload.title, "category": payload.category, "target": float(payload.target), "deadline": payload.deadline, "created_at": now, "updated_at": now}

def _update_personal_goal(user_id: str, goal_id: str, payload: PersonalGoalUpdate) -> dict:
    with _sqlite_connection() as conn:
        existing = conn.execute("SELECT * FROM personal_goals WHERE id = ? AND user_id = ?", (goal_id, user_id)).fetchone()
        if not existing:
            raise ValueError("Goal not found")
        updates = []
        params = []
        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title)
        if payload.target is not None:
            updates.append("target = ?")
            params.append(float(payload.target))
        if payload.deadline is not None:
            updates.append("deadline = ?")
            params.append(payload.deadline)
        now = datetime.now(timezone.utc).isoformat()
        updates.append("updated_at = ?")
        params.append(now)
        params.extend([goal_id, user_id])
        conn.execute(f"UPDATE personal_goals SET {', '.join(updates)} WHERE id = ? AND user_id = ?", params)
        conn.commit()
        row = conn.execute("SELECT * FROM personal_goals WHERE id = ?", (goal_id,)).fetchone()
    return dict(row)

def _delete_personal_goal(user_id: str, goal_id: str) -> None:
    with _sqlite_connection() as conn:
        existing = conn.execute("SELECT 1 FROM personal_goals WHERE id = ? AND user_id = ?", (goal_id, user_id)).fetchone()
        if not existing:
            raise ValueError("Goal not found")
        conn.execute("DELETE FROM personal_goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
        conn.commit()

def _compute_goal_progress(goal: dict, stats: dict) -> dict:
    """Compute real-time progress for a personal goal based on actual student data."""
    category = (goal.get("category") or "custom").lower()
    target = float(goal.get("target") or 1)
    progress = 0.0

    if category == "coding":
        progress = float(stats.get("code_submissions", 0))
    elif category == "resume":
        progress = float(stats.get("avg_resume_score", 0))
    elif category == "interview":
        progress = float(stats.get("interviews_taken", 0))
    elif category == "learning":
        progress = float(stats.get("learning_sessions", 0))
    elif category == "streak":
        progress = float(stats.get("current_streak", 0))
    elif category == "readiness":
        progress = float(stats.get("career_readiness_score", 0))
    else:
        progress = 0.0

    pct = min(100.0, (progress / target) * 100.0) if target > 0 else 0.0

    return {
        **goal,
        "progress": round(progress, 2),
        "percentage": round(pct, 2),
        "completed": progress >= target,
    }


@api_router.get("/career/personal-goals")
async def get_personal_goals(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    goals = await asyncio.to_thread(_list_personal_goals, user_id)

    # Gather real stats for progress computation
    code_subs = await count_code_submissions(user_id)
    avg_resume = await get_avg_resume_credibility(user_id)
    interviews = await count_interview_evaluations(user_id)
    learning = await count_learning_sessions(user_id)
    crs = await calculate_career_readiness_score(user_id)
    streak = await get_learning_streak_stats(user_id)

    stats_map = {
        "code_submissions": code_subs,
        "avg_resume_score": avg_resume,
        "interviews_taken": interviews,
        "learning_sessions": learning,
        "career_readiness_score": crs,
        "current_streak": streak.get("current_streak", 0),
    }

    # If user has no custom goals yet, provide smart defaults
    if not goals:
        now_iso = datetime.now(timezone.utc).isoformat()
        default_goals = [
            {"id": "default-coding", "user_id": user_id, "title": "Solve 50 coding problems", "category": "coding", "target": 50, "deadline": None, "created_at": now_iso, "updated_at": now_iso},
            {"id": "default-resume", "user_id": user_id, "title": "Resume score above 85%", "category": "resume", "target": 85, "deadline": None, "created_at": now_iso, "updated_at": now_iso},
            {"id": "default-interview", "user_id": user_id, "title": "Complete 10 mock interviews", "category": "interview", "target": 10, "deadline": None, "created_at": now_iso, "updated_at": now_iso},
            {"id": "default-learning", "user_id": user_id, "title": "Complete 30 learning sessions", "category": "learning", "target": 30, "deadline": None, "created_at": now_iso, "updated_at": now_iso},
        ]
        return [_compute_goal_progress(g, stats_map) for g in default_goals]

    return [_compute_goal_progress(g, stats_map) for g in goals]


@api_router.post("/career/personal-goals")
async def create_personal_goal(payload: PersonalGoalCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    goal = await asyncio.to_thread(_create_personal_goal, user_id, payload)
    return goal


@api_router.patch("/career/personal-goals/{goal_id}")
async def update_personal_goal(goal_id: str, payload: PersonalGoalUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        goal = await asyncio.to_thread(_update_personal_goal, user_id, goal_id, payload)
        return goal
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@api_router.delete("/career/personal-goals/{goal_id}")
async def delete_personal_goal_endpoint(goal_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        await asyncio.to_thread(_delete_personal_goal, user_id, goal_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"ok": True}


@api_router.get("/career/progress-delta")
async def get_progress_delta(current_user: dict = Depends(get_current_user)):
    """Compute real week-over-week and day-over-day progress deltas from snapshots."""
    user_id = current_user["id"]
    history = await asyncio.to_thread(_fetch_snapshots, user_id, 30)

    today_str = _today_iso_date()
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    fourteen_days_ago = (datetime.now(timezone.utc) - timedelta(days=14)).strftime("%Y-%m-%d")

    current_score = None
    week_ago_score = None
    two_weeks_ago_score = None

    for snap in reversed(history):
        d = snap.get("date", "")
        s = snap.get("readiness_score", 0)
        if d == today_str:
            current_score = s
        if d <= seven_days_ago and (week_ago_score is None or d >= seven_days_ago):
            week_ago_score = s
        if d <= fourteen_days_ago and (two_weeks_ago_score is None or d >= fourteen_days_ago):
            two_weeks_ago_score = s

    if current_score is None and history:
        current_score = history[-1].get("readiness_score", 0)

    weekly_delta = round(current_score - week_ago_score, 2) if current_score is not None and week_ago_score is not None else None
    prev_weekly_delta = round(week_ago_score - two_weeks_ago_score, 2) if week_ago_score is not None and two_weeks_ago_score is not None else None

    # Category-level deltas
    current_breakdown = history[-1].get("breakdown") if history else None
    week_ago_breakdown = None
    for snap in history:
        if snap.get("date", "") <= seven_days_ago:
            week_ago_breakdown = snap.get("breakdown")

    category_deltas = {}
    if current_breakdown and week_ago_breakdown:
        for cat in ["coding", "resume", "interview", "learning"]:
            cur = current_breakdown.get(cat, {}).get("score", 0) if isinstance(current_breakdown, dict) else 0
            prev = week_ago_breakdown.get(cat, {}).get("score", 0) if isinstance(week_ago_breakdown, dict) else 0
            category_deltas[cat] = round(cur - prev, 2)

    return {
        "current_score": current_score,
        "weekly_delta": weekly_delta,
        "previous_weekly_delta": prev_weekly_delta,
        "trend": "up" if weekly_delta and weekly_delta > 0 else ("down" if weekly_delta and weekly_delta < 0 else "stable"),
        "category_deltas": category_deltas,
        "history": history,
    }


@api_router.get("/achievements", response_model=List[AchievementCategory])
async def get_achievements(current_user: dict = Depends(get_current_user)):
    """Return real-time achievements for the current user."""
    # Gather stats
    learning_sessions = await count_learning_sessions(current_user['id'])
    code_submissions = await count_code_submissions(current_user['id'])
    resume_analyses = await count_resume_analyses(current_user['id'])
    interviews_taken = await count_interview_evaluations(current_user['id'])
    # Leaderboard: check if user is in top 10
    students = await fetch_users_by_role("student", 200)
    leaderboard = []
    for student in students:
        avg_score = await get_avg_code_score(student['id'])
        submissions = await count_code_submissions(student['id'])
        leaderboard.append({
            "id": student['id'],
            "name": student['name'],
            "avg_code_score": round(avg_score, 2),
            "code_submissions": submissions
        })
    leaderboard.sort(key=lambda x: (x['avg_code_score'], x['code_submissions']), reverse=True)
    user_rank = next((i+1 for i, u in enumerate(leaderboard) if u['id'] == current_user['id']), None)

    # Define achievements (can be expanded)
    achievements = [
        AchievementCategory(
            category="Learning Milestones",
            items=[
                AchievementItem(id=1, title="First Steps", desc="Complete first learning session", icon="🎯", earned=learning_sessions>=1, points=10, progress=learning_sessions, target=1),
                AchievementItem(id=2, title="Knowledge Seeker", desc="Complete 10 learning sessions", icon="📚", earned=learning_sessions>=10, points=50, progress=min(learning_sessions,10), target=10),
                AchievementItem(id=3, title="Learning Master", desc="Complete 50 learning sessions", icon="🎓", earned=learning_sessions>=50, points=200, progress=min(learning_sessions,50), target=50),
                AchievementItem(id=4, title="Unstoppable", desc="Learn for 7 days straight", icon="🔥", earned=learning_sessions>=7, points=100, progress=min(learning_sessions,7), target=7),
            ]
        ),
        AchievementCategory(
            category="Coding Excellence",
            items=[
                AchievementItem(id=5, title="Code Warrior", desc="Submit 10 code solutions", icon="⚔️", earned=code_submissions>=10, points=50, progress=min(code_submissions,10), target=10),
                AchievementItem(id=6, title="Bug Hunter", desc="Submit 50 solutions", icon="🐛", earned=code_submissions>=50, points=250, progress=min(code_submissions,50), target=50),
            ]
        ),
        AchievementCategory(
            category="Interview Prep",
            items=[
                AchievementItem(id=7, title="Interview Ready", desc="Complete 5 mock interviews", icon="🎤", earned=interviews_taken>=5, points=100, progress=min(interviews_taken,5), target=5),
                AchievementItem(id=8, title="Interview Pro", desc="Complete 20 interviews", icon="🎖️", earned=interviews_taken>=20, points=300, progress=min(interviews_taken,20), target=20),
            ]
        ),
        AchievementCategory(
            category="Special Achievements",
            items=[
                AchievementItem(id=9, title="Top 10", desc="Reach top 10 on leaderboard", icon="🏆", earned=(user_rank is not None and user_rank<=10), points=500, progress=user_rank or 0, target=10),
                AchievementItem(id=10, title="Resume Analyzer", desc="Analyze your resume", icon="📄", earned=resume_analyses>=1, points=50, progress=min(resume_analyses,1), target=1),
            ]
        ),
    ]
    return achievements

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = Query(10, ge=1, le=100), current_user: dict = Depends(get_current_user)):
    """Get leaderboard of top students by code performance."""
    try:
        students = await fetch_users_by_role("student", limit * 2)  # Get more to sort
        
        leaderboard = []
        for student in students:
            avg_score = await get_avg_code_score(student['id'])
            submissions = await count_code_submissions(student['id'])
            if submissions > 0:  # Only include students with submissions
                leaderboard.append({
                    "id": student['id'],
                    "name": student['name'],
                    "email": student['email'],
                    "avg_code_score": round(avg_score, 2),
                    "code_submissions": submissions,
                    "total_points": round(avg_score * submissions, 2)  # Simple scoring
                })
        
        # Sort by total points (avg_score * submissions), then by avg_score
        leaderboard.sort(key=lambda x: (x['total_points'], x['avg_code_score']), reverse=True)
        
        return leaderboard[:limit]
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Company Portal Routes
@api_router.post("/company/tests", response_model=Test)
async def create_test(test_data: TestCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Only companies can create tests")
    
    test_id = str(uuid.uuid4())
    test_doc = {
        "id": test_id,
        "title": test_data.title,
        "description": test_data.description,
        "questions": test_data.questions,
        "duration": test_data.duration,
        "company_id": current_user['id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await store_test(test_doc)
    
    return Test(**test_doc)

@api_router.get("/company/tests")
async def get_company_tests(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Only companies can view their tests")
    
    tests = await get_company_tests(current_user['id'])
    return tests

@api_router.get("/company/candidates")
async def get_candidates(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    job_seekers = await fetch_users_by_role("job_seeker", 100)
    
    candidates_with_stats = []
    for seeker in job_seekers:
        latest_resume = await fetch_latest_resume(seeker['id'])
        avg_code = await get_avg_code_score(seeker['id'])
        
        candidates_with_stats.append({
            **seeker,
            "resume_score": latest_resume.get('credibility_score', 0) if latest_resume else 0,
            "avg_code_score": round(avg_code, 2)
        })
    
    return candidates_with_stats

@api_router.get("/company/analytics")
async def get_company_analytics(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get company tests and candidates
        tests = await get_company_tests(current_user['id'])
        candidates = await fetch_users_by_role("job_seeker", 1000)
        
        # Calculate analytics
        total_tests = len(tests)
        active_candidates = len([c for c in candidates if c.get('status') == 'active'])
        completed_tests = sum(len(test.get('submissions', [])) for test in tests)
        
        return {
            "total_tests": total_tests,
            "active_candidates": active_candidates,
            "completed_tests": completed_tests,
            "avg_candidates_per_test": round(completed_tests / max(total_tests, 1), 2)
        }
    except Exception as e:
        logger.error(f"Error fetching company analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/company/candidates/status")
async def get_candidates_status(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        candidates = await fetch_users_by_role("job_seeker", 100)
        
        status_counts = {
            "applied": 0,
            "screening": 0,
            "interviewed": 0,
            "offered": 0,
            "hired": 0,
            "rejected": 0
        }
        
        for candidate in candidates:
            status = candidate.get('application_status', 'applied')
            if status in status_counts:
                status_counts[status] += 1
        
        return status_counts
    except Exception as e:
        logger.error(f"Error fetching candidate status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/company/assessments")
async def get_company_assessments(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        assessments = await get_company_tests(current_user['id'])
        return assessments
    except Exception as e:
        logger.error(f"Error fetching assessments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/company/assessments")
async def create_assessment(assessment_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        assessment_id = str(uuid.uuid4())
        assessment_doc = {
            "id": assessment_id,
            "company_id": current_user['id'],
            "title": assessment_data.get('title'),
            "description": assessment_data.get('description'),
            "questions": assessment_data.get('questions', []),
            "duration": assessment_data.get('duration', 60),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        
        await store_test(assessment_doc)
        return assessment_doc
    except Exception as e:
        logger.error(f"Error creating assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/company/assessments/{assessment_id}")
async def delete_assessment(assessment_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Check if assessment belongs to company
        assessments = await get_company_tests(current_user['id'])
        assessment = next((a for a in assessments if a['id'] == assessment_id), None)
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Delete assessment (implement this function)
        await delete_test(assessment_id)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/company/jobs")
async def get_company_jobs(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        jobs = await get_company_jobs(current_user['id'])
        return jobs
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/company/jobs")
async def create_job(job_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        job_id = str(uuid.uuid4())
        job_doc = {
            "id": job_id,
            "company_id": current_user['id'],
            "title": job_data.get('title'),
            "description": job_data.get('description'),
            "requirements": job_data.get('requirements', []),
            "location": job_data.get('location'),
            "salary_range": job_data.get('salary_range'),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        
        await store_job(job_doc)
        return job_doc
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/company/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Check if job belongs to company
        jobs = await get_company_jobs(current_user['id'])
        job = next((j for j in jobs if j['id'] == job_id), None)
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Delete job (implement this function)
        await delete_job_record(job_id)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/company/candidates/{candidate_id}/action")
async def candidate_action(candidate_id: str, action_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        action = action_data.get('action')
        if action not in ['shortlist', 'reject', 'interview', 'offer', 'hire']:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        # Update candidate status
        await update_candidate_status(candidate_id, action)
        return {"success": True, "action": action}
    except Exception as e:
        logger.error(f"Error performing candidate action: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# College Admin Routes
@api_router.get("/college/students")
async def get_students(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    students = await fetch_users_by_role("student", 100)
    
    students_with_stats = []
    for student in students:
        learning_count = await count_learning_sessions(student['id'])
        code_count = await count_code_submissions(student['id'])

        login_streak = await asyncio.to_thread(_get_login_streak_for_ui, student["id"])
        
        students_with_stats.append({
            **student,
            "learning_sessions": learning_count,
            "code_submissions": code_count,

            # Streaks (accurate, server-side)
            "login_current_streak": login_streak.get("current_streak", 0),
            "login_display_current_streak": login_streak.get("display_current_streak", 0),
            "login_longest_streak": login_streak.get("longest_streak", 0),
            "login_last_login_at": login_streak.get("last_login_at"),

            # Backward-compatible alias used by some UIs
            "streak": login_streak.get("display_current_streak", 0),
        })
    
    return students_with_stats

# Learning Progress Routes
class LearningProgressUpdate(BaseModel):
    pathId: int
    moduleId: int
    completed: bool

@api_router.get("/learning/progress")
async def get_learning_progress(current_user: dict = Depends(get_current_user)):
    """Get user's learning progress from database"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT progress_data FROM learning_progress WHERE user_id = ?",
            (current_user['id'],)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {"progress": json.loads(row['progress_data']), "paths": None}
        return {"progress": {}, "paths": None}
    except Exception as e:
        logger.error(f"Error fetching learning progress: {e}")
        return {"progress": {}, "paths": None}

@api_router.post("/learning/progress")
async def update_learning_progress(
    progress: LearningProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's learning progress"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get existing progress
        cursor.execute(
            "SELECT progress_data FROM learning_progress WHERE user_id = ?",
            (current_user['id'],)
        )
        row = cursor.fetchone()
        
        if row:
            existing_progress = json.loads(row['progress_data'])
        else:
            existing_progress = {}
        
        # Update progress for the specific path
        path_key = str(progress.pathId)
        if path_key not in existing_progress:
            existing_progress[path_key] = {
                "progress": 0,
                "completedHours": 0,
                "completedModules": []
            }
        
        if progress.completed and progress.moduleId not in existing_progress[path_key]["completedModules"]:
            existing_progress[path_key]["completedModules"].append(progress.moduleId)
        
        # Save updated progress
        if row:
            cursor.execute(
                "UPDATE learning_progress SET progress_data = ?, updated_at = ? WHERE user_id = ?",
                (json.dumps(existing_progress), datetime.now(timezone.utc).isoformat(), current_user['id'])
            )
        else:
            cursor.execute(
                "INSERT INTO learning_progress (user_id, progress_data, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (current_user['id'], json.dumps(existing_progress), 
                 datetime.now(timezone.utc).isoformat(), datetime.now(timezone.utc).isoformat())
            )
        
        conn.commit()
        conn.close()
        
        return {"success": True, "progress": existing_progress}
    except Exception as e:
        logger.error(f"Error updating learning progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== COLLEGE ADMIN EXTENDED ROUTES ====================

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    type: str = "general"
    target_students: Optional[List[str]] = None

class StudentMessageCreate(BaseModel):
    to_id: str
    subject: str
    message: str

@api_router.get("/college/analytics")
async def get_college_analytics(current_user: dict = Depends(get_current_user)):
    """Get analytics data for college admin dashboard"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    students = await fetch_users_by_role("student", 1000)
    total_students = len(students)
    
    # Calculate statistics
    total_learning_sessions = 0
    total_code_submissions = 0
    active_students = 0
    
    for student in students:
        learning_count = await count_learning_sessions(student['id'])
        code_count = await count_code_submissions(student['id'])
        total_learning_sessions += learning_count
        total_code_submissions += code_count
        if learning_count > 0 or code_count > 0:
            active_students += 1
    
    # Get weekly trend data (simulated based on actual data)
    weekly_data = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for i, day in enumerate(days):
        weekly_data.append({
            "day": day,
            "sessions": max(0, total_learning_sessions // 7 + (i % 3) * 5),
            "submissions": max(0, total_code_submissions // 7 + (i % 4) * 3)
        })
    
    return {
        "total_students": total_students,
        "active_students": active_students,
        "total_learning_sessions": total_learning_sessions,
        "total_code_submissions": total_code_submissions,
        "avg_sessions_per_student": round(total_learning_sessions / max(1, total_students), 2),
        "avg_submissions_per_student": round(total_code_submissions / max(1, total_students), 2),
        "engagement_rate": round((active_students / max(1, total_students)) * 100, 1),
        "weekly_data": weekly_data
    }

@api_router.post("/college/announcements")
async def create_announcement(
    announcement: AnnouncementCreate, 
    current_user: dict = Depends(get_current_user)
):
    """Create a new announcement"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    announcement_id = str(uuid.uuid4())
    
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO announcements (id, college_admin_id, title, message, type, target_students, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                announcement_id,
                current_user['id'],
                announcement.title,
                announcement.message,
                announcement.type,
                json.dumps(announcement.target_students) if announcement.target_students else None,
                datetime.now(timezone.utc).isoformat()
            )
        )
        conn.commit()
    
    return {
        "id": announcement_id,
        "title": announcement.title,
        "message": announcement.message,
        "type": announcement.type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/college/announcements")
async def get_announcements(current_user: dict = Depends(get_current_user)):
    """Get all announcements for college admin"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT id, title, message, type, target_students, created_at 
               FROM announcements 
               WHERE college_admin_id = ? 
               ORDER BY created_at DESC""",
            (current_user['id'],)
        )
        rows = cursor.fetchall()
    
    announcements = []
    for row in rows:
        record = dict(row)
        record['target_students'] = json.loads(record['target_students']) if record.get('target_students') else []
        announcements.append(record)
    
    return announcements


@api_router.get("/student/notifications")
async def get_student_notifications(current_user: dict = Depends(get_current_user)):
    """Get in-app notifications for students.

    Currently aggregates:
    - College admin announcements (filtered by target_students when present)
    - New job postings (recent active jobs)
    - Internship application status updates (from premium applications)
    """
    if current_user.get('role') != 'student':
        raise HTTPException(status_code=403, detail="Access denied")

    user_id = str(current_user.get('id') or "")
    user_email = str(current_user.get('email') or "")

    notifications: List[dict] = []

    # New job postings (recent)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT id, title, department, location, type, created_at
               FROM job_postings
               WHERE status = 'active' AND created_at >= ?
               ORDER BY created_at DESC""",
            (cutoff,),
        )
        job_rows = cursor.fetchall()

    for row in job_rows:
        job = dict(row)
        created_at = job.get('created_at') or datetime.now(timezone.utc).isoformat()
        title = job.get('title') or 'Job'
        location = job.get('location')
        job_type = job.get('type')
        parts = [p for p in [location, job_type] if p]
        suffix = f" ({' • '.join(parts)})" if parts else ""
        notifications.append(
            {
                "id": f"job:{job['id']}",
                "category": "push",
                "source": "company",
                "type": "new_job",
                "title": "New Job Posted",
                "message": f"{title}{suffix}",
                "created_at": created_at,
            }
        )

    # Announcements
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT id, title, message, type, target_students, created_at
               FROM announcements
               ORDER BY created_at DESC"""
        )
        rows = cursor.fetchall()

    for row in rows:
        record = dict(row)
        targets = []
        if record.get('target_students'):
            try:
                targets = json.loads(record['target_students']) or []
            except Exception:
                targets = []

        # If targets is empty, treat as broadcast. Otherwise match user id/email.
        is_broadcast = not targets
        is_targeted = user_id in targets or user_email in targets
        if not (is_broadcast or is_targeted):
            continue

        created_at = record.get('created_at') or datetime.now(timezone.utc).isoformat()
        notifications.append(
            {
                "id": f"announcement:{record['id']}",
                "category": "push",
                "source": "college_admin",
                "type": record.get('type') or "general",
                "title": record.get('title') or "Announcement",
                "message": record.get('message') or "",
                "created_at": created_at,
            }
        )

    # Internship application updates
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT id, internship_title, application_date, status
               FROM internship_applications
               WHERE user_id = ?
               ORDER BY application_date DESC""",
            (user_id,),
        )
        app_rows = cursor.fetchall()

    for row in app_rows:
        app = dict(row)
        status = (app.get('status') or 'applied').strip()
        created_at = app.get('application_date') or datetime.now(timezone.utc).isoformat()
        internship_title = app.get('internship_title') or 'Internship'

        # Use application id + status so status changes surface as a new notification
        notifications.append(
            {
                "id": f"application:{app['id']}:{status}",
                "category": "push",
                "source": "company",
                "type": "application_update",
                "title": "Application Update",
                "message": f"Your application for '{internship_title}' is {status}.",
                "created_at": created_at,
            }
        )

    # Sort newest first (ISO timestamps sort lexicographically in normal cases)
    notifications.sort(key=lambda n: str(n.get('created_at') or ""), reverse=True)

    return notifications

@api_router.delete("/college/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an announcement"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            "DELETE FROM announcements WHERE id = ? AND college_admin_id = ?",
            (announcement_id, current_user['id'])
        )
        conn.commit()
    
    return {"success": True}

@api_router.post("/college/students/{student_id}/message")
async def send_student_message(
    student_id: str, 
    message_data: StudentMessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to a student"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    message_id = str(uuid.uuid4())
    
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO student_messages (id, from_id, to_id, subject, message, created_at) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                message_id,
                current_user['id'],
                student_id,
                message_data.subject,
                message_data.message,
                datetime.now(timezone.utc).isoformat()
            )
        )
        conn.commit()
    
    return {"success": True, "message_id": message_id}

@api_router.get("/college/students/{student_id}/details")
async def get_student_details(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information about a specific student"""
    if current_user['role'] != 'college_admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get student basic info
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, email, name, role, created_at FROM users WHERE id = ?",
            (student_id,)
        )
        student = cursor.fetchone()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_dict = dict(student)
    
    # Get statistics
    learning_sessions = await count_learning_sessions(student_id)
    code_submissions = await count_code_submissions(student_id)
    avg_code_score = await get_avg_code_score(student_id)
    resume_analyses = await count_resume_analyses(student_id)
    interviews_taken = await count_interview_evaluations(student_id)
    
    # Get recent code submissions
    code_history = await fetch_code_submissions(student_id, 5)
    
    return {
        **student_dict,
        "statistics": {
            "learning_sessions": learning_sessions,
            "code_submissions": code_submissions,
            "avg_code_score": round(avg_code_score, 2),
            "resume_analyses": resume_analyses,
            "interviews_taken": interviews_taken
        },
        "recent_submissions": code_history
    }

# ==================== COMPANY PORTAL EXTENDED ROUTES ====================

class JobPostingCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    requirements: List[str]

class AssessmentCreate(BaseModel):
    title: str
    type: str
    questions: List[Dict[str, Any]]
    duration: int
    passing_score: int

class CandidateActionCreate(BaseModel):
    action: str  # shortlist, reject, schedule_interview, hire
    notes: Optional[str] = None
    interview_date: Optional[str] = None
    interview_type: Optional[str] = None

@api_router.get("/company/analytics")
async def get_company_analytics(current_user: dict = Depends(get_current_user)):
    """Get analytics data for company dashboard"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get job postings count
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT COUNT(*) as count FROM job_postings WHERE company_id = ?",
            (current_user['id'],)
        )
        job_count = cursor.fetchone()['count']
        
        # Get active jobs
        cursor = conn.execute(
            "SELECT COUNT(*) as count FROM job_postings WHERE company_id = ? AND status = 'active'",
            (current_user['id'],)
        )
        active_jobs = cursor.fetchone()['count']
        
        # Get candidate actions
        cursor = conn.execute(
            "SELECT action, COUNT(*) as count FROM candidate_actions WHERE company_id = ? GROUP BY action",
            (current_user['id'],)
        )
        action_stats = {row['action']: row['count'] for row in cursor.fetchall()}
        
        # Get assessments
        cursor = conn.execute(
            "SELECT COUNT(*) as count FROM assessments WHERE company_id = ?",
            (current_user['id'],)
        )
        assessment_count = cursor.fetchone()['count']
    
    # Get total candidates
    job_seekers = await fetch_users_by_role("job_seeker", 1000)
    
    # Weekly trend data
    weekly_data = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for i, day in enumerate(days):
        weekly_data.append({
            "day": day,
            "applications": max(0, len(job_seekers) // 7 + (i % 5) * 2),
            "interviews": max(0, action_stats.get('schedule_interview', 0) // 7 + (i % 3))
        })
    
    return {
        "total_jobs": job_count,
        "active_jobs": active_jobs,
        "total_candidates": len(job_seekers),
        "shortlisted": action_stats.get('shortlist', 0),
        "rejected": action_stats.get('reject', 0),
        "interviews_scheduled": action_stats.get('schedule_interview', 0),
        "hired": action_stats.get('hire', 0),
        "total_assessments": assessment_count,
        "weekly_data": weekly_data
    }

@api_router.post("/company/jobs")
async def create_job_posting(job: JobPostingCreate, current_user: dict = Depends(get_current_user)):
    """Create a new job posting"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    job_id = str(uuid.uuid4())
    
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO job_postings 
               (id, company_id, title, department, location, type, salary_min, salary_max, description, requirements, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)""",
            (
                job_id,
                current_user['id'],
                job.title,
                job.department,
                job.location,
                job.type,
                job.salary_min,
                job.salary_max,
                job.description,
                json.dumps(job.requirements),
                datetime.now(timezone.utc).isoformat()
            )
        )
        conn.commit()
    
    return {
        "id": job_id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "type": job.type,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/company/jobs")
async def get_job_postings(current_user: dict = Depends(get_current_user)):
    """Get all job postings for company"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT * FROM job_postings WHERE company_id = ? ORDER BY created_at DESC""",
            (current_user['id'],)
        )
        rows = cursor.fetchall()
    
    jobs = []
    for row in rows:
        record = dict(row)
        record['requirements'] = json.loads(record['requirements']) if record.get('requirements') else []
        jobs.append(record)
    
    return jobs

@api_router.put("/company/jobs/{job_id}")
async def update_job_posting(job_id: str, job: JobPostingCreate, current_user: dict = Depends(get_current_user)):
    """Update a job posting"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            """UPDATE job_postings 
               SET title = ?, department = ?, location = ?, type = ?, salary_min = ?, salary_max = ?, description = ?, requirements = ?
               WHERE id = ? AND company_id = ?""",
            (
                job.title,
                job.department,
                job.location,
                job.type,
                job.salary_min,
                job.salary_max,
                job.description,
                json.dumps(job.requirements),
                job_id,
                current_user['id']
            )
        )
        conn.commit()
    
    return {"success": True}

@api_router.patch("/company/jobs/{job_id}/status")
async def update_job_status(job_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update job posting status"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            "UPDATE job_postings SET status = ? WHERE id = ? AND company_id = ?",
            (status, job_id, current_user['id'])
        )
        conn.commit()
    
    return {"success": True}

@api_router.delete("/company/jobs/{job_id}")
async def delete_job_posting(job_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a job posting"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            "DELETE FROM job_postings WHERE id = ? AND company_id = ?",
            (job_id, current_user['id'])
        )
        conn.commit()
    
    return {"success": True}

@api_router.post("/company/assessments")
async def create_assessment(assessment: AssessmentCreate, current_user: dict = Depends(get_current_user)):
    """Create a new assessment"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    assessment_id = str(uuid.uuid4())
    
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO assessments 
               (id, company_id, title, type, questions, duration, passing_score, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)""",
            (
                assessment_id,
                current_user['id'],
                assessment.title,
                assessment.type,
                json.dumps(assessment.questions),
                assessment.duration,
                assessment.passing_score,
                datetime.now(timezone.utc).isoformat()
            )
        )
        conn.commit()
    
    return {
        "id": assessment_id,
        "title": assessment.title,
        "type": assessment.type,
        "duration": assessment.duration,
        "passing_score": assessment.passing_score,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/company/assessments")
async def get_assessments(current_user: dict = Depends(get_current_user)):
    """Get all assessments for company"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT * FROM assessments WHERE company_id = ? ORDER BY created_at DESC""",
            (current_user['id'],)
        )
        rows = cursor.fetchall()
    
    assessments = []
    for row in rows:
        record = dict(row)
        record['questions'] = json.loads(record['questions']) if record.get('questions') else []
        assessments.append(record)
    
    return assessments

@api_router.put("/company/assessments/{assessment_id}")
async def update_assessment(assessment_id: str, assessment: AssessmentCreate, current_user: dict = Depends(get_current_user)):
    """Update an assessment"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            """UPDATE assessments 
               SET title = ?, type = ?, questions = ?, duration = ?, passing_score = ?
               WHERE id = ? AND company_id = ?""",
            (
                assessment.title,
                assessment.type,
                json.dumps(assessment.questions),
                assessment.duration,
                assessment.passing_score,
                assessment_id,
                current_user['id']
            )
        )
        conn.commit()
    
    return {"success": True}

@api_router.delete("/company/assessments/{assessment_id}")
async def delete_assessment(assessment_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an assessment"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        conn.execute(
            "DELETE FROM assessments WHERE id = ? AND company_id = ?",
            (assessment_id, current_user['id'])
        )
        conn.commit()
    
    return {"success": True}

@api_router.post("/company/candidates/{candidate_id}/action")
async def perform_candidate_action(
    candidate_id: str,
    action_data: CandidateActionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Perform an action on a candidate (shortlist, reject, schedule interview, hire)"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    action_id = str(uuid.uuid4())
    
    with _sqlite_connection() as conn:
        conn.execute(
            """INSERT INTO candidate_actions 
               (id, company_id, candidate_id, action, notes, interview_date, interview_type, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                action_id,
                current_user['id'],
                candidate_id,
                action_data.action,
                action_data.notes,
                action_data.interview_date,
                action_data.interview_type,
                datetime.now(timezone.utc).isoformat()
            )
        )
        conn.commit()
    
    return {"success": True, "action_id": action_id}

@api_router.get("/company/candidates/{candidate_id}/actions")
async def get_candidate_actions(candidate_id: str, current_user: dict = Depends(get_current_user)):
    """Get all actions performed on a candidate"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT * FROM candidate_actions 
               WHERE company_id = ? AND candidate_id = ? 
               ORDER BY created_at DESC""",
            (current_user['id'], candidate_id)
        )
        rows = cursor.fetchall()
    
    return [dict(row) for row in rows]

@api_router.get("/company/candidates/status")
async def get_candidates_with_status(current_user: dict = Depends(get_current_user)):
    """Get candidates with their current status (shortlisted, rejected, etc.)"""
    if current_user['role'] != 'company':
        raise HTTPException(status_code=403, detail="Access denied")
    
    job_seekers = await fetch_users_by_role("job_seeker", 100)
    
    # Get latest action for each candidate
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            """SELECT candidate_id, action, interview_date, interview_type, created_at
               FROM candidate_actions 
               WHERE company_id = ?
               ORDER BY created_at DESC""",
            (current_user['id'],)
        )
        actions = cursor.fetchall()
    
    # Create a map of latest action per candidate
    candidate_status = {}
    for action in actions:
        cid = action['candidate_id']
        if cid not in candidate_status:
            candidate_status[cid] = dict(action)
    
    candidates_with_status = []
    for seeker in job_seekers:
        latest_resume = await fetch_latest_resume(seeker['id'])
        avg_code = await get_avg_code_score(seeker['id'])
        
        status_info = candidate_status.get(seeker['id'], {})
        
        candidates_with_status.append({
            **seeker,
            "resume_score": latest_resume.get('credibility_score', 0) if latest_resume else 0,
            "avg_code_score": round(avg_code, 2),
            "status": status_info.get('action', 'new'),
            "interview_date": status_info.get('interview_date'),
            "interview_type": status_info.get('interview_type')
        })
    
    return candidates_with_status


# ==================== PREMIUM ENROLLMENT ROUTES ====================
@api_router.post("/premium/enroll-course")
async def enroll_course(
    course_id: int = Form(...),
    course_title: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    address: Optional[str] = Form(None),
    qualification: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    screenshot: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        screenshot_url = None
        if screenshot:
            content = await screenshot.read()
            if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB")

            premium_dir = UPLOADS_ROOT / "premium"
            premium_dir.mkdir(parents=True, exist_ok=True)
            safe_name = os.path.basename(screenshot.filename or "payment.png")
            stored_name = f"{uuid.uuid4()}_{safe_name}"
            stored_path = premium_dir / stored_name
            with open(stored_path, "wb") as f:
                f.write(content)
            screenshot_url = f"/uploads/premium/{stored_name}"

        enrollment_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "course_id": course_id,
            "course_title": course_title,
            "enrollment_date": datetime.now(timezone.utc).isoformat(),
            "status": "enrolled",
            "name": name,
            "email": email,
            "phone": phone,
            "address": address,
            "qualification": qualification,
            "experience": experience,
            "screenshot_url": screenshot_url
        }
        await store_course_enrollment(enrollment_doc)
        return {"message": "Successfully enrolled in course", "enrollment_id": enrollment_doc['id']}
    except Exception as e:
        logger.error(f"Error enrolling in course: {e}")
        raise HTTPException(status_code=500, detail="Failed to enroll in course")

@api_router.post("/premium/apply-internship")
async def apply_internship(
    internship_id: int = Form(...),
    internship_title: str = Form(...),
    company: str = Form(...),
    location: str = Form(...),
    duration: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    address: Optional[str] = Form(None),
    qualification: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    screenshot: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        screenshot_url = None
        if screenshot:
            content = await screenshot.read()
            if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB")

            premium_dir = UPLOADS_ROOT / "premium"
            premium_dir.mkdir(parents=True, exist_ok=True)
            safe_name = os.path.basename(screenshot.filename or "payment.png")
            stored_name = f"{uuid.uuid4()}_{safe_name}"
            stored_path = premium_dir / stored_name
            with open(stored_path, "wb") as f:
                f.write(content)
            screenshot_url = f"/uploads/premium/{stored_name}"

        application_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "internship_id": internship_id,
            "internship_title": internship_title,
            "application_date": datetime.now(timezone.utc).isoformat(),
            "status": "applied",
            "company": company,
            "location": location,
            "duration": duration,
            "name": name,
            "email": email,
            "phone": phone,
            "address": address,
            "qualification": qualification,
            "experience": experience,
            "screenshot_url": screenshot_url
        }
        await store_internship_application(application_doc)
        return {"message": "Successfully applied for internship", "application_id": application_doc['id']}
    except Exception as e:
        logger.error(f"Error applying for internship: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply for internship")


# ==================== ADMIN ROUTES ====================
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') not in ['admin', 'college_admin']:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@api_router.get("/admin/enrollments")
async def get_course_enrollments(current_admin: dict = Depends(get_current_admin)):
    try:
        enrollments = await asyncio.to_thread(_fetch_course_enrollments)
        return enrollments
    except Exception as e:
        logger.error(f"Error fetching enrollments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enrollments")

@api_router.put("/admin/enrollments/{enrollment_id}/status")
async def update_enrollment_status(
    enrollment_id: str,
    status: str = Query(..., description="New status: approved or rejected"),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        if status not in ['approved', 'rejected']:
            raise HTTPException(status_code=400, detail="Invalid status")
        await asyncio.to_thread(_update_enrollment_status, enrollment_id, status)
        return {"message": f"Enrollment {status}"}
    except Exception as e:
        logger.error(f"Error updating enrollment status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")

@api_router.get("/admin/applications")
async def get_internship_applications(current_admin: dict = Depends(get_current_admin)):
    try:
        applications = await asyncio.to_thread(_fetch_internship_applications)
        return applications
    except Exception as e:
        logger.error(f"Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch applications")

@api_router.put("/admin/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: str = Query(..., description="New status: approved or rejected"),
    current_admin: dict = Depends(get_current_admin)
):
    try:
        if status not in ['approved', 'rejected']:
            raise HTTPException(status_code=400, detail="Invalid status")
        await asyncio.to_thread(_update_application_status, application_id, status)
        return {"message": f"Application {status}"}
    except Exception as e:
        logger.error(f"Error updating application status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


# ==================== USER PREMIUM ROUTES ====================
@api_router.get("/premium/my-enrollments")
async def get_my_enrollments(current_user: dict = Depends(get_current_user)):
    try:
        enrollments = await asyncio.to_thread(_fetch_user_enrollments, current_user['id'])
        return enrollments
    except Exception as e:
        logger.error(f"Error fetching user enrollments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch enrollments")

@api_router.get("/premium/my-applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    try:
        applications = await asyncio.to_thread(_fetch_user_applications, current_user['id'])
        return applications
    except Exception as e:
        logger.error(f"Error fetching user applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch applications")


# ==================== LEADERBOARD ROUTE ====================
from fastapi import Query

class LeaderboardEntry(BaseModel):
    id: str
    name: str
    email: str
    avg_code_score: float
    code_submissions: int
    role: str
    created_at: str

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100, description="Number of top users to return")
):
    """Get top users for the leaderboard, ranked by average code score and submissions."""
    students = await fetch_users_by_role("student", 200)
    leaderboard = []
    for student in students:
        avg_score = await get_avg_code_score(student['id'])
        submissions = await count_code_submissions(student['id'])
        leaderboard.append({
            "id": student['id'],
            "name": student['name'],
            "email": student['email'],
            "avg_code_score": round(avg_score, 2),
            "code_submissions": submissions,
            "role": student['role'],
            "created_at": student['created_at']
        })
    # Sort by avg_code_score desc, then code_submissions desc
    leaderboard.sort(key=lambda x: (x['avg_code_score'], x['code_submissions']), reverse=True)
    return leaderboard[:limit]

# Include the router in the main app
app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "LearnovateX backend is running"}


# app.add_middleware(
#     CORSMiddleware,
#     allow_credentials=True,
#     allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

_init_sqlite_db()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

