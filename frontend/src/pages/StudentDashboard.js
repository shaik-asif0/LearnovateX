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
import { useI18n } from "../i18n/I18nProvider";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { t } = useI18n();
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
      toast.error(t("dashboard.error.loadStats", "Failed to load statistics"));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: t("nav.aiTutor", "AI Tutor"),
      description:
        "Get personalized explanations and learn concepts with our advanced AI tutor that adapts to your learning style.",
      detailedContent:
        "Interactive AI-powered tutoring sessions, instant doubt clearing, personalized learning paths, and progress tracking.",
      path: "/tutor",
      testId: "nav-tutor-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&crop=center",
      badge: t("badge.popular", "Popular"),
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t("nav.resumeAnalyzer", "Resume Analyzer"),
      description:
        "AI-powered resume analysis with actionable tips to improve your job prospects.",
      detailedContent:
        "ATS-friendly resume scoring, keyword optimization, industry-specific suggestions, and comparison with top resumes.",
      path: "/resume",
      testId: "nav-resume-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: t("nav.mockInterview", "Mock Interview"),
      description:
        "Practice interviews with AI feedback and improve your communication skills.",
      detailedContent:
        "Realistic interview scenarios, voice analysis, body language tips, and personalized improvement plans.",
      path: "/interview",
      testId: "nav-interview-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: t("nav.learningPath", "Learning Path"),
      description:
        "Structured learning curriculum tailored to your goals and skill level.",
      detailedContent:
        "Customized learning journeys, milestone tracking, resource recommendations, and progress visualization.",
      path: "/learning-path",
      testId: "nav-learning-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: t("nav.companyPortal", "Company Portal"),
      description:
        "Explore company opportunities, internships, and job openings tailored for students.",
      detailedContent:
        "Direct company connections, internship matching, job application tracking, and career event notifications.",
      path: "/company",
      testId: "nav-company-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: t("nav.collegeAdmin", "College Admin"),
      description:
        "College administration panel for managing academic records and campus activities.",
      detailedContent:
        "Academic performance tracking, event management, student services, and administrative tools.",
      path: "/college",
      testId: "nav-college-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&h=250&fit=crop&crop=center",
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: t("nav.roadmap", "Roadmap"),
      description:
        "Explore course-based roadmaps to guide your learning journey.",
      detailedContent:
        "Structured course sequences, prerequisite mapping, skill progression paths, and career-aligned learning tracks.",
      path: "/roadmap",
      testId: "nav-roadmap-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center",
      badge: t("badge.new", "New"),
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: t("dashboard.feature.premiumAccess", "Premium Access"),
      description:
        "Unlock exclusive premium features, advanced AI tools, and personalized mentorship.",
      detailedContent:
        "Access to premium courses, internships, advanced analytics, priority support, and exclusive networking opportunities.",
      path: "/premium",
      testId: "nav-premium-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center",
      badge: t("badge.premium", "Premium"),
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "3D Interactive Coding Game",
      description:
        "A real-time 3D coding game where your code controls the world.",
      detailedContent:
        "Language-agnostic logic control, live actions, visual consequences, and game-style XP/rank feedback.",
      path: "/coding-game-3d",
      testId: "nav-3d-coding-game-btn",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
      image:
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=250&fit=crop&crop=center",
      badge: "Future",
    },
  ];

  const backgroundImages = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop",
    "https://www.gpstrategies.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/02/Blog-Viability-AR-VR-mod_02.04.21-web.jpg.webp",
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
      <div className="relative overflow-hidden min-h-[100dvh] md:h-screen flex items-center">
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
              {t("dashboard.hero.title", "Welcome to Your Learning Hub")}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-orange-500 to-orange-600 mb-8 max-w-4xl mx-auto">
              {t(
                "dashboard.hero.subtitle",
                "Accelerate your career with AI-powered tools, personalized learning paths, and comprehensive skill development."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/tutor")}
                className="bg-white text-orange-600 hover:bg-orange-50 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t("dashboard.hero.startLearning", "Start Learning")}
              </Button>
              <Button
                onClick={() => navigate("/coding")}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold"
              >
                <Code className="w-5 h-5 mr-2" />
                {t("dashboard.hero.practiceCoding", "Practice Coding")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">
            {t("dashboard.welcomeBack", "Welcome back")}, {user?.name}!
          </h2>
          <p className="text-zinc-400 text-lg">
            {t(
              "dashboard.welcomeSubtitle",
              "Continue your learning journey and unlock your potential"
            )}
          </p>
        </div>

        {/* Stats Grid */}
        {!loading && stats && (
          <div
            data-testid="stats-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-12"
          >
            <Card className="bg-black border-gray-700 md:hover:border-gray-600 md:hover:ring-1 md:hover:ring-white transition-all duration-300 md:hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  {t("dashboard.stats.codeSubmissions", "Code Submissions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.code_submissions}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {t("dashboard.stats.keepCoding", "Keep coding!")}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 md:hover:border-gray-600 md:hover:ring-1 md:hover:ring-white transition-all duration-300 md:hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t("dashboard.stats.avgCodeScore", "Avg Code Score")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.avg_code_score}%
                  </div>
                  {/* Horizontal meter with segments */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 sm:w-3 h-1 rounded-sm transition-all duration-300 ${
                          i < Math.floor(stats.avg_code_score / 10)
                            ? "bg-gradient-to-r from-orange-400 to-orange-600"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stats.avg_code_score, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  {t(
                    "dashboard.stats.excellentProgress",
                    "Excellent progress!"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 md:hover:border-gray-600 md:hover:ring-1 md:hover:ring-white transition-all duration-300 md:hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("dashboard.stats.interviews", "Interviews")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.interviews_taken}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {t(
                    "dashboard.stats.practiceMakesPerfect",
                    "Practice makes perfect!"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 md:hover:border-gray-600 md:hover:ring-1 md:hover:ring-white transition-all duration-300 md:hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("dashboard.stats.learningSessions", "Learning Sessions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
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
                            ? "bg-gradient-to-t from-orange-400 to-orange-600"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (stats.learning_sessions / 50) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {t("dashboard.stats.keepLearning", "Keep learning!")}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black border-gray-700 md:hover:border-gray-600 md:hover:ring-1 md:hover:ring-white transition-all duration-300 md:hover:scale-105 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  {t(
                    "dashboard.stats.careerReadinessScore",
                    "Career Readiness Score"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white mb-1">
                      {stats.career_readiness_score}/100
                    </div>
                    <p className="text-gray-300 text-xs">
                      {t("dashboard.stats.onTrack", "You're on track!")}
                    </p>
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
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
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
            <Star className="w-6 h-6 mr-3 text-orange-400" />
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
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {feature.badge && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {feature.badge}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 border border-zinc-700 shadow-lg`}
                  >
                    <div className={feature.iconColor}>{feature.icon}</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    {feature.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {feature.detailedContent}
                  </p>
                  <div className="mt-4 flex items-center text-orange-400 group-hover:text-orange-300">
                    <span className="text-sm font-medium">
                      {t("dashboard.exploreFeature", "Explore Feature")}
                    </span>
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
