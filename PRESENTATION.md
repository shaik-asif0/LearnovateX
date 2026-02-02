# 🎓 LearnovateX – AI Learning & Career Readiness Platform

## College Project Presentation

**Repository**: [shaik-asif0/finalyearProject](https://github.com/shaik-asif0/finalyearProject)  
**Author**: Shaik Asif  
**Project Type**: Final Year College Project

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Key Features](#6-key-features)
7. [User Roles & Modules](#7-user-roles--modules)
8. [AI Integration](#8-ai-integration)
9. [Database Design](#9-database-design)
10. [API Endpoints](#10-api-endpoints)
11. [Screenshots & UI](#11-screenshots--ui)
12. [Future Enhancements](#12-future-enhancements)
13. [Conclusion](#13-conclusion)

---

## 1. Project Overview

### Project Title

**AI-Powered Learning & Career Readiness Platform**

### Project Type

Full-Stack Web Application with AI Integration

### Domain

Education Technology (EdTech) & Career Development

### Brief Description

A full-stack EdTech platform for AI-powered learning and career readiness. Features include:

- AI tutoring (Claude 3 via AWS Bedrock)
- Automated code evaluation (multi-language, real-time feedback)
- Resume analysis and credibility scoring
- Mock interviews (technical, HR, behavioral)
- Career dashboards and analytics
- Role-based modules for students, job seekers, companies, and college admins

---

## 2. Problem Statement

### Current Challenges in Education & Career Preparation

| Challenge                      | Impact                                                  |
| ------------------------------ | ------------------------------------------------------- |
| 🎓 **Expensive Coaching**      | Students spend ₹50,000-2,00,000+ on coaching institutes |
| ⏰ **Limited Personalization** | One-size-fits-all teaching approach                     |
| 📝 **Manual Resume Review**    | HR teams spend hours reviewing resumes                  |
| 🎤 **Interview Anxiety**       | Limited practice opportunities                          |
| 📊 **No Progress Tracking**    | Students unaware of their readiness level               |
| 🏢 **Hiring Inefficiency**     | Companies struggle to find skilled candidates           |

### Target Users

- **Students** preparing for placements
- **Job Seekers** looking for career opportunities
- **Companies** hiring fresh talent
- **College Administrators** tracking student progress

---

## 3. Proposed Solution

### Our Platform Provides

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Learning Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   👨‍🎓 Students          🏢 Companies        🏫 Colleges    │
│   ├─ AI Tutor          ├─ Candidate View   ├─ Analytics    │
│   ├─ Code Practice     ├─ Assessments      ├─ Progress     │
│   ├─ Resume Analysis   ├─ Hiring Tools     ├─ Reports      │
│   └─ Mock Interviews   └─ Rankings         └─ Management   │
│                                                             │
│              ╔═══════════════════════════╗                  │
│              ║   Claude 3 via AWS Bedrock║                  │
│              ╚═══════════════════════════╝                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits

✅ **24/7 AI Tutor** - Learn anytime, anywhere  
✅ **Instant Code Feedback** - Real-time evaluation  
✅ **Resume Credibility Score** - Know your resume strength  
✅ **Interview Practice** - Reduce anxiety, improve confidence  
✅ **Progress Dashboard** - Track improvement over time  
✅ **Cost Effective** - Fraction of coaching institute cost

---

## 4. System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    React.js Frontend                        │  │
│  │  • Landing Page    • Dashboard    • AI Tutor               │  │
│  │  • Coding Arena    • Resume Analyzer    • Mock Interview   │  │
│  │  • Company Portal  • College Admin      • Profile          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                         HTTP/REST                                 │
│                              ▼                                    │
├──────────────────────────────────────────────────────────────────┤
│                         SERVER LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   FastAPI Backend (Python)                  │  │
│  │  • Authentication (JWT)    • API Routes                    │  │
│  │  • Business Logic          • Data Validation               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                    ┌─────────┴─────────┐                         │
│                    ▼                   ▼                         │
│             ┌──────────┐       ┌──────────────┐                  │
│             │  SQLite  │       │ AWS Bedrock  │                  │
│             │ Database │       │  Claude 3    │                  │
│             └──────────┘       └──────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Request → Frontend → API Gateway → FastAPI →
    ├── Database (SQLite) → User Data, History
    └── AWS Bedrock API → AI Response → User
```

---

## 5. Technology Stack

### Frontend Technologies

| Technology        | Purpose               | Version |
| ----------------- | --------------------- | ------- |
| **React.js**      | UI Framework          | 18.x    |
| **React Router**  | Client-side Routing   | 6.x     |
| **Tailwind CSS**  | Styling Framework     | 3.x     |
| **Shadcn/UI**     | Component Library     | Latest  |
| **Monaco Editor** | Code Editor (VS Code) | Latest  |
| **Recharts**      | Data Visualization    | 2.x     |
| **Lucide React**  | Icons                 | Latest  |
| **Axios**         | HTTP Client           | Latest  |

### Backend Technologies

| Technology   | Purpose              | Version |
| ------------ | -------------------- | ------- |
| **Python**   | Programming Language | 3.11+   |
| **FastAPI**  | Web Framework        | 0.110+  |
| **SQLite**   | Database             | 3.x     |
| **JWT**      | Authentication       | PyJWT   |
| **Boto3**    | AWS SDK              | 1.34+   |
| **Pydantic** | Data Validation      | 2.x     |
| **Uvicorn**  | ASGI Server          | Latest  |

### Cloud Services

| Service         | Purpose              |
| --------------- | -------------------- |
| **AWS Bedrock** | AI/ML Model Hosting  |
| **Claude 3**    | Large Language Model |

---

## 6. Key Features

### 🧠 Feature 1: AI Personal Tutor

**Description:** Interactive AI tutor that provides personalized explanations

**Capabilities:**

- Multi-topic support (Python, Java, JavaScript, DSA, SQL, Aptitude)
- Difficulty level adjustment (Beginner, Intermediate, Advanced)
- Step-by-step explanations with examples
- Code snippets and practice suggestions
- Session history tracking

**How it Works:**

```
User Question → Topic Classification → AI Processing →
Structured Response → Save to History
```

---

### 💻 Feature 2: Coding Arena

**Description:** Practice coding with real-time AI evaluation

**Capabilities:**

- Monaco Editor (VS Code experience)
- Multiple programming languages
- 50+ coding problems across difficulty levels
- Real-time code evaluation
- Time & Space complexity analysis
- Optimization suggestions
- Code quality scoring (0-100)

**Evaluation Metrics:**
| Metric | Description |
|--------|-------------|
| Correctness | Logic and output accuracy |
| Time Complexity | Big O notation analysis |
| Space Complexity | Memory usage analysis |
| Code Quality | Readability and best practices |
| Overall Score | Weighted average (0-100) |

---

### 📄 Feature 3: Resume Intelligence

**Description:** AI-powered resume analysis and credibility scoring

**Capabilities:**

- PDF upload and parsing
- Credibility score (0-100)
- Fake skill detection
- ATS compatibility check
- Improvement suggestions
- Industry-specific recommendations

**Analysis Output:**

```
┌─────────────────────────────────────┐
│ Resume Credibility Score: 78/100    │
├─────────────────────────────────────┤
│ ✅ Skills Verified: 12/15           │
│ ⚠️  Potential Issues: 2             │
│ 💡 Suggestions: 5                   │
│ 📊 ATS Score: Good                  │
└─────────────────────────────────────┘
```

---

### 🎤 Feature 4: Mock Interviews

**Description:** Practice interviews with AI-generated questions and feedback

**Interview Types:**

- Technical Interview
- Behavioral Interview
- HR Interview
- System Design Interview

**Features:**

- AI-generated relevant questions
- Answer recording and tracking
- Timer for each question
- Comprehensive evaluation
- Readiness score calculation
- Strengths & weaknesses analysis

---

### 📊 Feature 5: Career Dashboard

**Description:** Track progress and career readiness metrics

**Dashboard Metrics:**

- Total learning sessions
- Code submissions count
- Average code score
- Resume analyses done
- Interviews practiced
- Skill progress charts
- Achievement badges

---

### 🏢 Feature 6: Company Portal

**Description:** Tools for companies to evaluate and hire candidates

**Capabilities:**

- View all job seeker profiles
- AI-analyzed resume scores
- Code evaluation history
- Candidate ranking system
- Shortlist management
- Assessment creation
- Interview scheduling

---

### 🏫 Feature 7: College Admin Panel

**Description:** Monitor and track student progress

**Capabilities:**

- Student list management
- Learning activity monitoring
- Code submission tracking
- Batch analytics
- Performance reports
- Placement readiness metrics

---

## 7. User Roles & Modules

### Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                      USER ROLES                              │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  STUDENT    │  JOB SEEKER │   COMPANY   │  COLLEGE ADMIN   │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ • AI Tutor  │ • AI Tutor  │ • Candidate │ • Student List   │
│ • Coding    │ • Coding    │   Search    │ • Analytics      │
│ • Resume    │ • Resume    │ • Rankings  │ • Progress       │
│ • Interview │ • Interview │ • Assess-   │   Tracking       │
│ • Dashboard │ • Dashboard │   ments     │ • Reports        │
│ • Learning  │ • Profile   │ • Shortlist │ • Announcements  │
│   Path      │             │ • Schedule  │                  │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### Module Access Matrix

| Module            | Student | Job Seeker | Company | College Admin |
| ----------------- | :-----: | :--------: | :-----: | :-----------: |
| AI Tutor          |   ✅    |     ✅     |   ❌    |      ❌       |
| Coding Arena      |   ✅    |     ✅     |   ❌    |      ❌       |
| Resume Analyzer   |   ✅    |     ✅     |   ❌    |      ❌       |
| Mock Interview    |   ✅    |     ✅     |   ❌    |      ❌       |
| Student Dashboard |   ✅    |     ✅     |   ❌    |      ❌       |
| Learning Path     |   ✅    |     ✅     |   ❌    |      ❌       |
| Company Portal    |   ❌    |     ❌     |   ✅    |      ❌       |
| College Admin     |   ❌    |     ❌     |   ❌    |      ✅       |

---

## 8. AI Integration

### AWS Bedrock Integration

**Model Used:** Claude 3 (Anthropic)

**Available Models:**
| Model | Use Case | Performance |
|-------|----------|-------------|
| Claude 3 Haiku | Fast responses | ⚡ Fastest |
| Claude 3 Sonnet | Balanced | ⚖️ Balanced |
| Claude 3 Opus | Complex tasks | 🧠 Most Capable |

### AI Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              get_ai_response()                       │ │
│  │  ┌─────────────┐     ┌─────────────────────────┐   │ │
│  │  │ Demo Mode   │ OR  │   AWS Bedrock Mode      │   │ │
│  │  │ (Free)      │     │   (Production)          │   │ │
│  │  └─────────────┘     └─────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### AI Features Implementation

```python
# Tutor Chat
async def tutor_chat(message, topic, difficulty):
    prompt = f"""
    Topic: {topic}
    Difficulty: {difficulty}
    Question: {message}

    Provide step-by-step explanation with examples.
    """
    return await get_ai_response(prompt)

# Code Evaluation
async def evaluate_code(code, language):
    prompt = f"""
    Evaluate this {language} code:
    {code}

    Analyze: Correctness, Time/Space Complexity,
    Quality Score, Suggestions
    """
    return await get_ai_response(prompt)

# Resume Analysis
async def analyze_resume(text):
    prompt = f"""
    Analyze this resume:
    {text}

    Provide: Credibility Score, Fake Skills Detection,
    Suggestions for Improvement
    """
    return await get_ai_response(prompt)
```

---

## 9. Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌─────────────────────┐
│    USERS     │       │  LEARNING_HISTORY   │
├──────────────┤       ├─────────────────────┤
│ id (PK)      │──┐    │ id (PK)             │
│ email        │  │    │ user_id (FK)        │
│ password     │  └───▶│ topic               │
│ name         │       │ difficulty          │
│ role         │       │ question            │
│ created_at   │       │ response            │
└──────────────┘       │ created_at          │
                       └─────────────────────┘

┌──────────────────────┐    ┌─────────────────────┐
│  CODE_EVALUATIONS    │    │  RESUME_ANALYSES    │
├──────────────────────┤    ├─────────────────────┤
│ id (PK)              │    │ id (PK)             │
│ user_id (FK)         │    │ user_id (FK)        │
│ problem_id           │    │ filename            │
│ code                 │    │ text_content        │
│ language             │    │ credibility_score   │
│ evaluation           │    │ fake_skills         │
│ passed               │    │ suggestions         │
│ suggestions          │    │ analysis            │
│ score                │    │ created_at          │
│ created_at           │    └─────────────────────┘
└──────────────────────┘

┌────────────────────────┐    ┌─────────────────────┐
│ INTERVIEW_EVALUATIONS  │    │   JOB_POSTINGS      │
├────────────────────────┤    ├─────────────────────┤
│ id (PK)                │    │ id (PK)             │
│ user_id (FK)           │    │ company_id (FK)     │
│ interview_type         │    │ title               │
│ questions              │    │ department          │
│ answers                │    │ location            │
│ evaluation             │    │ type                │
│ readiness_score        │    │ salary_min          │
│ strengths              │    │ salary_max          │
│ weaknesses             │    │ description         │
│ created_at             │    │ requirements        │
└────────────────────────┘    │ status              │
                              │ created_at          │
                              └─────────────────────┘
```

### Database Tables Summary

| Table                 | Purpose            | Records          |
| --------------------- | ------------------ | ---------------- |
| users                 | User accounts      | All users        |
| learning_history      | Tutor chat history | Per session      |
| code_evaluations      | Code submissions   | Per submission   |
| resume_analyses       | Resume uploads     | Per resume       |
| interview_evaluations | Mock interviews    | Per interview    |
| job_postings          | Company jobs       | Per posting      |
| assessments           | Company tests      | Per test         |
| announcements         | College notices    | Per announcement |

---

## 10. API Endpoints

### Authentication APIs

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| GET    | `/api/auth/me`       | Get current user  |

### AI Tutor APIs

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | `/api/tutor/chat` | Send message to AI tutor |

### Code Evaluation APIs

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| POST   | `/api/code/evaluate`    | Submit code for evaluation |
| GET    | `/api/code/submissions` | Get submission history     |

### Resume APIs

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/resume/analyze` | Upload and analyze resume |
| GET    | `/api/resume/history` | Get analysis history      |

### Interview APIs

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/api/interview/start`    | Start mock interview |
| POST   | `/api/interview/evaluate` | Evaluate interview   |

### Dashboard APIs

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/dashboard/stats` | Get user statistics    |
| GET    | `/api/health`          | System health check    |
| GET    | `/api/status`          | Detailed system status |

### Company APIs

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/company/candidates` | Get all candidates |
| POST   | `/api/company/tests`      | Create assessment  |
| GET    | `/api/company/tests`      | Get company tests  |

### College Admin APIs

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| GET    | `/api/college/students` | Get all students |

---

## 11. Screenshots & UI

### Application Pages

| Page                  | Description                                |
| --------------------- | ------------------------------------------ |
| **Landing Page**      | Hero section, features, user roles         |
| **Auth Page**         | Login/Register with role selection         |
| **Student Dashboard** | Progress cards, stats, quick actions       |
| **AI Tutor**          | Chat interface, topic selection, history   |
| **Coding Arena**      | Monaco editor, problems, evaluation        |
| **Resume Analyzer**   | Upload, analysis results, suggestions      |
| **Mock Interview**    | Question display, answer input, evaluation |
| **Learning Path**     | Course cards, progress tracking            |
| **Company Portal**    | Candidate list, filters, actions           |
| **College Admin**     | Student management, analytics              |

### UI Components Used

- Cards & Card Groups
- Buttons (Primary, Secondary, Outline)
- Form Inputs & Selects
- Badges & Tags
- Progress Bars
- Charts (Bar, Line, Pie)
- Modals & Dialogs
- Tabs & Navigation
- Toast Notifications
- Loading States

---

## 12. Future Enhancements

### Planned Features

| Feature                | Priority | Description                  |
| ---------------------- | -------- | ---------------------------- |
| 🎥 Video Interviews    | High     | Record video responses       |
| 📱 Mobile App          | High     | React Native mobile app      |
| 🤝 Peer Learning       | Medium   | Student collaboration        |
| 🎮 Gamification        | Medium   | Points, badges, leaderboards |
| 📈 Advanced Analytics  | Medium   | ML-based predictions         |
| 🌐 Multi-language      | Low      | Support regional languages   |
| 🔗 Job Board           | Low      | Direct job applications      |
| 📧 Email Notifications | Low      | Alerts and reminders         |

### Technical Improvements

- [ ] Add Redis caching for performance
- [ ] Implement WebSocket for real-time features
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Deploy to AWS/Cloud
- [ ] Add rate limiting
- [ ] Implement audit logging

---

## 13. Conclusion

### Project Summary

The **AI-Powered Learning & Career Readiness Platform** successfully addresses the key challenges in education and career preparation by providing:

✅ **Personalized Learning** - AI tutor adapts to student needs  
✅ **Practical Skill Building** - Coding practice with instant feedback  
✅ **Career Preparation** - Resume analysis and mock interviews  
✅ **Progress Tracking** - Comprehensive dashboards and analytics  
✅ **Multi-stakeholder Value** - Benefits students, companies, and colleges

### Key Achievements

| Metric          | Achievement                             |
| --------------- | --------------------------------------- |
| Pages Developed | 16+                                     |
| API Endpoints   | 20+                                     |
| AI Features     | 4 (Tutor, Code, Resume, Interview)      |
| User Roles      | 4 (Student, Job Seeker, Company, Admin) |
| UI Components   | 40+                                     |

### Learning Outcomes

- Full-stack web development with React & FastAPI
- AI/ML integration using AWS Bedrock
- Database design and management
- RESTful API design
- Modern UI/UX with Tailwind CSS
- Authentication & Authorization
- Cloud services integration

---

## 📚 References

1. React Documentation - https://react.dev
2. FastAPI Documentation - https://fastapi.tiangolo.com
3. AWS Bedrock - https://aws.amazon.com/bedrock
4. Tailwind CSS - https://tailwindcss.com
5. Shadcn/UI - https://ui.shadcn.com

---

## 🙏 Thank You!

### Project Team

- **Developer:** Shaik Asif
- **College:** [Your College Name]
- **Department:** [Your Department]
- **Batch:** [Your Batch Year]

### Contact

- 📧 Email: [your.email@example.com]
- 🔗 GitHub: [github.com/shaik-asif0](https://github.com/shaik-asif0)
- 💼 LinkedIn: [linkedin.com/in/your-profile]

---

_This project was developed as part of the [Course Name/Project Work] requirement._
