import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Trophy,
  Code,
  FileText,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  RefreshCw,
  ChevronRight,
  Star,
  Calendar,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  TrendingDown,
  Activity,
  Clock,
  Shield,
  Lightbulb,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const CareerReadinessPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crsBreakdown, setCrsBreakdown] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const quickActions = [
    {
      title: "Practice Coding",
      description: "Improve your coding skills",
      path: "/coding",
      icon: Code,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      title: "Analyze Resume",
      description: "Get resume feedback",
      path: "/resume",
      icon: FileText,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      title: "Mock Interview",
      description: "Practice interviews",
      path: "/interview",
      icon: MessageSquare,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      title: "AI Tutor",
      description: "Learn new concepts",
      path: "/tutor",
      icon: BookOpen,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
  ];

  const advancedMetrics = [
    {
      title: "Consistency Score",
      value: "85%",
      description: "Regular activity over time",
      icon: Activity,
      color: "text-orange-400",
    },
    {
      title: "Skill Growth Rate",
      value: "+12%",
      description: "Monthly improvement",
      icon: TrendingUp,
      color: "text-orange-400",
    },
    {
      title: "Time Efficiency",
      value: "92%",
      description: "Optimal learning pace",
      icon: Clock,
      color: "text-orange-400",
    },
    {
      title: "Competitive Edge",
      value: "78%",
      description: "vs. peers in your field",
      icon: Shield,
      color: "text-orange-400",
    },
  ];

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const response = await axiosInstance.get("/dashboard/stats");
      setStats(response.data);

      // Calculate breakdown inline
      const stats = response.data;
      const codingScore = stats.avg_code_score;
      const resumeScore = Math.min(stats.resume_analyses * 10, 100);
      const interviewScore = Math.min(stats.interviews_taken * 15, 100);
      const learningScore = Math.min(
        stats.learning_sessions * (100.0 / 30.0),
        100
      );

      const breakdown = {
        coding: {
          score: codingScore,
          weight: 30,
          contribution: codingScore * 0.3,
          trend: "up",
        },
        resume: {
          score: resumeScore,
          weight: 25,
          contribution: resumeScore * 0.25,
          trend: "up",
        },
        interview: {
          score: interviewScore,
          weight: 25,
          contribution: interviewScore * 0.25,
          trend: "stable",
        },
        learning: {
          score: learningScore,
          weight: 20,
          contribution: learningScore * 0.2,
          trend: "up",
        },
      };

      setCrsBreakdown(breakdown);
      setLastUpdated(new Date());

      if (silent) {
        toast.success("Data updated");
      }
    } catch (error) {
      toast.error("Failed to load career readiness data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const getCrsLevel = (score) => {
    if (score >= 90)
      return { level: "Expert", color: "text-white", bg: "bg-gray-800" };
    if (score >= 80)
      return { level: "Advanced", color: "text-white", bg: "bg-gray-800" };
    if (score >= 70)
      return { level: "Intermediate", color: "text-white", bg: "bg-gray-800" };
    if (score >= 60)
      return { level: "Beginner", color: "text-white", bg: "bg-gray-800" };
    return { level: "Novice", color: "text-white", bg: "bg-gray-800" };
  };

  const getScoreColor = (score) => {
    return "text-orange-400";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-orange-400" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMotivationalMessage = (score) => {
    if (score >= 90) return "Outstanding! You're job-ready!";
    if (score >= 80) return "Excellent progress! Keep building momentum.";
    if (score >= 70) return "Great work! Focus on weak areas to excel.";
    if (score >= 60) return "Good foundation! Consistent practice will help.";
    return "Every expert was once a beginner. Start your journey!";
  };

  const crsLevel = stats ? getCrsLevel(stats.career_readiness_score) : null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-white" />
              Career Readiness Score
            </h1>
            <p className="text-zinc-400 text-lg">
              Your comprehensive job readiness assessment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : stats && crsBreakdown ? (
          <>
            {/* Main Score Card */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 mb-8 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-400 bg-clip-text text-transparent">
                        {stats.career_readiness_score.toFixed(1)}%
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          className={`${crsLevel.bg} ${crsLevel.color} border-zinc-600`}
                        >
                          {crsLevel.level}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                          <Star className="w-4 h-4 text-orange-400" />
                          Level{" "}
                          {Math.floor(stats.career_readiness_score / 20) + 1}
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={stats.career_readiness_score}
                      className="w-80 mb-4"
                    />
                    <p className="text-zinc-300 mb-4">
                      {getMotivationalMessage(stats.career_readiness_score)}
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Based on your coding performance, resume quality,
                      interview skills, and learning activity
                    </p>
                  </div>
                  <div className="text-right space-y-3">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="text-2xl font-semibold text-zinc-300 mb-1">
                        {stats.total_problems_solved}
                      </div>
                      <div className="text-sm text-zinc-400">
                        Problems Solved
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="text-2xl font-semibold text-zinc-300 mb-1">
                        {stats.resume_analyses}
                      </div>
                      <div className="text-sm text-zinc-400">
                        Resume Analyses
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="text-2xl font-semibold text-zinc-300 mb-1">
                        {stats.interviews_taken}
                      </div>
                      <div className="text-sm text-zinc-400">
                        Mock Interviews
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Metrics Toggle */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showAdvancedMetrics ? "Hide" : "Show"} Advanced Metrics
              </Button>
            </div>

            {/* Advanced Metrics */}
            {showAdvancedMetrics && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Advanced Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {advancedMetrics.map((metric, index) => (
                    <Card key={index} className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <metric.icon className={`w-6 h-6 ${metric.color}`} />
                          <h3 className="font-semibold text-white">
                            {metric.title}
                          </h3>
                        </div>
                        <div
                          className={`text-2xl font-bold mb-1 ${metric.color}`}
                        >
                          {metric.value}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {metric.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-orange-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Score Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Code className="w-4 h-4 text-orange-400" />
                      Coding Performance
                      {getTrendIcon(crsBreakdown.coding.trend)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown.coding.score
                      )}`}
                    >
                      {crsBreakdown.coding.score.toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown.coding.score}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400 mb-3">
                      Weight: {crsBreakdown.coding.weight}% | Contribution:{" "}
                      {crsBreakdown.coding.contribution.toFixed(1)}pts
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                      onClick={() => navigate("/coding")}
                    >
                      Practice Coding
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      Resume Credibility
                      {getTrendIcon(crsBreakdown.resume.trend)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown.resume.score
                      )}`}
                    >
                      {crsBreakdown.resume.score.toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown.resume.score}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400 mb-3">
                      Weight: {crsBreakdown.resume.weight}% | Contribution:{" "}
                      {crsBreakdown.resume.contribution.toFixed(1)}pts
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                      onClick={() => navigate("/resume")}
                    >
                      Analyze Resume
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-400" />
                      Interview Readiness
                      {getTrendIcon(crsBreakdown.interview.trend)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown.interview.score
                      )}`}
                    >
                      {crsBreakdown.interview.score.toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown.interview.score}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400 mb-3">
                      Weight: {crsBreakdown.interview.weight}% | Contribution:{" "}
                      {crsBreakdown.interview.contribution.toFixed(1)}pts
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                      onClick={() => navigate("/interview")}
                    >
                      Practice Interview
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-400" />
                      Learning Consistency
                      {getTrendIcon(crsBreakdown.learning.trend)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown.learning.score
                      )}`}
                    >
                      {crsBreakdown.learning.score.toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown.learning.score}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400 mb-3">
                      Weight: {crsBreakdown.learning.weight}% | Contribution:{" "}
                      {crsBreakdown.learning.contribution.toFixed(1)}pts
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                      onClick={() => navigate("/tutor")}
                    >
                      Start Learning
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Improvement Recommendations */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crsBreakdown.coding.score < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                      <Code className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Improve Coding Skills
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Practice more coding challenges and focus on
                          algorithmic problem-solving.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/coding")}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        >
                          Start Coding <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {crsBreakdown.resume.score < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                      <FileText className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Enhance Resume
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Use the resume analyzer to get personalized
                          improvement suggestions.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/resume")}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        >
                          Analyze Resume
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {crsBreakdown.interview.score < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                      <MessageSquare className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Practice Interviews
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Take more mock interviews to improve your
                          communication and technical skills.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/interview")}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        >
                          Start Interview
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {crsBreakdown.learning.score < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                      <BookOpen className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Increase Learning Activity
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Engage more regularly with the AI tutor and learning
                          resources.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/tutor")}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        >
                          Start Learning
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {stats.career_readiness_score >= 85 && (
                    <div className="flex items-start gap-3 p-4 bg-orange-900/20 border border-orange-500/20 rounded-lg">
                      <Award className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-400 mb-1">
                          Excellent Progress! 🎉
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          You're doing great! Consider applying for jobs or
                          internships in your field.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/leaderboard")}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                        >
                          View Leaderboard
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {stats.career_readiness_score >= 70 &&
                    crsBreakdown.coding.score >= 70 &&
                    crsBreakdown.resume.score >= 70 &&
                    crsBreakdown.interview.score >= 70 &&
                    crsBreakdown.learning.score >= 70 && (
                      <div className="flex items-start gap-3 p-4 bg-orange-900/20 border border-orange-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-400 mb-1">
                            Well Balanced! ⭐
                          </h4>
                          <p className="text-sm text-zinc-400 mb-3">
                            All your skills are well-developed. Keep up the
                            great work!
                          </p>
                          <Button
                            size="sm"
                            onClick={() => navigate("/achievements")}
                            className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                          >
                            View Achievements
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Career Insights */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Career Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                      <h3 className="font-semibold text-white">
                        Growth Trajectory
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Your skills are developing at an above-average rate.
                      Continue this momentum to reach expert level within 3-6
                      months.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-orange-400" />
                      <h3 className="font-semibold text-white">
                        Market Readiness
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Based on current trends, your skill set aligns well with
                      high-demand roles in software development and tech.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-6 h-6 text-orange-400" />
                      <h3 className="font-semibold text-white">Next Steps</h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Focus on building a portfolio of projects and gaining
                      practical experience to complement your theoretical
                      knowledge.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-zinc-400 mb-2">
                No Data Available
              </h2>
              <p className="text-zinc-500">
                Start using the platform to build your career readiness score!
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate("/coding")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Start Coding
              </Button>
              <Button
                onClick={() => navigate("/resume")}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Analyze Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerReadinessPage;
