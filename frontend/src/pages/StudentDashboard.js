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
} from "lucide-react";
import { toast } from "sonner";

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
      description: "Get personalized explanations and learn concepts",
      path: "/tutor",
      testId: "nav-tutor-btn",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      iconColor: "text-white",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Coding Arena",
      description: "Practice coding & get AI evaluation",
      path: "/coding",
      testId: "nav-coding-btn",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      iconColor: "text-white",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Resume Analyzer",
      description: "AI-powered resume analysis & tips",
      path: "/resume",
      testId: "nav-resume-btn",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      iconColor: "text-white",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Mock Interview",
      description: "Practice interviews with AI feedback",
      path: "/interview",
      testId: "nav-interview-btn",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      iconColor: "text-white",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Career Readiness Score",
      description: "View your comprehensive job readiness assessment",
      path: "/career-readiness",
      testId: "nav-crs-btn",
      color: "bg-gradient-to-br from-yellow-500 to-amber-500",
      iconColor: "text-white",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Learning Path",
      description: "Structured learning curriculum",
      path: "/learning-path",
      testId: "nav-learning-btn",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500",
      iconColor: "text-white",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Leaderboard",
      description: "Compete and rank with peers",
      path: "/leaderboard",
      testId: "nav-leaderboard-btn",
      color: "bg-gradient-to-br from-rose-500 to-pink-500",
      iconColor: "text-white",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Achievements",
      description: "View your badges and milestones",
      path: "/achievements",
      testId: "nav-achievements-btn",
      color: "bg-gradient-to-br from-teal-500 to-green-500",
      iconColor: "text-white",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Resources",
      description: "Curated learning materials",
      path: "/resources",
      testId: "nav-resources-btn",
      color: "bg-gradient-to-br from-violet-500 to-purple-500",
      iconColor: "text-white",
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Company Portal",
      description: "Explore company opportunities",
      path: "/company",
      testId: "nav-company-btn",
      color: "bg-gradient-to-br from-slate-500 to-gray-500",
      iconColor: "text-white",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "College Admin",
      description: "College administration panel",
      path: "/college",
      testId: "nav-college-btn",
      color: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-zinc-400 text-lg">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        {!loading && stats && (
          <div
            data-testid="stats-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          >
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 hover:border-blue-600/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-300">
                  Code Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-100">
                  {stats.code_submissions}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50 hover:border-green-600/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-300">
                  Avg Code Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-100">
                  {stats.avg_code_score}%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 hover:border-purple-600/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-300">
                  Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-100">
                  {stats.interviews_taken}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-300">
                  Learning Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-100">
                  {stats.learning_sessions}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50 hover:border-yellow-600/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-300">
                  Career Readiness Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-100">
                  {stats.career_readiness_score}/100
                </div>
                <div className="mt-2">
                  <div className="w-full bg-yellow-700/30 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          stats.career_readiness_score,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div>
          <h3 className="text-2xl font-bold mb-6 text-white">
            Explore Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-testid={feature.testId}
                className="cursor-pointer bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 border border-zinc-700 shadow-lg`}
                  >
                    <div className={feature.iconColor}>{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
