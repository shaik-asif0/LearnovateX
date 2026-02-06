-- SQL schema that mirrors the collections used by the FastAPI backend.
-- These tables power authentication, analytics, and evaluation flows after dropping MongoDB.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    application_status TEXT DEFAULT 'applied',
    last_active TEXT,
    created_at TEXT NOT NULL,
    avatar_url TEXT,
    profile_data TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS learning_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT,
    question TEXT,
    response TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tutor_contexts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    text_content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS resume_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT,
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

CREATE TABLE IF NOT EXISTS career_readiness_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    readiness_score REAL NOT NULL,
    breakdown_json TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_action_locks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action_date TEXT NOT NULL,
    action_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS activity_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    path TEXT,
    duration_seconds INTEGER,
    metadata_json TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    questions TEXT,
    duration INTEGER,
    company_id TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    salary_range TEXT,
    created_at TEXT NOT NULL,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    target_students TEXT,
    created_at TEXT NOT NULL,
    created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    type TEXT DEFAULT 'message'
);

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

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    used_at TEXT,
    attempts INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
