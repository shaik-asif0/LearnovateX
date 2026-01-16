import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Bot,
  Code,
  FileText,
  MessageSquare,
  TrendingUp,
  Building2,
  GraduationCap,
  Users,
  Sparkles,
  Target,
  Trophy,
  BookOpen,
  Gamepad2,
  Award,
  Zap,
  Brain,
  BarChart3,
  Shield,
  Globe,
  Github,
  Rocket,
  ArrowRight,
  Play,
  Star,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <Bot className="w-12 h-12 text-white" />,
      title: "AI Personal Tutor",
      description:
        "Get personalized explanations for Python, Java, DSA, SQL, and more with adaptive learning powered by Azure OpenAI.",
      gradient: "from-purple-500 to-purple-600",
      details: [
        "24/7 AI assistance",
        "Adaptive difficulty",
        "Real-time feedback",
      ],
    },
    {
      icon: <Code className="w-12 h-12 text-white" />,
      title: "Code Evaluation",
      description:
        "Real-time code analysis with complexity checks, optimization suggestions, and plagiarism detection.",
      gradient: "from-green-500 to-green-600",
      details: ["Syntax validation", "Performance metrics", "Best practices"],
    },
    {
      icon: <Gamepad2 className="w-12 h-12 text-white" />,
      title: "Coding Arena",
      description:
        "Challenge yourself with interactive coding problems, compete with peers, and improve your problem-solving skills.",
      gradient: "from-red-500 to-red-600",
      details: ["Daily challenges", "Competitive coding", "Skill assessment"],
    },
    {
      icon: <FileText className="w-12 h-12 text-white" />,
      title: "Resume Intelligence",
      description:
        "AI-powered resume analysis with credibility scoring, skill verification, and ATS optimization.",
      gradient: "from-orange-500 to-orange-600",
      details: ["ATS compatibility", "Keyword optimization", "Impact scoring"],
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-white" />,
      title: "Mock Interviews",
      description:
        "Practice with AI-powered interview simulations, get detailed feedback, and improve your communication skills.",
      gradient: "from-pink-500 to-pink-600",
      details: [
        "Technical interviews",
        "Behavioral questions",
        "Feedback analysis",
      ],
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-white" />,
      title: "Career Dashboard",
      description:
        "Track your progress, skill mastery, interview readiness, and career milestones in one comprehensive dashboard.",
      gradient: "from-blue-500 to-blue-600",
      details: ["Progress tracking", "Skill analytics", "Career insights"],
    },
    {
      icon: <Trophy className="w-12 h-12 text-white" />,
      title: "Leaderboard & Achievements",
      description:
        "Compete with fellow learners, earn badges, and showcase your achievements in our gamified learning environment.",
      gradient: "from-yellow-500 to-yellow-600",
      details: ["Global rankings", "Achievement badges", "Progress rewards"],
    },
    {
      icon: <BookOpen className="w-12 h-12 text-white" />,
      title: "Learning Roadmaps",
      description:
        "Follow structured career paths for Backend, Mobile, DevOps, Data Science, UI/UX, Cybersecurity, and QA engineering.",
      gradient: "from-cyan-500 to-cyan-600",
      details: ["Career paths", "Skill progression", "Industry standards"],
    },
    {
      icon: <Building2 className="w-12 h-12 text-white" />,
      title: "Company Portal",
      description:
        "Create assessments, evaluate candidates, and streamline hiring with AI-powered recruitment tools.",
      gradient: "from-indigo-500 to-indigo-600",
      details: [
        "Candidate screening",
        "Assessment creation",
        "Hiring analytics",
      ],
    },
    {
      icon: <Brain className="w-12 h-12 text-white" />,
      title: "AI Tutor Sessions",
      description:
        "One-on-one AI tutoring sessions tailored to your learning pace and style with interactive problem-solving.",
      gradient: "from-violet-500 to-violet-600",
      details: [
        "Personalized learning",
        "Interactive sessions",
        "Concept mastery",
      ],
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-white" />,
      title: "Resources Hub",
      description:
        "Access comprehensive learning resources, documentation, and tools to accelerate your development journey.",
      gradient: "from-teal-500 to-teal-600",
      details: ["Documentation", "Code examples", "Learning materials"],
    },
    {
      icon: <Shield className="w-12 h-12 text-white" />,
      title: "Career Readiness",
      description:
        "Comprehensive career preparation with interview tips, salary negotiation, and job search strategies.",
      gradient: "from-emerald-500 to-emerald-600",
      details: ["Interview prep", "Salary negotiation", "Job search tips"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced liquid background effects with animation */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse opacity-50"></div>
          {/* Floating particles with enhanced animation */}
          <div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-40"
            style={{ animationDelay: "3s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce opacity-50"
            style={{ animationDelay: "5s", animationDuration: "2.5s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-30"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse opacity-70"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BookOpen
            className="absolute top-20 left-20 w-8 h-8 text-blue-300 opacity-20 animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          />
          <Code
            className="absolute top-32 right-32 w-6 h-6 text-purple-300 opacity-25 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <GraduationCap
            className="absolute bottom-32 left-24 w-7 h-7 text-green-300 opacity-20 animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          />
          <Target
            className="absolute bottom-20 right-20 w-5 h-5 text-pink-300 opacity-30 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <TrendingUp
            className="absolute top-1/2 left-10 w-6 h-6 text-indigo-300 opacity-25 animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "3.5s" }}
          />
          <Users
            className="absolute top-1/3 right-10 w-7 h-7 text-cyan-300 opacity-20 animate-pulse"
            style={{ animationDelay: "2.5s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="col-span-full md:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI-Powered Learning Platform
                </div>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                  Master Skills.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse bg-[length:200%_200%] animate-gradient-x">
                    Ace Interviews.
                  </span>
                  <br />
                  <span
                    className="text-zinc-400 animate-fade-in"
                    style={{ animationDelay: "1s" }}
                  >
                    Build Your Career.
                  </span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl animate-fade-in">
                The only AI-powered platform you need to learn, practice, and
                land your dream job. Replace coaching institutes with
                intelligent tutoring, automated assessments, and career
                readiness tracking powered by Azure OpenAI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="get-started-btn"
                  size="lg"
                  className="rounded-full font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] relative overflow-hidden group"
                  onClick={() => navigate("/auth")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Zap className="w-5 h-5 mr-2 animate-pulse group-hover:animate-spin" />
                  Start Learning Free (No Credit Card)
                </Button>
                <Button
                  data-testid="learn-more-btn"
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold border-zinc-700 text-white hover:bg-zinc-800 hover:border-blue-500/50 transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] relative overflow-hidden group"
                  onClick={() => navigate("/auth")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <BookOpen className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Explore Features
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    10K+
                  </div>
                  <div className="text-sm text-zinc-400">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    500+
                  </div>
                  <div className="text-sm text-zinc-400">Coding Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    50+
                  </div>
                  <div className="text-sm text-zinc-400">Companies</div>
                </div>
              </div>
            </div>
            <div className="col-span-full md:col-span-5 relative">
              <div className="relative">
                {/* Liquid border effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse"></div>
                <img
                  src="https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg"
                  alt="Student learning with AI"
                  className="relative rounded-xl shadow-2xl border border-zinc-800/50 hover:border-blue-500/30 transition-all duration-500 hover:scale-105"
                />
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-r from-zinc-900 to-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              How LearnovateX Works
            </h2>
            <p className="text-zinc-400 text-lg">
              Your journey to career success in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Learn with AI Tutor
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Get personalized explanations and interactive learning powered
                by Azure OpenAI. Master concepts at your own pace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Practice in Coding Arena
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Challenge yourself with interactive coding problems, get
                real-time feedback, and improve your problem-solving skills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Get Interview-Ready & Hired
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Practice mock interviews, optimize your resume, and track your
                career readiness to land your dream job.
              </p>
            </div>
          </div>

          {/* Connecting arrows for desktop */}
          <div className="hidden md:block">
            <div className="flex justify-center items-center mt-8 space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <ArrowRight className="w-6 h-6 text-blue-400" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        {/* Liquid background effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-zinc-400 text-lg">
              One platform, unlimited possibilities - powered by AI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-testid={`feature-card-${index}`}
                className="group bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-zinc-500/70 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 liquid-card"
                style={{
                  animationDelay: `${index * 100}ms`,
                  background: `linear-gradient(135deg, rgba(39, 39, 42, 0.8), rgba(24, 24, 27, 0.6))`,
                }}
              >
                <CardContent className="p-6 space-y-4 relative overflow-hidden">
                  {/* Liquid blob animation */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-current to-transparent rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 liquid-blob"></div>

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Additional details */}
                  <div className="space-y-2 pt-2 border-t border-zinc-700/50">
                    {feature.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              See LearnovateX in Action
            </h2>
            <p className="text-zinc-400 text-lg">
              Watch how our AI-powered platform transforms learning and career
              preparation
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {/* Local MP4 Video with Native Controls */}
                  <video
                    id="learnovatex-demo-video"
                    className="w-full h-full rounded-lg"
                    controls={true}
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source
                      src={`${process.env.PUBLIC_URL}/LearnovateX.mp4`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>

                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce opacity-70">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div
                    className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-bounce opacity-70"
                    style={{ animationDelay: "1s" }}
                  >
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                Use the video controls to watch our AI-powered learning platform
                in action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For All Users Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Liquid background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Built for Everyone
            </h2>
            <p className="text-zinc-400 text-lg">
              From students to enterprises - comprehensive career development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <GraduationCap className="w-6 h-6" />,
                label: "Students",
                desc: "Learn & Practice with AI",
                details: [
                  "Interactive coding",
                  "Personalized learning",
                  "Progress tracking",
                ],
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Target className="w-6 h-6" />,
                label: "Job Seekers",
                desc: "Interview Prep & Career Growth",
                details: [
                  "Mock interviews",
                  "Resume optimization",
                  "Skill assessment",
                ],
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                label: "Companies",
                desc: "Hire Faster with AI",
                details: [
                  "Candidate screening",
                  "Assessment tools",
                  "Analytics dashboard",
                ],
                gradient: "from-purple-500 to-indigo-500",
              },
              {
                icon: <Users className="w-6 h-6" />,
                label: "Colleges & Educators",
                desc: "Track Progress & Teach Better",
                details: [
                  "Student analytics",
                  "Curriculum integration",
                  "Performance insights",
                ],
                gradient: "from-orange-500 to-red-500",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group text-center p-6 bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 hover:border-zinc-600/70 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 liquid-card relative overflow-hidden"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Liquid blob animation */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-current to-transparent rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 liquid-blob"></div>

                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
                  {item.label}
                </h3>
                <p className="text-sm text-zinc-400 mb-3 group-hover:text-zinc-300 transition-colors duration-300">
                  {item.desc}
                </p>

                {/* Additional details */}
                <div className="space-y-1">
                  {item.details.map((detail, j) => (
                    <div
                      key={j}
                      className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"
                    >
                      • {detail}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-white via-zinc-50 to-white text-black relative overflow-hidden">
        {/* Liquid background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Join the AI Learning Revolution
            </div>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners and professionals using AI to accelerate
            their growth. From coding challenges to interview prep, we've got
            everything you need to succeed in tech.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <Bot className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-800">AI-Powered</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <Trophy className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-800">
                Gamified Learning
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-800">
                Career Focused
              </span>
            </div>
          </div>

          <Button
            data-testid="cta-start-btn"
            size="lg"
            className="rounded-full font-semibold bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-black/40 transform hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            onClick={() => navigate("/auth")}
          >
            <Rocket className="w-6 h-6 mr-3" />
            Start Learning Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-400">
          <p>&copy; 2026 AI Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

// Add liquid animation styles
const styles = `
  .liquid-card {
    position: relative;
    overflow: hidden;
  }

  .liquid-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s;
  }

  .liquid-card:hover::before {
    left: 100%;
  }

  .liquid-blob {
    animation: liquid-float 6s ease-in-out infinite;
  }

  .liquid-blob:nth-child(2) {
    animation-delay: -2s;
  }

  .liquid-blob:nth-child(3) {
    animation-delay: -4s;
  }

  @keyframes liquid-float {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
      border-radius: 50%;
    }
    25% {
      transform: translate(10px, -10px) rotate(90deg);
      border-radius: 40% 60% 70% 30%;
    }
    50% {
      transform: translate(-5px, 10px) rotate(180deg);
      border-radius: 60% 40% 30% 70%;
    }
    75% {
      transform: translate(-10px, -5px) rotate(270deg);
      border-radius: 30% 70% 60% 40%;
    }
  }

  .liquid-card:hover .liquid-blob {
    animation-duration: 3s;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
