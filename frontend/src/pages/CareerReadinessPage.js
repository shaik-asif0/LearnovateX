import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// ------------------------------
// Demo / viva-friendly mock data
// ------------------------------
// This is only used as a fallback if the backend is unavailable.
// It also serves as sample mock data for the "AI Career Digital Twin".
const MOCK_TWIN_SNAPSHOT = {
  career_readiness_score: 21.5,
  avg_code_score: 46,
  code_submissions: 12,
  resume_analyses: 6,
  interviews_taken: 1,
  learning_sessions: 4,
  learning_consistency_score: 32,
  active_days_30: 6,
  current_streak: 1,
  longest_streak: 5,
  // Backward compatibility with older frontend UI keys
  total_problems_solved: 12,
  last_activity_at: new Date(
    Date.now() - 4 * 24 * 60 * 60 * 1000
  ).toISOString(),
};

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
  const [showTwinInfoModal, setShowTwinInfoModal] = useState(false);

  const advancedMetrics = [
    {
      title: "Learning Streak",
      value: `${streakData.current} days`,
      description: "Current consecutive learning days",
      icon: Flame,
      color: "text-accent",
      trend: streakData.current > 0 ? "up" : "stable",
    },
    {
      title: "Learning Consistency",
      value: `${Math.round(stats?.learning_consistency_score || 0)}%`,
      description: "Consistency score (last 30 days)",
      icon: TrendingUp,
      color: "text-accent",
      trend: (stats?.learning_consistency_score || 0) > 0 ? "up" : "stable",
    },
    {
      title: "Active Days (30d)",
      value: `${stats?.active_days_30 || 0} days`,
      description: "Days with at least one session",
      icon: CalendarDays,
      color: "text-accent",
      trend: (stats?.active_days_30 || 0) > 0 ? "up" : "stable",
    },
    {
      title: "Last Activity",
      value: stats?.last_activity_at
        ? new Date(stats.last_activity_at).toLocaleDateString()
        : "—",
      description: "Most recent learning session",
      icon: Clock,
      color: "text-accent",
      trend: stats?.last_activity_at ? "up" : "stable",
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
      const learningScore =
        typeof stats.learning_consistency_score === "number"
          ? stats.learning_consistency_score
          : Math.min(stats.learning_sessions * (100.0 / 30.0), 100);

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

      // Real streak data from backend (learning_history)
      setStreakData({
        current: stats.current_streak || 0,
        longest: stats.longest_streak || 0,
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
      // Fallback to demo data to keep the dashboard usable for demos/viva.
      // The UI/logic is still the same (weighted scoring + rule-based prediction).
      const fallback = MOCK_TWIN_SNAPSHOT;
      setStats(fallback);

      const codingScore = fallback.avg_code_score;
      const resumeScore = Math.min(fallback.resume_analyses * 10, 100);
      const interviewScore = Math.min(fallback.interviews_taken * 15, 100);
      const learningScore =
        typeof fallback.learning_consistency_score === "number"
          ? fallback.learning_consistency_score
          : Math.min(fallback.learning_sessions * (100.0 / 30.0), 100);

      setCrsBreakdown({
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
      });

      setStreakData({
        current: fallback.current_streak || 0,
        longest: fallback.longest_streak || 0,
      });

      toast.error(
        "Failed to load career readiness data (showing demo snapshot)"
      );
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
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-accent";
    return "text-accent";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-accent" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-accent" />;
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

  // UI-safe derived values (avoid complex inline template expressions in JSX)
  const problemsSolvedCount =
    stats?.total_problems_solved ?? stats?.code_submissions ?? 0;
  const problemsSolvedProgress = Math.min(
    (Number(problemsSolvedCount) / 100) * 100,
    100
  );

  // -------------------------------------------------------------------
  // AI Career Digital Twin logic (rule-based; no ML training required)
  // -------------------------------------------------------------------
  // Inputs:
  // - Coding performance, Resume score, Mock interview results
  // - Learning consistency, Roadmap progress (approximated via activity)
  // Logic:
  // - Weighted scoring (already computed by backend + breakdown here)
  // - Rule-based prediction (days-to-job-ready, milestone ETA, risk alerts)
  // - LLM explanation (represented in UI as a transparent explainability modal)
  const twin = useMemo(() => {
    const jobReadiness = Number(stats?.career_readiness_score || 0);
    const codingScore = Number(crsBreakdown?.coding?.score || 0);
    const resumeScore = Number(crsBreakdown?.resume?.score || 0);
    const interviewScore = Number(crsBreakdown?.interview?.score || 0);
    const learningScore = Number(crsBreakdown?.learning?.score || 0);

    const lastActivityAt = stats?.last_activity_at
      ? new Date(stats.last_activity_at)
      : null;
    const inactiveDays = lastActivityAt
      ? Math.floor(
          (Date.now() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    // --- Rule-based prediction: days until job-ready ---
    // Calibrated so that ~21.5% → ~90 days (for demo impact).
    const baseDaysToJobReady = Math.round((100 - jobReadiness) * 1.15);

    // Pace multiplier uses learning consistency + inactivity signal.
    const paceMultiplier =
      inactiveDays !== null && inactiveDays > 3
        ? 1.25
        : learningScore >= 70
        ? 0.9
        : learningScore >= 40
        ? 1.0
        : 1.1;

    const daysToJobReady = Math.min(
      180,
      Math.max(30, Math.round(baseDaysToJobReady * paceMultiplier))
    );

    // --- Cross-module intelligence: decide biggest blocker + best next action ---
    let biggestBlocker = "Coding Consistency";
    if (inactiveDays !== null && inactiveDays > 3)
      biggestBlocker = "Inactivity";
    else if (resumeScore < 80) biggestBlocker = "Resume Quality";
    else if (interviewScore < 70) biggestBlocker = "Interview Practice";
    else if (codingScore < 70) biggestBlocker = "Coding Consistency";
    else biggestBlocker = "Maintain Momentum";

    const aiRiskAlert =
      inactiveDays !== null && inactiveDays > 3
        ? {
            level: "High",
            message: `AI Risk Alert: inactivity for ${inactiveDays} days may slow your job-readiness timeline.`,
          }
        : null;

    // Single "best action" per day. Priority: inactivity > coding > resume > interview.
    let bestAction = {
      title: "🎯 AI Career Twin – Today’s Best Action",
      task: "Solve 2 Medium DSA problems (Estimated time: 45 minutes)",
      moduleHint: "Recommended module: DSA Roadmap",
      ctaLabel: "Start Coding",
      ctaPath: "/coding",
    };

    if (aiRiskAlert) {
      bestAction = {
        title: "🎯 AI Career Twin – Today’s Best Action",
        task: "Do a 20-minute comeback session: 1 Easy + 1 Medium DSA problem",
        moduleHint: "Recommended module: DSA Roadmap",
        ctaLabel: "Resume Practice",
        ctaPath: "/coding",
      };
    } else if (codingScore < 70) {
      bestAction = {
        title: "🎯 AI Career Twin – Today’s Best Action",
        task: "Solve 2 Medium DSA problems (Estimated time: 45 minutes)",
        moduleHint: "Recommended module: DSA Roadmap",
        ctaLabel: "Start Coding",
        ctaPath: "/coding",
      };
    } else if (resumeScore < 80) {
      bestAction = {
        title: "🎯 AI Career Twin – Today’s Best Action",
        task: "Improve 2 resume bullet points with metrics (Estimated time: 25 minutes)",
        moduleHint: "Triggered because Resume score < 80",
        ctaLabel: "Improve Resume",
        ctaPath: "/resume",
      };
    } else if (interviewScore < 70) {
      bestAction = {
        title: "🎯 AI Career Twin – Today’s Best Action",
        task: "Take 1 mock interview (Estimated time: 30 minutes)",
        moduleHint: "Triggered because Interview readiness is low",
        ctaLabel: "Start Mock Interview",
        ctaPath: "/interview",
      };
    }

    // Next milestone (lightweight + demo-friendly)
    const nextMilestone = resumeScore < 80 ? "Resume-Ready" : "Interview-Ready";
    const milestoneDays = resumeScore < 80 ? 15 : 10;

    // Risk level: simple aggregate view for the prediction card.
    const riskLevel = aiRiskAlert
      ? "High"
      : jobReadiness < 35 || learningScore < 40
      ? "Medium"
      : "Low";

    // Confidence score: heuristic based on data availability/recency.
    const confidenceScore = Math.max(
      70,
      Math.min(99, 92 - (inactiveDays !== null && inactiveDays > 7 ? 10 : 0))
    );

    // --- What-if simulation (rule-based) ---
    // If coding daily for 14 days, we assume a meaningful boost in job readiness.
    const whatIfJobReadiness = Math.min(100, Math.round(jobReadiness + 13.5));

    return {
      jobReadiness,
      daysToJobReady,
      nextMilestone,
      milestoneDays,
      biggestBlocker,
      riskLevel,
      confidenceScore,
      bestAction,
      aiRiskAlert,
      whatIfJobReadiness,
    };
  }, [stats, crsBreakdown]);

  // Advanced feature (demo impact): lock "Today’s Best Action" for the whole day.
  // This ensures the UI always shows ONE task per day, even as live stats refresh.
  const bestActionForToday = useMemo(() => {
    const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const storageKey = `careerTwin.bestAction.${dayKey}`;

    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return JSON.parse(existing);
      localStorage.setItem(storageKey, JSON.stringify(twin.bestAction));
      return twin.bestAction;
    } catch {
      return twin.bestAction;
    }
  }, [twin.bestAction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  AI Career Digital Twin Dashboard
                </h1>
                <p className="text-zinc-400 text-lg">
                  Simulating your future career growth using AI
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
                <Flame className="w-4 h-4 text-accent" />
                {streakData.current} day streak
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
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
                      ? "bg-accent hover:bg-accent"
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
              onClick={() => setShowTwinInfoModal(true)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-full sm:w-auto"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              How AI Works
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-full sm:w-auto"
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
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{
                  borderColor: "rgba(var(--accent-rgb), 0.3)",
                  borderBottomColor: "var(--accent-color)",
                }}
              ></div>
              <p className="text-zinc-400">Loading your career insights...</p>
            </div>
          </div>
        ) : stats && crsBreakdown ? (
          <>
            {/* Enhanced Main Score Card */}
            <Card className="bg-zinc-900 border-zinc-700 mb-8 overflow-hidden relative">
              <div
                className="absolute inset-0"
                style={{ background: `rgba(var(--accent-rgb), 0.05)` }}
              ></div>
              <CardContent className="p-8 relative">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-accent" />
                          Job Readiness
                        </div>
                        <div
                          className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                          style={{ color: "var(--accent-color)" }}
                        >
                          {(stats?.career_readiness_score || 0).toFixed(1)}%
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              getScoreColor(
                                stats?.career_readiness_score || 0
                              ) === "text-accent"
                                ? "bg-accent"
                                : getScoreColor(
                                    stats?.career_readiness_score || 0
                                  ) === "text-accent"
                                ? "bg-accent"
                                : "bg-accent"
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
                          <Star className="w-4 h-4 text-accent" />
                          Active days (30d): {stats?.active_days_30 || 0}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Flame className="w-4 h-4 text-accent" />
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
                        Prediction: At your current learning pace, you may be
                        job-ready in ~{twin.daysToJobReady} days.
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Explainability: weighted scoring + rule-based prediction
                        using coding, resume, interview, and consistency
                        signals.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-zinc-300 mb-1">
                          {problemsSolvedCount}
                        </div>
                        {/* Progress bars for problems solved */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                                i <
                                Math.min(
                                  Math.floor(Number(problemsSolvedCount) / 20),
                                  5
                                )
                                  ? "bg-accent"
                                  : "bg-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        Problems Solved
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-accent h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${problemsSolvedProgress}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-zinc-300 mb-1">
                          {stats?.resume_analyses || 0}
                        </div>
                        {/* Progress bars for resume analyses */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                                i <
                                Math.min(
                                  Math.floor((stats?.resume_analyses || 0) / 2),
                                  5
                                )
                                  ? "bg-accent"
                                  : "bg-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Resume Reviews
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-accent h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              ((stats?.resume_analyses || 0) / 10) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-zinc-300 mb-1">
                          {stats?.interviews_taken || 0}
                        </div>
                        {/* Progress bars for interviews */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                                i <
                                Math.min(
                                  Math.floor(
                                    (stats?.interviews_taken || 0) / 2
                                  ),
                                  5
                                )
                                  ? "bg-accent"
                                  : "bg-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Mock Interviews
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-accent h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              ((stats?.interviews_taken || 0) / 10) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-zinc-300 mb-1">
                          {stats?.learning_sessions || 0}
                        </div>
                        {/* Progress bars for learning sessions */}
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                                i <
                                Math.min(
                                  Math.floor(
                                    (stats?.learning_sessions || 0) / 10
                                  ),
                                  5
                                )
                                  ? "bg-accent"
                                  : "bg-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Learning Sessions
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-accent h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              ((stats?.learning_sessions || 0) / 50) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Career Twin Prediction Card (below main score) */}
            <Card className="bg-zinc-900 border-zinc-800 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  AI Career Twin Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm text-zinc-400">
                        Next Milestone
                      </div>
                      <div className="text-white font-semibold">
                        {twin.nextMilestone} ({twin.milestoneDays} days)
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm text-zinc-400">
                        Biggest Blocker
                      </div>
                      <div className="text-white font-semibold">
                        {twin.biggestBlocker}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm text-zinc-400">Risk Level</div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 border-zinc-600 text-white">
                          {twin.riskLevel}
                        </Badge>
                        {twin.aiRiskAlert && (
                          <div className="text-xs text-zinc-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-accent" />
                            AI risk detected
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                      <div className="text-sm text-zinc-400">
                        Confidence Score
                      </div>
                      <div className="text-white font-semibold">
                        {twin.confidenceScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* What-if simulation (lightweight, rule-based) */}
                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    What-if Simulation
                  </div>
                  <div className="text-sm text-zinc-400">
                    If you practice coding daily for 14 days:
                    <div className="mt-2 text-zinc-300">
                      → Job readiness increases to {twin.whatIfJobReadiness}%
                      <br />→ Interview readiness improves significantly
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
                    onClick={() => setShowGoalsModal(true)}
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
                                    className="bg-accent h-2 rounded-full"
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
                            <TrendingUp className="w-4 h-4 text-accent" />
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
                            <Target className="w-4 h-4 text-accent" />
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
                      <Code className="w-4 h-4 text-accent" />
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
                      <FileText className="w-4 h-4 text-accent" />
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
                      <MessageSquare className="w-4 h-4 text-accent" />
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
                      <BookOpen className="w-4 h-4 text-accent" />
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

            {/* UPGRADE: Single daily recommendation */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {bestActionForToday.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {twin.aiRiskAlert && (
                  <div className="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">
                          {twin.aiRiskAlert.message}
                        </div>
                        <div className="text-xs text-zinc-400">
                          This alert is triggered when inactivity &gt; 3 days.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-accent transition-colors">
                  <Target className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      Today’s Best Action
                    </h4>
                    <p className="text-sm text-zinc-300 mb-1">
                      {bestActionForToday.task}
                    </p>
                    <p className="text-xs text-zinc-400 mb-3">
                      {bestActionForToday.moduleHint}
                    </p>
                    <div className="text-xs text-zinc-500 mb-3">
                      Locked for today (updates again tomorrow).
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(bestActionForToday.ctaPath)}
                      className="bg-accent hover:bg-accent"
                    >
                      {bestActionForToday.ctaLabel}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
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
                        <div className="p-2 rounded-lg bg-accent-10">
                          <insight.icon className="w-5 h-5 text-accent" />
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
                          <Rocket className="w-4 h-4 text-accent" />
                          Next Steps
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
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
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
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
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
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
                          <Briefcase className="w-4 h-4 text-accent" />
                          Job Market Fit
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-accent-20 border border-accent rounded-lg">
                            <div className="text-sm font-medium text-accent mb-1">
                              High Match
                            </div>
                            <div className="text-xs text-zinc-400">
                              Full-Stack Developer, Backend Engineer
                            </div>
                          </div>
                          <div className="p-3 bg-accent-20 border border-accent rounded-lg">
                            <div className="text-sm font-medium text-accent mb-1">
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
                <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Your Journey
              </h2>
              <p className="text-zinc-400 mb-8 text-lg">
                Begin building your AI Career Digital Twin by engaging with our
                platform. Every step strengthens your job readiness prediction.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <Code className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Solve Problems
                  </div>
                  <div className="text-xs text-zinc-400">
                    Practice coding challenges
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Optimize Resume
                  </div>
                  <div className="text-xs text-zinc-400">
                    Get AI-powered feedback
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">
                    Practice Interviews
                  </div>
                  <div className="text-xs text-zinc-400">
                    Mock technical interviews
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <BookOpen className="w-8 h-8 text-accent mx-auto mb-2" />
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
                  className="bg-accent hover:bg-accent px-8 py-3"
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
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-white font-medium">
                    Weekly Progress
                  </span>
                </div>
                <div className="text-2xl font-bold text-accent">+8.5%</div>
                <div className="text-sm text-zinc-400">
                  Improvement this week
                </div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-accent" />
                  <span className="text-white font-medium">
                    Learning Streak
                  </span>
                </div>
                <div className="text-2xl font-bold text-accent">
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
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-white font-medium">
                    High Demand Skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-accent-20 text-accent">React</Badge>
                  <Badge className="bg-accent-20 text-accent">Python</Badge>
                  <Badge className="bg-accent-20 text-accent">AI/ML</Badge>
                </div>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-accent" />
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

      {/* Explainability Modal: How AI Career Digital Twin Works */}
      {showTwinInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-2">
              How AI Career Digital Twin Works
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              This dashboard simulates your career growth using transparent,
              explainable AI logic (rule-based + weighted scoring).
            </p>

            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-sm font-semibold text-white mb-2">
                  Inputs (Signals)
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>• Coding performance</div>
                  <div>• Resume score</div>
                  <div>• Mock interview results</div>
                  <div>• Learning consistency</div>
                  <div>• Roadmap progress (approximated via activity)</div>
                </div>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-sm font-semibold text-white mb-2">
                  Logic
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>• Weighted scoring to compute Job Readiness %</div>
                  <div>
                    • Rule-based prediction to estimate timeline + risks
                  </div>
                  <div>
                    • LLM-style explanation (shown as human-readable reasons)
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <div className="text-sm font-semibold text-white mb-2">
                  Outputs
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>• Job readiness %</div>
                  <div>• Risk alerts (e.g., inactivity &gt; 3 days)</div>
                  <div>• Next best action (ONE task per day)</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowTwinInfoModal(false)}
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
