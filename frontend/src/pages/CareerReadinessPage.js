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
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  TrendingDown,
  Activity,
  Clock,
  Shield,
  Lightbulb,
  Flame,
  Rocket,
  Briefcase,
  GraduationCap,
  Network,
  Settings,
  Eye,
  EyeOff,
  Goal,
  CalendarDays,
  PieChart,
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
  const [showCareerInsights, setShowCareerInsights] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [personalGoals, setPersonalGoals] = useState([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
  const [marketInsights, setMarketInsights] = useState(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);

  const advancedMetrics = [
    {
      title: "Learning Streak",
      value: `${streakData.current} days`,
      description: "Current consecutive learning days",
      icon: Flame,
      color: "text-orange-400",
      trend: streakData.current > 0 ? "up" : "stable",
    },
    {
      title: "Weekly Progress",
      value: "+8.5%",
      description: "Improvement this week",
      icon: TrendingUp,
      color: "text-green-400",
      trend: "up",
    },
    {
      title: "Skill Velocity",
      value: "Fast",
      description: "Rate of skill acquisition",
      icon: Rocket,
      color: "text-blue-400",
      trend: "up",
    },
    {
      title: "Competitive Rank",
      value: "Top 15%",
      description: "Among peers in your level",
      icon: Trophy,
      color: "text-yellow-400",
      trend: "up",
    },
  ];

  const careerInsights = [
    {
      title: "Skill Gaps Identified",
      description:
        "Based on your performance, focus on system design and cloud technologies",
      icon: Target,
      type: "warning",
      action: "View Details",
      path: "/learning-path",
    },
    {
      title: "Market Demand High",
      description:
        "Your current skills align with 85% of available software engineering roles",
      icon: TrendingUp,
      type: "success",
      action: "Explore Jobs",
      path: "/resources",
    },
    {
      title: "Networking Opportunity",
      description: "Connect with 3 senior developers in your target companies",
      icon: Network,
      type: "info",
      action: "Find Connections",
      path: "/resources",
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

      // Mock additional data for new features
      setStreakData({
        current: Math.floor(Math.random() * 30) + 1,
        longest: Math.floor(Math.random() * 60) + 30,
      });

      setPersonalGoals([
        {
          id: 1,
          title: "Complete 50 coding problems",
          progress: 32,
          target: 50,
          deadline: "2024-02-15",
        },
        {
          id: 2,
          title: "Get resume score above 85%",
          progress: 78,
          target: 85,
          deadline: "2024-02-01",
        },
        {
          id: 3,
          title: "Practice 10 mock interviews",
          progress: 6,
          target: 10,
          deadline: "2024-02-28",
        },
      ]);

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
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  Career Readiness Dashboard
                </h1>
                <p className="text-zinc-400 text-lg">
                  Your personalized journey to career success
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live tracking active
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                {streakData.current} day streak
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {["week", "month", "quarter"].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={
                    selectedTimeframe === timeframe ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={
                    selectedTimeframe === timeframe
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading your career insights...</p>
            </div>
          </div>
        ) : stats && crsBreakdown ? (
          <>
            {/* Enhanced Main Score Card */}
            <Card className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700 mb-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
              <CardContent className="p-8 relative">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {(stats?.career_readiness_score || 0).toFixed(1)}%
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              getScoreColor(
                                stats?.career_readiness_score || 0
                              ) === "text-green-400"
                                ? "bg-green-400"
                                : getScoreColor(
                                    stats?.career_readiness_score || 0
                                  ) === "text-yellow-400"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            } animate-pulse`}
                          ></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Badge
                          className={`${crsLevel.bg} ${crsLevel.color} border-zinc-600 px-4 py-2 text-sm font-semibold`}
                        >
                          {crsLevel.level} Level
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Rank #{Math.floor(Math.random() * 100) + 1} of{" "}
                          {Math.floor(Math.random() * 500) + 200}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Flame className="w-4 h-4 text-orange-400" />
                          {streakData.longest} day best streak
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={stats.career_readiness_score}
                      className="w-full mb-6 h-3"
                    />
                    <div className="space-y-2">
                      <p className="text-zinc-300 text-lg font-medium">
                        {getMotivationalMessage(stats.career_readiness_score)}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Based on your coding performance, resume quality,
                        interview skills, and learning consistency
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="text-2xl font-bold text-zinc-300 mb-1">
                        {stats?.total_problems_solved || 0}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        Problems Solved
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="text-2xl font-bold text-zinc-300 mb-1">
                        {stats?.resume_analyses || 0}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Resume Reviews
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="text-2xl font-bold text-zinc-300 mb-1">
                        {stats?.interviews_taken || 0}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Mock Interviews
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="text-2xl font-bold text-zinc-300 mb-1">
                        {stats?.learning_sessions || 0}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Learning Sessions
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Goals Section */}
            <Card className="bg-zinc-900 border-zinc-800 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Goal className="w-5 h-5" />
                    Personal Goals & Milestones
                  </div>
                  <Button
                    onClick={() => setShowGoalsModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Goals
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">
                          {goal.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">
                            {goal.progress}/{goal.target}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((goal.progress / goal.target) * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={(goal.progress / goal.target) * 100}
                        className="mb-2"
                      />
                      <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {Math.ceil(
                            (new Date(goal.deadline) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days left
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
                  >
                    <Goal className="w-4 h-4 mr-2" />
                    Add New Goal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Analytics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Advanced Analytics
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  {showAdvancedMetrics ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {showAdvancedMetrics ? "Hide" : "Show"} Details
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {advancedMetrics.map((metric, index) => (
                  <Card
                    key={index}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
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

              {showAdvancedMetrics && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Detailed Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4 text-white">
                          Score Distribution
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(crsBreakdown).map(([key, data]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-zinc-400 capitalize">
                                {key}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-zinc-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${data.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-zinc-300 w-12 text-right">
                                  {data.score.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-white">
                          Improvement Areas
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                Strong Performance
                              </div>
                              <div className="text-xs text-zinc-400">
                                Coding skills showing consistent growth
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                            <Target className="w-4 h-4 text-yellow-400" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                Focus Area
                              </div>
                              <div className="text-xs text-zinc-400">
                                Interview practice needs attention
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Skill Assessment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-400" />
                      Coding Performance
                      {getTrendIcon(crsBreakdown?.coding?.trend || "up")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown?.coding?.score || 0
                      )}`}
                    >
                      {(crsBreakdown?.coding?.score || 0).toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown?.coding?.score || 0}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400">
                      Weight: {crsBreakdown?.coding?.weight || 0}% |
                      Contribution:{" "}
                      {(crsBreakdown?.coding?.contribution || 0).toFixed(1)}pts
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      Resume Credibility
                      {getTrendIcon(crsBreakdown?.resume?.trend || "up")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown?.resume?.score || 0
                      )}`}
                    >
                      {(crsBreakdown?.resume?.score || 0).toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown?.resume?.score || 0}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400">
                      Weight: {crsBreakdown?.resume?.weight || 0}% |
                      Contribution:{" "}
                      {(crsBreakdown?.resume?.contribution || 0).toFixed(1)}pts
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      Interview Readiness
                      {getTrendIcon(crsBreakdown?.interview?.trend || "stable")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown?.interview?.score || 0
                      )}`}
                    >
                      {(crsBreakdown?.interview?.score || 0).toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown?.interview?.score || 0}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400">
                      Weight: {crsBreakdown?.interview?.weight || 0}% |
                      Contribution:{" "}
                      {(crsBreakdown?.interview?.contribution || 0).toFixed(1)}
                      pts
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-yellow-400" />
                      Learning Consistency
                      {getTrendIcon(crsBreakdown?.learning?.trend || "up")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-2 ${getScoreColor(
                        crsBreakdown?.learning?.score || 0
                      )}`}
                    >
                      {(crsBreakdown?.learning?.score || 0).toFixed(1)}%
                    </div>
                    <Progress
                      value={crsBreakdown?.learning?.score || 0}
                      className="mb-2"
                    />
                    <div className="text-sm text-zinc-400">
                      Weight: {crsBreakdown?.learning?.weight || 0}% |
                      Contribution:{" "}
                      {(crsBreakdown?.learning?.contribution || 0).toFixed(1)}
                      pts
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Smart Recommendations */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(crsBreakdown?.coding?.score || 0) < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-500/50 transition-colors">
                      <Code className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Boost Coding Skills
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Focus on algorithmic problem-solving and data
                          structures
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate("/coding")}
                            className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                          >
                            Practice Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/learning-path")}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          >
                            View Roadmap
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(crsBreakdown?.resume?.score || 0) < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-colors">
                      <FileText className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Optimize Resume
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Add quantifiable achievements and relevant keywords
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate("/resume")}
                            className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          >
                            Analyze Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/resources")}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          >
                            Get Templates
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(crsBreakdown?.interview?.score || 0) < 70 && (
                    <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-purple-500/50 transition-colors">
                      <MessageSquare className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          Master Interviews
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          Practice behavioral and technical interview questions
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate("/interview")}
                            className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                          >
                            Start Practice
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/resources")}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          >
                            Interview Tips
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {stats.career_readiness_score >= 85 && (
                    <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                      <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-400 mb-1">
                          🎉 Outstanding Performance!
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                          You're ready to apply for jobs! Focus on networking
                          and applications.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate("/resources")}
                            className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          >
                            Browse Jobs
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/resources")}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          >
                            Network
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(stats?.career_readiness_score || 0) >= 70 &&
                    (crsBreakdown?.coding?.score || 0) >= 70 &&
                    (crsBreakdown?.resume?.score || 0) >= 70 &&
                    (crsBreakdown?.interview?.score || 0) >= 70 &&
                    (crsBreakdown?.learning?.score || 0) >= 70 && (
                      <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-400 mb-1">
                            ⭐ Well-Balanced Profile!
                          </h4>
                          <p className="text-sm text-zinc-400 mb-3">
                            All skills are strong. Consider leadership roles or
                            specialization.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate("/achievements")}
                              className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                            >
                              View Achievements
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate("/learning-path")}
                              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                            >
                              Explore Specializations
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Career Insights & Recommendations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Career Insights
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCareerInsights(!showCareerInsights)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  {showCareerInsights ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {showCareerInsights ? "Hide" : "Show"} Insights
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {careerInsights.map((insight, index) => (
                  <Card
                    key={index}
                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${
                            insight.type === "success"
                              ? "bg-green-500/10"
                              : insight.type === "warning"
                              ? "bg-yellow-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          <insight.icon
                            className={`w-5 h-5 ${
                              insight.type === "success"
                                ? "text-green-400"
                                : insight.type === "warning"
                                ? "text-yellow-400"
                                : "text-blue-400"
                            }`}
                          />
                        </div>
                        <h3 className="font-semibold text-white">
                          {insight.title}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400 mb-4">
                        {insight.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => navigate(insight.path)}
                      >
                        {insight.action}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showCareerInsights && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Personalized Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-blue-400" />
                          Next Steps
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                Build Portfolio Projects
                              </div>
                              <div className="text-xs text-zinc-400">
                                Create 2-3 showcase projects in the next month
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                Network Actively
                              </div>
                              <div className="text-xs text-zinc-400">
                                Connect with 5 professionals in your target
                                field
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                Certifications
                              </div>
                              <div className="text-xs text-zinc-400">
                                Consider AWS Cloud Practitioner or Google Cloud
                                Associate
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-400" />
                          Job Market Fit
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                            <div className="text-sm font-medium text-green-400 mb-1">
                              High Match
                            </div>
                            <div className="text-xs text-zinc-400">
                              Full-Stack Developer, Backend Engineer
                            </div>
                          </div>
                          <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                            <div className="text-sm font-medium text-yellow-400 mb-1">
                              Medium Match
                            </div>
                            <div className="text-xs text-zinc-400">
                              DevOps Engineer, Data Analyst
                            </div>
                          </div>
                          <div className="p-3 bg-zinc-800 rounded-lg">
                            <div className="text-sm font-medium text-white mb-1">
                              Skill Gap Areas
                            </div>
                            <div className="text-xs text-zinc-400">
                              Cloud platforms, System design
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Your Journey
              </h2>
              <p className="text-zinc-400 mb-8 text-lg">
                Begin building your career readiness score by engaging with our
                platform. Every step counts towards your professional growth!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Solve Problems
                  </div>
                  <div className="text-xs text-zinc-400">
                    Practice coding challenges
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Optimize Resume
                  </div>
                  <div className="text-xs text-zinc-400">
                    Get AI-powered feedback
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Practice Interviews
                  </div>
                  <div className="text-xs text-zinc-400">
                    Mock technical interviews
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <BookOpen className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Learn & Grow
                  </div>
                  <div className="text-xs text-zinc-400">
                    AI-powered tutoring
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/coding")}
                  className="bg-blue-500 hover:bg-blue-600 px-8 py-3"
                >
                  <Code className="w-5 h-5 mr-2" />
                  Start Coding Challenge
                </Button>
                <Button
                  onClick={() => navigate("/resume")}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-3"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Upload Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Set Career Goals
            </h3>
            <div className="space-y-4">
              {personalGoals.map((goal) => (
                <div key={goal.id} className="bg-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{goal.title}</h4>
                    <span className="text-sm text-zinc-400">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  <Progress
                    value={(goal.progress / goal.target) * 100}
                    className="mb-2"
                  />
                  <div className="text-xs text-zinc-500">
                    Deadline: {goal.deadline}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    Weekly Progress
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-400">+8.5%</div>
                <div className="text-sm text-zinc-400">
                  Improvement this week
                </div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">
                    Learning Streak
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {streakData.current} days
                </div>
                <div className="text-sm text-zinc-400">
                  Longest: {streakData.longest} days
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowProgressModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Market Insights Modal */}
      {showMarketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Job Market Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">
                    High Demand Skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">React</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">Python</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">AI/ML</Badge>
                </div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Top Industries</span>
                </div>
                <div className="text-sm text-zinc-400">
                  Tech, Finance, Healthcare, E-commerce
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowMarketModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerReadinessPage;
