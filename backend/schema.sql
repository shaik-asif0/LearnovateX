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
    created_at TEXT NOT NULL
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
