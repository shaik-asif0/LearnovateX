# ==================== IMPORTS ====================
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import asyncio
import PyPDF2
import io
import sqlite3
import json
import httpx

# Azure OpenAI SDK
from openai import AzureOpenAI

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

# ==================== APP SETUP ====================
# Create the main app without a prefix
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://purple-river-029d38c00.2.azurestaticapps.net"
    ],
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
load_dotenv(ROOT_DIR / '.env')

# Database Configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./learnovatex.db')
SQLITE_DB_PATH = ROOT_DIR / 'learnovatex.db'

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'learnovatex_super_secure_jwt_key_2026')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_DAYS = int(os.environ.get('JWT_EXPIRATION_DAYS', 7))
JWT_EXPIRATION_DELTA = timedelta(days=JWT_EXPIRATION_DAYS)

# AI Mode Configuration: 'demo', 'azure'
AI_MODE = os.environ.get('AI_MODE', 'demo')

# Azure OpenAI Configuration (for future use)
AZURE_OPENAI_API_KEY = os.environ.get('AZURE_OPENAI_API_KEY', '')
AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT', '')
AZURE_OPENAI_DEPLOYMENT = os.environ.get('AZURE_OPENAI_DEPLOYMENT', '')

# File Storage Configuration
UPLOAD_DIR = os.environ.get('UPLOAD_DIR', 'uploads')
RESUME_UPLOAD_DIR = os.environ.get('RESUME_UPLOAD_DIR', 'uploads/resumes')
CODE_UPLOAD_DIR = os.environ.get('CODE_UPLOAD_DIR', 'uploads/code_submissions')
MAX_FILE_SIZE_MB = int(os.environ.get('MAX_FILE_SIZE_MB', 5))
ALLOWED_RESUME_FORMATS = os.environ.get('ALLOWED_RESUME_FORMATS', 'pdf').split(',')

# Application Limits
MAX_DAILY_AI_REQUESTS = int(os.environ.get('MAX_DAILY_AI_REQUESTS', 20))
MAX_CODE_SUBMISSIONS_PER_DAY = int(os.environ.get('MAX_CODE_SUBMISSIONS_PER_DAY', 50))
MAX_INTERVIEWS_PER_DAY = int(os.environ.get('MAX_INTERVIEWS_PER_DAY', 5))

# Logging Configuration
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FILE = os.environ.get('LOG_FILE', 'logs/learnovatex.log')

# Email Configuration (optional)
ENABLE_EMAIL = os.environ.get('ENABLE_EMAIL', 'false').lower() == 'true'
SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT') or 587)
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
EMAIL_FROM = os.environ.get('EMAIL_FROM', '')

# App Configuration
APP_NAME = os.environ.get('APP_NAME', 'LearnovateX')
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
DEBUG = os.environ.get('DEBUG', 'true').lower() == 'true'

# AI Configuration
# Check AI mode and print appropriate message
if AI_MODE == 'azure' and AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT:
    print("✓ Azure OpenAI configured - AI features will use real-time responses")
elif AI_MODE == 'azure':
    print("⚠ Azure OpenAI mode selected but not configured - using demo mode")
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

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class TutorMessage(BaseModel):
    message: str
    topic: Optional[str] = None
    difficulty: Optional[str] = "intermediate"

class TutorResponse(BaseModel):
    response: str
    session_id: str

class CodeSubmission(BaseModel):
    code: str
    language: str
    problem_id: str
    user_id: str

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
    text_content: str
    credibility_score: int
    fake_skills: List[str]
    suggestions: List[str]
    analysis: str
    created_at: str

