# 🚀 LearnovateX QUICK START GUIDE

## Your AI Learning Platform is Ready!

All 13 features have been implemented and work in:

- **Demo mode** (no API key; sample responses)
- **Real AI mode** using **OpenAI Platform (openai.com)** _or_ **Azure OpenAI** (when configured)

### ✅ Completed Features

1. **User Authentication** - Multi-role support (Student, Job Seeker, Company, College Admin)
2. **AI Personal Tutor** - GPT-4 powered tutoring for Python, Java, DSA, SQL, Aptitude
3. **Adaptive Learning** - Performance tracking and difficulty adjustment
4. **Coding Arena** - Code editor with AI evaluation
5. **Resume Intelligence** - PDF upload and AI analysis
6. **Mock Interview** - AI-generated questions and evaluation
7. **Career Dashboard** - Progress tracking with charts
8. **Company Portal** - Candidate management
9. **College Admin Panel** - Student tracking
10. **Knowledge Base** - Document management
11. **Security Layer** - JWT authentication, bcrypt passwords
12. **API Documentation** - Auto-generated Swagger docs
13. **Responsive Design** - Mobile-friendly UI

## ⚡ Quick Setup (5 minutes)

### 1. Configure Azure OpenAI

### 1. Configure Real AI (OpenAI or Azure)

**CRITICAL**: For real AI responses, configure **either OpenAI** or **Azure OpenAI**:

```bash
# 1) Follow AZURE_SETUP.md for detailed instructions
# 2) Copy the env template
cp backend/.env.example backend/.env
# 3) In backend/.env choose ONE:
#    - AI_MODE=openai  (set OPENAI_API_KEY)
#    - AI_MODE=azure   (set AZURE_OPENAI_* including deployment)
# 4) Start backend and check /api/status
```

### 2. Start the Application

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Note: if you pull new backend changes (new routes like `/api/profile/avatar`), restart the backend process so the updated routes are loaded.

### Test Credentials

```
Email: testuser@example.com
Password: test123
Role: Student
```

## 📝 Quick Test Steps

### 1. Landing Page

- Visit http://localhost:3000
- See the beautiful landing page
- Click "Get Started Free"

### 2. Register/Login

- Choose "Register" tab
- Fill in your details
- Select a role (Student, Job Seeker, Company, or College Admin)
- Click "Create Account"

### 3. Dashboard

- After login, you'll see your personalized dashboard
- View your statistics (code submissions, average score, etc.)
- Click on any feature card to explore

### 4. AI Tutor

- Select topic (Python, Java, DSA, SQL, Aptitude)
- Choose difficulty level
- Ask any question
- Get detailed, step-by-step explanations

### 5. Coding Arena

- Select a problem
- Write your code in the Monaco editor
- Click "Evaluate Code"
- Get AI feedback on:
  - Correctness
  - Time/Space complexity
  - Code quality
  - Optimization suggestions

### 6. Resume Analyzer

- Drag & drop your PDF resume
- Click "Analyze Resume"
- Get:
  - Credibility score (0-100)
  - Fake skill detection
  - Improvement suggestions

### 7. Mock Interview

- Choose interview type (Technical, Behavioral, HR)
- Start interview
- Answer 5 AI-generated questions
- Submit for evaluation
- Get readiness score and feedback

### 8. Career Dashboard

- View your progress charts
- See performance metrics
- Get personalized recommendations

## 🔧 For Local Development

The application is already running via supervisor. If you need to make changes:

### Backend Changes

1. Edit files in `/app/backend/`
2. Hot reload is enabled (changes auto-apply)
3. Check logs: `tail -f /var/log/supervisor/backend.*.log`

### Frontend Changes

1. Edit files in `/app/frontend/src/`
2. Hot reload is enabled
3. Changes appear instantly

### Restart Services (if needed)

```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend (usually not needed)
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status
```

## 🔑 API Key Information

This project supports:

- **OpenAI Platform (openai.com)** via `AI_MODE=openai`
- **Azure OpenAI** via `AI_MODE=azure`

```
# AI Configuration
AI_MODE=demo  # or 'openai' or 'azure'

# OpenAI Platform (if using AI_MODE=openai)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Azure OpenAI (if using AI_MODE=azure)
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

# Security
JWT_SECRET=your-secret-key-change-in-production
```

## 📊 Database

**SQLite** is used for local storage (file: `backend/learnovatex.db`).

- `users` - User accounts and profiles
- `learning_history` - AI tutor conversations
- `code_evaluations` - Code submissions and scores
- `resume_analyses` - Resume analysis results
- `interview_evaluations` - Mock interview results
- `tests` - Company assessment tests

## 🎯 Testing Each Feature

### Test AI Tutor (via curl)

```bash
API_URL=http://localhost:8001
TOKEN="<your-token-here>"

curl -X POST "$API_URL/api/tutor/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain recursion",
    "topic": "dsa",
    "difficulty": "intermediate"
  }'
```

### Test Code Evaluation

```bash
curl -X POST "$API_URL/api/code/evaluate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello(): print(\"Hello\")",
    "language": "python",
    "problem_id": "test",
    "user_id": "test"
  }'
```

### Test Resume Analysis

```bash
curl -X POST "$API_URL/api/resume/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

## 🚨 Troubleshooting

### Backend Not Responding

```bash
sudo supervisorctl restart backend
tail -f /var/log/supervisor/backend.*.log
```

### Frontend Not Loading

```bash
sudo supervisorctl restart frontend
```

### Database Issues

```bash
sudo supervisorctl restart mongodb
```

### Check All Services

```bash
sudo supervisorctl status
```

## 📝 Next Steps

1. **Customize the Design**

   - Edit `/app/frontend/src/pages/` for page layouts
   - Modify `/app/frontend/src/index.css` for global styles

2. **Add More Features**

   - Voice-based interviews
   - Real code execution
   - Email notifications
   - Social features

3. **Deploy to Production**

   - Get your own Azure OpenAI or AWS Bedrock credentials
   - Update environment variables
   - Deploy backend to cloud (AWS, GCP, Azure)
   - Deploy frontend to Vercel/Netlify
   - Use managed MongoDB (MongoDB Atlas)

4. **Make it Your Own**
   - Change branding and colors
   - Add your college/company logo
   - Customize features for your needs

## 🎉 Success Indicators

Your platform is working if:

- ✅ Landing page loads at localhost:3000
- ✅ You can register and login
- ✅ AI tutor responds to questions
- ✅ Code evaluation provides feedback
- ✅ Resume analysis works with PDFs
- ✅ Mock interviews generate questions
- ✅ Dashboard shows statistics
- ✅ All API endpoints return 200 OK

## 📚 Documentation

- **Full README**: `/app/README.md`
- **API Docs**: http://localhost:8001/docs
- **Code Comments**: Check individual files

## 👏 Congratulations!

You now have a fully functional AI-powered learning and career platform with:

- 13+ major features
- 4 user roles
- Azure OpenAI integration (GPT-4)
- Beautiful UI
- Complete backend API
- MongoDB database
- Authentication & security

Ready for:

- Final year project presentation
- Startup MVP
- Portfolio showcase
- Further development

**Happy coding! 🚀**
