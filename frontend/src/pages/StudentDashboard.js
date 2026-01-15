import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import axiosInstance from "../lib/axios";
import { getUser } from "../lib/utils";
import {
  Bot,
  Code,
  FileText,
  MessageSquare,
  TrendingUp,
  Trophy,
  Award,
  BookOpen,
  User,
  Settings,
  Building2,
  GraduationCap,
  Target,
  Sparkles,
  Bell,
  Calendar,
  Star,
  Zap,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import Footer from "../components/Footer";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Tutor",
      description:
        "Get personalized explanations and learn concepts with our advanced AI tutor that adapts to your learning style.",
      detailedContent:
        "Interactive AI-powered tutoring sessions, instant doubt clearing, personalized learning paths, and progress tracking.",
      path: "/tutor",
      testId: "nav-tutor-btn",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&crop=center",
      badge: "Popular",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Coding Arena",
      description:
        "Practice coding challenges and get instant AI evaluation with detailed feedback.",
      detailedContent:
        "Hundreds of coding problems, real-time code analysis, performance metrics, and skill improvement tracking.",
      path: "/coding",
      testId: "nav-coding-btn",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&crop=center",
      badge: "New",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Resume Analyzer",
      description:
        "AI-powered resume analysis with actionable tips to improve your job prospects.",
      detailedContent:
        "ATS-friendly resume scoring, keyword optimization, industry-specific suggestions, and comparison with top resumes.",
      path: "/resume",
      testId: "nav-resume-btn",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Mock Interview",
      description:
        "Practice interviews with AI feedback and improve your communication skills.",
      detailedContent:
        "Realistic interview scenarios, voice analysis, body language tips, and personalized improvement plans.",
      path: "/interview",
      testId: "nav-interview-btn",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Learning Path",
      description:
        "Structured learning curriculum tailored to your goals and skill level.",
      detailedContent:
        "Customized learning journeys, milestone tracking, resource recommendations, and progress visualization.",
      path: "/learning-path",
      testId: "nav-learning-btn",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Company Portal",
      description:
        "Explore company opportunities, internships, and job openings tailored for students.",
      detailedContent:
        "Direct company connections, internship matching, job application tracking, and career event notifications.",
      path: "/company",
      testId: "nav-company-btn",
      color: "bg-gradient-to-br from-slate-500 to-gray-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "College Admin",
      description:
        "College administration panel for managing academic records and campus activities.",
      detailedContent:
        "Academic performance tracking, event management, student services, and administrative tools.",
      path: "/college",
      testId: "nav-college-btn",
      color: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: "Roadmap",
      description:
        "Explore course-based roadmaps to guide your learning journey.",
      detailedContent:
        "Structured course sequences, prerequisite mapping, skill progression paths, and career-aligned learning tracks.",
      path: "/roadmap",
      testId: "nav-roadmap-btn",
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center",
      badge: "New",
    },
  ];

  const backgroundImages = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageOpacity(0);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setImageOpacity(1);
      }, 1000); // Fade out time
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-screen flex items-center">
        <img
          src={backgroundImages[currentImageIndex]}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: imageOpacity,
            transition: "opacity 1s ease-in-out",
          }}
        />
        <div
          className="absolute inset-0 bg-black/40"
          style={{ backdropFilter: "blur(5px)" }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to Your Learning Hub
            </h1>
            <p className="text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Accelerate your career with AI-powered tools, personalized
              learning paths, and comprehensive skill development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/tutor")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button
                onClick={() => navigate("/coding")}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
              >
                <Code className="w-5 h-5 mr-2" />
                Practice Coding
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-zinc-400 text-lg">
            Continue your learning journey and unlock your potential
          </p>
        </div>

        {/* Stats Grid */}
        {!loading && stats && (
          <div
            data-testid="stats-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          >
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-white transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Code Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.code_submissions}
                </div>
                <p className="text-gray-300 text-sm mt-1">Keep coding!</p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-white transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Avg Code Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.avg_code_score}%
                  </div>
                  {/* Horizontal meter with segments */}
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-1 rounded-sm transition-all duration-300 ${
                          i < Math.floor(stats.avg_code_score / 10)
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stats.avg_code_score, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  Excellent progress!
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-white transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.interviews_taken}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  Practice makes perfect!
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-white transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl font-bold text-white">
                    {stats.learning_sessions}
                  </div>
                  {/* Progress indicator */}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-sm transition-all duration-300 ${
                          i <
                          Math.min(Math.floor(stats.learning_sessions / 10), 5)
                            ? "bg-gradient-to-t from-blue-400 to-blue-600"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (stats.learning_sessions / 50) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-1">Keep learning!</p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-white transition-all duration-300 hover:scale-105 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Career Readiness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white mb-1">
                      {stats.career_readiness_score}/100
                    </div>
                    <p className="text-gray-300 text-xs">You're on track!</p>
                  </div>
                  {/* Circular Progress Ring */}
                  <div className="relative w-14 h-14 ml-4 flex-shrink-0">
                    <svg
                      className="w-14 h-14 transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      {/* Background circle */}
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-gray-700"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#careerGradient)"
                        strokeWidth="3"
                        strokeDasharray={`${
                          (stats.career_readiness_score / 100) * 100
                        }, 100`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient
                          id="careerGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {stats.career_readiness_score}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stats.career_readiness_score, 100)}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-white flex items-center">
            <Star className="w-6 h-6 mr-3 text-purple-400" />
            Explore All Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-testid={feature.testId}
                className={`cursor-pointer bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden rounded-${
                  ["lg", "xl", "2xl", "3xl"][index % 4]
                }`}
                onClick={() => navigate(feature.path)}
              >
                <div className="relative">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {feature.badge && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {feature.badge}
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 border border-zinc-700 shadow-lg`}
                  >
                    <div className={feature.iconColor}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    {feature.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {feature.detailedContent}
                  </p>
                  <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
                    <span className="text-sm font-medium">Explore Feature</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