class InterviewQuestion(BaseModel):
    question: str
    type: str  # technical, behavioral, etc.

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
                created_at TEXT NOT NULL
            );
            """
        )
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
            CREATE TABLE IF NOT EXISTS code_evaluations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                problem_id TEXT,
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
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS resume_analyses (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT,
                text_content TEXT,
                credibility_score INTEGER,
                fake_skills TEXT,
                suggestions TEXT,
                analysis TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
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
                strengths TEXT,
                weaknesses TEXT,
                created_at TEXT NOT NULL
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
            "SELECT id, email, password, name, role, created_at FROM users WHERE email = ?", (email,)
        )
        return _row_to_dict(cursor.fetchone())


async def store_sqlite_user(user_doc: dict):
    await asyncio.to_thread(_insert_sqlite_user, user_doc)


async def fetch_sqlite_user(email: str) -> Optional[dict]:
    return await asyncio.to_thread(_get_sqlite_user, email)


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


def _insert_code_evaluation(eval_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO code_evaluations (id, user_id, problem_id, code, language, evaluation, passed, suggestions, score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                eval_doc['id'],
                eval_doc['user_id'],
                eval_doc['problem_id'],
                eval_doc['code'],
                eval_doc['language'],
                eval_doc['evaluation'],
                1 if eval_doc['passed'] else 0,
                eval_doc['suggestions'],
                eval_doc['score'],
                eval_doc['created_at'],
            ),
        )


def _fetch_code_submissions(user_id: str, limit: int = 100) -> List[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, problem_id, code, language, evaluation, passed, suggestions, score, created_at FROM code_evaluations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()
    submissions = [dict(row) for row in rows]
    for entry in submissions:
        entry['passed'] = bool(entry.get('passed'))
    return submissions


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


async def store_learning_history(history_doc: dict):
    await asyncio.to_thread(_insert_learning_history, history_doc)


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
            "INSERT INTO resume_analyses (id, user_id, filename, text_content, credibility_score, fake_skills, suggestions, analysis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                doc['id'],
                doc['user_id'],
                doc.get('filename'),
                doc.get('text_content'),
                doc.get('credibility_score'),
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
            "SELECT id, user_id, filename, text_content, credibility_score, fake_skills, suggestions, analysis, created_at FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
        rows = cursor.fetchall()
    return [_row_to_resume(row) for row in rows]


def _get_latest_resume(user_id: str) -> Optional[dict]:
    with _sqlite_connection() as conn:
        cursor = conn.execute(
            "SELECT id, user_id, filename, text_content, credibility_score, fake_skills, suggestions, analysis, created_at FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
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


def _insert_interview_evaluation(eval_doc: dict):
    with _sqlite_connection() as conn:
        conn.execute(
            "INSERT INTO interview_evaluations (id, user_id, interview_type, questions, answers, evaluation, readiness_score, strengths, weaknesses, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                eval_doc['id'],
                eval_doc['user_id'],
                eval_doc.get('interview_type'),
                json.dumps(eval_doc.get('questions', [])),
                json.dumps(eval_doc.get('answers', [])),
                eval_doc.get('evaluation'),
                eval_doc.get('readiness_score'),
                json.dumps(eval_doc.get('strengths', [])),
                json.dumps(eval_doc.get('weaknesses', [])),
                eval_doc['created_at'],
            ),
        )


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
    
    # Check internet connectivity for Azure mode
    if AI_MODE == 'azure' and not _check_internet_connectivity():
        logger.warning("No internet connection, falling back to demo mode")
        return _get_demo_response(prompt, response_type)
    
    # Check if Azure OpenAI is configured
    if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT:
        logger.warning("Azure OpenAI not configured, falling back to demo mode")
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
            
            response = await asyncio.to_thread(
                _call_azure_openai_sync,
                prompt,
                system_instruction
            )
            
            if not response.startswith("Error:"):
                logger.info(f"Successfully got Azure OpenAI response (type: {response_type})")
                return response
            
            # If AI call fails, fall back to demo mode
            if attempt == 2:
                logger.warning("Azure OpenAI failed, falling back to demo mode")
                return _get_demo_response(prompt, response_type)
                
        except Exception as e:
            logger.error(f"Error calling Azure OpenAI API (attempt {attempt + 1}): {e}")
            if attempt == 2:
                logger.warning("Azure OpenAI failed, falling back to demo mode")
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
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ai_mode": "azure" if AI_MODE == 'azure' else "demo",
        "azure_configured": bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT),
        "azure_endpoint": AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_API_KEY else None,
        "model": AZURE_OPENAI_DEPLOYMENT if AZURE_OPENAI_API_KEY else "demo-responses",
        "database": "sqlite",
        "version": "1.0.0"
    }


@api_router.get("/status")
async def get_status():
    """Get detailed system status"""
    return {
        "server": "running",
        "ai_service": {
            "mode": "Azure OpenAI" if AI_MODE == 'azure' else "Demo Mode",
            "configured": bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT),
            "endpoint": AZURE_OPENAI_ENDPOINT if AZURE_OPENAI_API_KEY else None,
            "deployment": AZURE_OPENAI_DEPLOYMENT if AZURE_OPENAI_API_KEY else None,
            "note": "Demo mode provides sample responses. Configure Azure OpenAI for full AI capabilities." if AI_MODE == 'demo' else "Azure OpenAI is active"
        },
        "features": {
            "ai_tutor": "active",
            "code_evaluation": "active",
            "resume_analyzer": "active",
            "mock_interviews": "active",
            "learning_paths": "active",
            "company_portal": "active",
            "college_admin": "active"
        },
        "database": {
            "type": "SQLite",
            "path": str(SQLITE_DB_PATH)
        }
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
    
    token = create_token(sqlite_user['id'], sqlite_user['email'])
    
    user_response = UserResponse(
        id=sqlite_user['id'],
        email=sqlite_user['email'],
        name=sqlite_user['name'],
        role=sqlite_user['role'],
        created_at=sqlite_user['created_at']
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# AI Tutor Routes
@api_router.post("/tutor/chat", response_model=TutorResponse)
async def tutor_chat(message: TutorMessage, current_user: dict = Depends(get_current_user)):
    session_id = f"{current_user['id']}_tutor_{datetime.now().timestamp()}"
    
    prompt = f"""
Topic: {message.topic if message.topic else 'General'}
Difficulty Level: {message.difficulty}
Student Question: {message.message}

Provide a detailed, step-by-step explanation. Use examples and analogies to make the concept clear.
"""
    
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
async def get_submissions(current_user: dict = Depends(get_current_user)):
    submissions = await get_user_code_submissions(current_user['id'])
    return submissions

# Resume Analysis Routes
@api_router.post("/resume/analyze", response_model=ResumeAnalysis)
async def analyze_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Read PDF
    contents = await file.read()
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
    
    # Save analysis
    analysis_id = str(uuid.uuid4())
    analysis_doc = {
        "id": analysis_id,
        "user_id": current_user['id'],
        "filename": file.filename,
        "text_content": text_content[:1000],  # Store first 1000 chars
        "credibility_score": credibility_score,
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
    
    return {
        "code_submissions": code_submissions,
        "avg_code_score": round(avg_code_score, 2),
        "resume_analyses": resume_analyses,
        "interviews_taken": interviews_taken,
        "learning_sessions": learning_sessions,
        "career_readiness_score": crs
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
        
        students_with_stats.append({
            **student,
            "learning_sessions": learning_count,
            "code_submissions": code_count
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

_init_sqlite_db()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
