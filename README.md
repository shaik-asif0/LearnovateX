# 🎓 LearnovateX – AI Learning & Career Readiness Platform

A comprehensive full-stack platform that combines **AI tutoring**, **automated code evaluation**, **resume analysis**, **mock interviews**, and **career tracking** - designed for final year projects and college demonstrations.

## ✨ Features

### For Students & Job Seekers

- **🧠 AI Personal Tutor**: Get step-by-step explanations for Python, Java, DSA, SQL, and Aptitude
- **💻 Coding Arena**: Practice coding with real-time AI evaluation and complexity analysis
- **📄 Resume Intelligence**: Upload your resume for AI-powered credibility scoring and improvement suggestions
- **🎯 Mock Interviews**: Practice technical and behavioral interviews with AI feedback
- **📈 Career Dashboard**: Track your progress, scores, and readiness metrics

### For Companies

- **🏢 Company Portal**: View job seeker profiles with AI-analyzed resume and code scores
- **✅ Candidate Ranking**: Automatically rank candidates based on skills and performance
- **📊 Assessment Tools**: Create and manage coding tests

### For Colleges

- **🏫 College Admin Panel**: Monitor student progress and learning activity
- **📉 Analytics**: Track batch performance and placement readiness
- **👥 Student Management**: View learning sessions and code submissions

## � Offline Functionality

The platform is designed to work seamlessly both online and offline:

- **📱 Progressive Web App (PWA)**: Install the app on your device for offline access
- **🎯 Demo Mode**: When offline, AI features automatically switch to demo mode with sample responses
- **💾 Local Data Storage**: All user data, progress, and submissions are stored locally
- **🔄 Automatic Detection**: The app detects online/offline status and adjusts functionality accordingly
- **⚡ Fast Loading**: Cached resources ensure quick loading even on slow connections

**Offline Capabilities:**

- View all dashboards and progress
- Access learning materials and roadmaps
- Practice coding problems (evaluation in demo mode)
- Review resume analysis (sample feedback)
- Take mock interviews (sample questions and feedback)
- All data persists locally and syncs when back online

## �🛠️ Tech Stack

### Backend

- **FastAPI**: High-performance Python web framework
- **SQLite**: Lightweight database for data storage
- **Azure OpenAI**: Microsoft's GPT-4 for real-time AI tutoring, code evaluation, and analysis
- **PyJWT**: Authentication and authorization
- **Azure SDK**: Cloud integration for AI services

### Frontend

- **React 19**: Modern UI library
- **React Router**: Client-side routing
- **Monaco Editor**: VS Code-like code editor
- **Recharts**: Beautiful data visualizations
- **Shadcn/UI**: Beautiful, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Sonner**: Toast notifications

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- SQLite (built-in with Python)
- Azure OpenAI API Key (see [AZURE_SETUP.md](AZURE_SETUP.md))

### Installation

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
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
uvicorn server:app --reload --host 0.0.0.0 --port 8001
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
- Backend API: `http://localhost:8001`
- API Docs: `http://localhost:8001/docs`

#### Option 2: Production

**Backend:**

```bash
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

**Frontend:**

```bash
cd frontend
yarn build
# Serve the build folder with any static server
```

## 👤 User Roles

The platform supports 4 different user roles:

1. **Student**: Access to learning features (tutor, coding, career dashboard)
2. **Job Seeker**: All student features + resume analysis and mock interviews
3. **Company**: Candidate management and hiring tools
4. **College Admin**: Student tracking and batch analytics

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8001/docs` for interactive API documentation powered by Swagger UI.

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

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
GEMINI_API_KEY="AIzaSyAnZyY8TXTprbmtQBWduoZErZ9nHXoVwBE"
JWT_SECRET="your-secret-key-change-in-production"
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Note**: For production, update `REACT_APP_BACKEND_URL` to your deployed backend URL.

## 🧪 Features in Detail

### 1. AI Personal Tutor

- Select topic (Python, Java, DSA, SQL, Aptitude)
- Choose difficulty level (Beginner, Intermediate, Advanced)
- Get detailed, step-by-step explanations
- Conversation history saved for each user

### 2. Coding Arena

- Built-in Monaco code editor (VS Code experience)
- Multiple language support
- AI evaluates:
  - Code correctness
  - Time complexity
  - Space complexity
  - Code quality (1-10)
  - Optimization suggestions
  - Overall score (0-100)

### 3. Resume Analyzer

- Upload PDF resumes
- AI extracts and analyzes content
- Provides:
  - Credibility score (0-100)
  - Detects potentially fake skills
  - Gap analysis
  - Improvement suggestions

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

## 💻 Code Structure

```
/app
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Node dependencies
│   └── .env               # Frontend env variables
│
└── README.md
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Environment-based secrets

## 💡 Key Design Decisions

1. **Gemini AI Integration**: Used Google's Gemini 3 Flash for fast, cost-effective AI responses
2. **MongoDB**: Flexible schema for diverse data types (users, code, resumes, interviews)
3. **Monaco Editor**: Professional code editing experience in the browser
4. **Shadcn/UI**: Beautiful, accessible components without the bloat
5. **Role-based Access**: Different experiences for students, companies, and colleges

## 🚀 Future Enhancements

- Real-time collaboration features
- Voice-based mock interviews
- Advanced plagiarism detection
- Integration with LinkedIn
- Mobile app (React Native)
- Advanced analytics and reporting
- Email notifications
- Social features (discussion forums)

## 🐛 Known Issues

- PDF parsing may struggle with complex resume formats
- Code execution is simulated (not actual execution)
- Large file uploads may timeout

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
REACT_APP_BACKEND_URL=https://learnovatex-backend.azurewebsites.net
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

This is a project template. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - Feel free to use this for your final year project or startup!

## 👨‍💻 Author

Built with ❤️ using:

- FastAPI
- React
- MongoDB
- Gemini AI

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

**Happy Learning! 🚀**
