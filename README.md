# 🎓 LearnovateX – AI Learning & Career Readiness Platform

A full-stack platform that combines **AI tutoring**, **automated code evaluation**, **resume analysis**, **mock interviews**, and **career tracking** — designed for final year projects and college demonstrations.

**Repository**: [shaik-asif0/finalyearProject](https://github.com/shaik-asif0/finalyearProject)
**Author**: Shaik Asif
**Project Type**: Final Year College Project

## ✨ Features

### For Students & Job Seekers

- **🧠 AI Personal Tutor**: Step-by-step explanations for Python, Java, DSA, SQL, and Aptitude, with conversation history and difficulty levels.
- **💻 Coding Arena**: Practice coding with real-time AI evaluation, code correctness, complexity analysis, and optimization suggestions. Monaco Editor for a VS Code-like experience.
- **📄 Resume Intelligence**: Upload your resume (PDF/DOCX) for AI-powered credibility scoring, fake skill detection, gap analysis, and improvement suggestions. ATS-compliant PDF generation.
- **🎯 Mock Interviews**: Practice technical, behavioral, and HR interviews with AI-generated questions and detailed feedback.
- **📈 Career Dashboard**: Visualize progress, code scores, interview readiness, and receive personalized improvement suggestions.
- **📹 YouTube Transcript Extraction**: Extract and analyze transcripts from YouTube videos for learning and resume enrichment.
- **🖼️ OCR for Images**: Extract text from images (requires Tesseract) for resume and document analysis.

### For Companies

- **🏢 Company Portal**: View job seeker profiles with AI-analyzed resume and code scores.
- **✅ Candidate Ranking**: Automatically rank candidates based on skills, code, and interview performance.
- **📊 Assessment Tools**: Create, manage, and evaluate coding tests and assessments.
- **📂 Candidate Management**: Track candidate progress, submissions, and readiness.

### For Colleges

- **🏫 College Admin Panel**: Monitor student progress, learning activity, and code submissions.
- **📉 Analytics**: Track batch performance, placement readiness, and generate reports.
- **👥 Student Management**: View learning sessions, code submissions, and analytics for all students.

### Platform-wide

- **🔐 Secure Authentication**: JWT-based authentication, password hashing, and protected API routes.
- **🌐 PWA & Offline Mode**: Full offline support, demo/sample AI responses, and local data persistence.
- **🛡️ Role-based Access**: Distinct experiences for students, job seekers, companies, and college admins.
- **📊 Advanced Analytics**: Visual dashboards, performance metrics, and improvement tracking.
- **🧩 Extensible Plugin Architecture**: Modular backend and frontend for easy feature addition (see `plugins/` in frontend).

## 📶 Offline, Demo, and AI Modes

The platform is designed for seamless use in any environment:

- **📱 Progressive Web App (PWA)**: Installable for offline access on any device.
- **🎯 Demo Mode**: When AI is not configured or offline, all AI features use demo/sample responses for uninterrupted experience.
- **💾 Local Data Storage**: User data, progress, and submissions are stored locally and sync when online.
- **🔄 Automatic Detection**: App detects online/offline status and adjusts features accordingly.
- **⚡ Fast Loading**: Cached resources for quick loading, even on slow connections.

**Offline Capabilities:**

- View dashboards, progress, and analytics
- Access learning materials and roadmaps
- Practice coding problems (AI evaluation in demo mode)
- Review resume analysis (sample feedback)
- Take mock interviews (sample questions and feedback)
- All data persists locally and syncs when back online

## 🛠️ Tech Stack & Major Dependencies

### Backend

- **FastAPI**: High-performance Python web framework
- **SQLite**: Lightweight, file-based database
- **Azure OpenAI / OpenAI**: Real-time AI tutoring, code evaluation, and analysis (configurable)
- **PyJWT, python-jose, passlib, bcrypt**: Authentication, authorization, and password security
- **PyPDF2, python-docx**: PDF and DOCX resume parsing
- **youtube-transcript-api**: YouTube transcript extraction for learning and resume enrichment
- **Pillow, pytesseract**: OCR for extracting text from images (optional, requires Tesseract)
- **reportlab**: ATS-compliant PDF resume generation
- **SMTP (optional)**: Email-based OTP for password reset
- **Uvicorn, Gunicorn**: ASGI servers for development and production

### Frontend

- **React 18**: Modern UI library
- **React Router**: Client-side routing
- **Monaco Editor**: VS Code-like code editor
- **Recharts**: Data visualizations
- **Shadcn/UI**: Accessible, beautiful UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Sonner**: Toast notifications
- **Radix UI**: Advanced UI primitives
- **Axios**: HTTP client
- **Embla Carousel, Lucide, Three.js**: UI/UX enhancements
- **Plugin Support**: Modular plugin architecture for extensibility (see `frontend/plugins/`)

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- SQLite (built-in with Python)
- Azure OpenAI API Key (see [AZURE_SETUP.md](AZURE_SETUP.md))

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/shaik-asif0/finalyearProject.git
cd finalyearProject
```

#### 2. Azure OpenAI Setup

**IMPORTANT**: Configure Azure OpenAI for real AI responses:

1. Follow the detailed setup guide: [AZURE_SETUP.md](AZURE_SETUP.md)
2. Get your Azure OpenAI credentials
3. Update `backend/.env` with your API key and endpoint

#### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# The .env file is pre-configured for:
# - SQLite database
# - JWT authentication
# - AI_MODE=demo (for offline/demo mode) or AI_MODE=azure (for online AI)
# - Azure OpenAI integration (optional - only needed for AI_MODE=azure)
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
yarn install
# or
npm install
```

### Running the Application

#### Option 1: Development (Separate terminals)

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
yarn start
# or
npm start
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

#### Option 2: Production

**Backend:**

```bash
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Frontend:**

```bash
cd frontend
yarn build
# Serve the build folder with any static server
```

## 👤 User Roles & Flows

The platform supports 4 user roles, each with tailored features:

1. **Student**: Access AI tutor, coding arena, and career dashboard.
2. **Job Seeker**: All student features plus resume analysis and mock interviews.
3. **Company**: Candidate management, assessment tools, and hiring analytics.
4. **College Admin**: Student tracking, batch analytics, and placement readiness.

**Role-based onboarding and dashboards ensure a personalized experience for each user type.**

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

### Key Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### AI Tutor

- `POST /api/tutor/chat` - Chat with AI tutor

#### Code Evaluation

- `POST /api/code/evaluate` - Evaluate code submission
- `GET /api/code/submissions` - Get user's submissions

#### Resume Analysis

- `POST /api/resume/analyze` - Analyze resume (upload PDF)
- `GET /api/resume/history` - Get analysis history

#### Mock Interview

- `POST /api/interview/start` - Start interview session
- `POST /api/interview/evaluate` - Submit and evaluate interview

#### Dashboard

- `GET /api/dashboard/stats` - Get user statistics

#### Company Portal

- `POST /api/company/tests` - Create assessment
- `GET /api/company/tests` - Get company tests
- `GET /api/company/candidates` - Get all candidates

#### College Admin

- `GET /api/college/students` - Get student list with stats

## 🔐 Environment Variables

### Backend (.env)

Copy the template and edit it:

```bash
cp backend/.env.example backend/.env
```

```env
# Database Configuration (SQLite - no additional setup required)
DATABASE_URL=sqlite:///./learnovatex.db

# AI Configuration
AI_MODE=demo  # or 'azure' (Azure OpenAI) or 'openai' (OpenAI Platform)

# Azure OpenAI (only needed if AI_MODE=azure)
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

# OpenAI Platform (non-Azure) (only needed if AI_MODE=openai)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Security
JWT_SECRET=change-this-to-a-random-string-in-production
```

### Frontend (.env)

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

**Note**: For production, update `REACT_APP_API_BASE_URL` to your deployed backend URL.

## 🧪 Features in Detail

### 1. AI Personal Tutor

- Select topic (Python, Java, DSA, SQL, Aptitude)
- Choose difficulty level (Beginner, Intermediate, Advanced)
- Get detailed, step-by-step explanations
- Conversation history saved for each user

### 2. Coding Arena

- Monaco code editor (VS Code experience)
- Multiple language support
- AI evaluates:
  - Code correctness
  - Time complexity
  - Space complexity
  - Code quality (1-10)
  - Optimization suggestions
  - Overall score (0-100)

### 3. Resume Analyzer

- Upload PDF or DOCX resumes
- AI extracts and analyzes content
- Provides:
  - Credibility score (0-100)
  - Fake skill detection
  - Gap analysis
  - Improvement suggestions
  - ATS-compliant PDF generation
  - OCR for image-based resumes (optional)

### 4. Mock Interview

- Choose interview type (Technical, Behavioral, HR)
- AI generates 5 relevant questions
- Submit answers for each question
- Get comprehensive evaluation:
  - Readiness score (0-100)
  - Strengths
  - Areas for improvement
  - Detailed feedback

### 5. Career Dashboard

- Visual progress tracking with charts
- Performance metrics:
  - Code submissions count
  - Average code score
  - Interviews taken
  - Learning sessions
- Personalized improvement suggestions

### 6. YouTube Transcript Extraction

- Extract and analyze transcripts from YouTube videos for learning and resume enrichment

### 7. OCR for Images

- Extract text from images for resume and document analysis (requires Tesseract)

## 💻 Code Structure

```
.
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── schema.sql         # SQLite schema
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Axios client + utilities
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Node dependencies
│   └── staticwebapp.config.json
│
└── README.md
```

## 🛡️ Security & Privacy Features

- JWT-based authentication and authorization
- Password hashing with bcrypt
- Protected API routes and CORS configuration
- Environment-based secrets and configuration
- Role-based access control
- Local data storage for privacy in offline/demo mode

## 💡 Key Design Decisions

1. **Demo vs Azure/OpenAI**: `AI_MODE=demo` for offline/sample AI, `AI_MODE=azure` or `AI_MODE=openai` for real AI responses.
2. **SQLite Database**: Lightweight, easy to set up, and portable for local and demo use.
3. **Monaco Editor**: Professional code editing in the browser.
4. **Shadcn/UI & Radix**: Accessible, beautiful UI with minimal bloat.
5. **Role-based Access**: Personalized dashboards and flows for each user type.
6. **Plugin Architecture**: Modular design for easy extensibility (see `frontend/plugins/`).
7. **Offline-first**: All features work in demo mode without cloud dependencies.

## 🚀 Future Enhancements

- Real-time collaboration (pair programming, group interviews)
- Voice-based mock interviews and feedback
- Advanced plagiarism and code similarity detection
- LinkedIn and job portal integrations
- Mobile app (React Native)
- Advanced analytics, reporting, and export features
- Email and push notifications
- Social features (discussion forums, peer reviews)
- Cloud database support (PostgreSQL, Azure SQL)

## 🐛 Known Issues & Limitations

- PDF parsing may struggle with complex or non-standard resume formats
- Code execution is simulated (no sandboxed execution)
- Large file uploads may timeout
- OCR requires Tesseract to be installed on the system

## 🚀 Deployment to Azure

### Prerequisites

- Azure subscription
- GitHub repository
- Azure CLI (optional)

### Step 1: Create Azure Resources

#### Backend (Azure App Service)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Web App" resource
3. Choose:
   - **Runtime stack**: Python 3.11
   - **Operating System**: Linux
   - **Region**: Your preferred region
   - **App Service Plan**: Basic B1 or higher
4. Name it `learnovatex-backend` (or your choice)
5. Create the resource

#### Frontend (Azure Static Web Apps)

1. In Azure Portal, create "Static Web App"
2. Connect to your GitHub repository
3. Configure:
   - **Build preset**: React
   - **App location**: `/frontend`
   - **Output location**: `build`
   - **API location**: Leave empty (backend is separate)

### Step 2: Configure Environment Variables

#### Backend Environment Variables

In Azure App Service > Configuration > Application settings, add:

```
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4
DATABASE_URL=sqlite:///./learnovatex.db
ENVIRONMENT=production
DEBUG=false
```

#### Frontend Environment Variables

In Azure Static Web Apps > Configuration, add:

```
REACT_APP_API_BASE_URL=https://learnovatex-backend.azurewebsites.net
```

### Step 3: Deploy

The deployment is automated via GitHub Actions:

1. Push changes to the `main` branch
2. GitHub Actions will automatically deploy:
   - Frontend to Azure Static Web Apps
   - Backend to Azure App Service

### Step 4: Database Setup

For production, consider using Azure Database for PostgreSQL instead of SQLite.

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Deploy frontend build folder to Azure Static Web Apps

3. Deploy backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   # Use Azure CLI or portal to deploy
   ```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. For major features, open an issue first to discuss your idea

## 📝 License

MIT License - Feel free to use this for your final year project or startup!

## 👨‍💻 Author

**Shaik Asif**  
Final Year College Project  
Built with ❤️ using FastAPI, React, SQLite, and Azure OpenAI

---

## 🎉 Quick Start Guide

### For Students

1. Register with role "Student"
2. Explore AI Tutor for learning
3. Practice coding in Coding Arena
4. Track progress in Career Dashboard

### For Job Seekers

1. Register with role "Job Seeker"
2. Upload resume for analysis
3. Practice mock interviews
4. View career readiness score

### For Companies

1. Register with role "Company"
2. Browse candidate profiles
3. View AI-analyzed skills and scores
4. Create assessment tests

### For Colleges

1. Register with role "College Admin"
2. Monitor student progress
3. View batch analytics
4. Track placement readiness

---

**Need help?** Check the API documentation at `/docs` or review the code comments.

**Happy Learning and Coding! 🚀**
