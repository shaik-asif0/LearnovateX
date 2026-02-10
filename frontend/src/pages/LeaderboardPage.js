import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Users,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Award,
  Star,
  Flame,
  Clock,
  ChevronUp,
  ChevronDown,
  Share2,
  Download,
  Settings,
  Activity,
  Eye,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import { getUser } from "../lib/utils";
import { useI18n } from "../i18n/I18nProvider";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const LeaderboardPage = () => {
  const currentUser = getUser();
  const { t } = useI18n();

  const [accentColor, setAccentColor] = useState("#ff7a00"); // default orange

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all-time");
  const [sortBy, setSortBy] = useState("score");
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [detailedView, setDetailedView] = useState(false);
  const [userRankings, setUserRankings] = useState({
    global: null,
    weekly: null,
    monthly: null,
  });
  const [leaderboardStats, setLeaderboardStats] = useState({
    totalParticipants: 0,
    activeToday: 0,
    topScore: 0,
    averageScore: 0,
    totalSubmissions: 0,
  });
  const intervalRef = useRef(null);

  // Real-time updates
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axiosInstance.get(
          `/leaderboard?period=${filterPeriod}&limit=50`
        );
        const newLeaderboard = res.data.leaderboard || res.data;
        const newStats = res.data.stats || {};

        setLeaderboard(newLeaderboard);
        setLeaderboardStats((prev) => ({ ...prev, ...newStats }));
        setLastUpdated(new Date());
        setError(null);

        // Update user rankings
        const userRank =
          newLeaderboard.findIndex((user) => user.id === currentUser?.id) + 1;
        setUserRankings((prev) => ({
          ...prev,
          [filterPeriod]: userRank > 0 ? userRank : null,
        }));
      } catch (err) {
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up real-time polling
    if (realTimeEnabled) {
      intervalRef.current = setInterval(fetchLeaderboard, 60000); // Update every minute
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [filterPeriod, realTimeEnabled, currentUser?.id]);

  // Load saved accent color on mount
  useEffect(() => {
    const saved = localStorage.getItem("accentColor");
    if (saved) {
      setAccentColor(saved);
    }
  }, []);

  // Enhanced stats calculations
  const totalParticipants = leaderboard.length;
  const topScore = leaderboard.length > 0 ? leaderboard[0].avg_code_score : 0;
  const averageScore =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce((sum, user) => sum + user.avg_code_score, 0) /
            leaderboard.length
        )
      : 0;
  const totalSubmissions = leaderboard.reduce(
    (sum, user) => sum + (user.code_submissions || 0),
    0
  );

  // Find current user rank and stats
  let userRank = null;
  let userStats = null;
  leaderboard.forEach((user, idx) => {
    if (user.id === currentUser?.id) {
      userRank = idx + 1;
      userStats = user;
    }
  });

  const getRankIcon = (rank) => {
    if (rank === 1)
      return <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3)
      return <Medal className="w-6 h-6" style={{ color: accentColor }} />;
    return <span className="text-xl font-bold text-zinc-500">#{rank}</span>;
  };

  const getRankClass = (rank) => {
    if (rank === 1)
      return "rank-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/10";
    if (rank === 2)
      return "rank-2 bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30";
    if (rank === 3)
      return `rank-3 bg-gradient-to-r from-[${accentColor}]/10 to-red-400/10 border-[${accentColor}]/30`;
    return "bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-all";
  };

  // Filter and sort leaderboard
  const filteredLeaderboard = leaderboard
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.avg_code_score - a.avg_code_score;
        case "submissions":
          return b.code_submissions - a.code_submissions;
        case "streak":
          return (b.current_streak || 0) - (a.current_streak || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getRankChange = (user, index) => {
    // This would typically come from the API
    const previousRank = user.previous_rank || index + 1;
    const currentRank = index + 1;
    const change = previousRank - currentRank;

    if (change > 0) return { change, direction: "up", color: "text-green-400" };
    if (change < 0)
      return {
        change: Math.abs(change),
        direction: "down",
        color: "text-red-400",
      };
    return { change: 0, direction: "same", color: "text-zinc-400" };
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Never";
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with Real-time Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {t("leaderboard.title", "Global Leaderboard")}
                </h1>
                <p className="text-zinc-400">
                  {t(
                    "leaderboard.subtitle",
                    "Top performers across all challenges"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <RefreshCw
                  className={`w-4 h-4 ${realTimeEnabled ? "animate-spin" : ""}`}
                />
                <span>Live Updates {realTimeEnabled ? "ON" : "OFF"}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                {realTimeEnabled ? "Disable" : "Enable"} Live
              </Button>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Users className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {totalParticipants}
              </div>
              <p className="text-xs text-zinc-400">Total Participants</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {topScore}
              </div>
              <p className="text-xs text-zinc-400">Top Score</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {averageScore}
              </div>
              <p className="text-xs text-zinc-400">Average Score</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Target className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {totalSubmissions}
              </div>
              <p className="text-xs text-zinc-400">Total Submissions</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Activity className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {leaderboardStats.activeToday || 0}
              </div>
              <p className="text-xs text-zinc-400">Active Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="daily">Today</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="submissions">Submissions</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setDetailedView(!detailedView)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {detailedView ? "Simple" : "Detailed"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Leaderboard Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Top Rankings</CardTitle>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>
                  Period: {filterPeriod.replace("-", " ").toUpperCase()}
                </span>
                <Badge className="bg-zinc-700 text-zinc-300">
                  {filteredLeaderboard.length} shown
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-zinc-400 py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                Loading leaderboard...
              </div>
            ) : error ? (
              <div className="text-center py-8" style={{ color: accentColor }}>
                <div className="mb-4">{error}</div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeaderboard
                  .slice(0, detailedView ? 50 : 20)
                  .map((user, idx) => {
                    const rankChange = getRankChange(user, idx);
                    const isCurrentUser = user.id === currentUser?.id;

                    return (
                      <div
                        key={user.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getRankClass(
                          idx + 1
                        )} ${
                          isCurrentUser ? "ring-2 ring-white shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4 w-full min-w-0">
                          {/* Rank */}
                          <div className="w-12 flex items-center justify-center shrink-0">
                            {getRankIcon(idx + 1)}
                          </div>

                          {/* Rank Change */}
                          {rankChange.change !== 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              {rankChange.direction === "up" ? (
                                <ChevronUp
                                  className={`w-3 h-3 ${rankChange.color}`}
                                />
                              ) : (
                                <ChevronDown
                                  className={`w-3 h-3 ${rankChange.color}`}
                                />
                              )}
                              <span className={rankChange.color}>
                                {rankChange.change}
                              </span>
                            </div>
                          )}

                          {/* Avatar & Name */}
                          <Avatar className="w-12 h-12 shrink-0">
                            <AvatarFallback className="bg-white text-black font-bold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white truncate">
                                {user.name}
                                {isCurrentUser && (
                                  <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    You
                                  </Badge>
                                )}
                              </p>
                              {user.current_streak > 0 && (
                                <Badge
                                  className="border"
                                  style={{
                                    backgroundColor: `${accentColor}33`,
                                    color: accentColor,
                                    borderColor: `${accentColor}4D`,
                                  }}
                                >
                                  <Flame className="w-3 h-3 mr-1" />
                                  {user.current_streak}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-zinc-400">
                              {user.code_submissions || 0} submissions
                              {detailedView && user.last_active && (
                                <span className="ml-2">
                                  • {formatLastActive(user.last_active)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-6 sm:gap-8 items-center">
                          <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold text-white">
                              {user.avg_code_score || 0}
                            </p>
                            <p className="text-xs text-zinc-500">Avg Score</p>
                          </div>
                          {detailedView && (
                            <>
                              <div className="text-center">
                                <p className="text-xl sm:text-2xl font-bold text-white">
                                  {user.total_points || 0}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  Total Points
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl sm:text-2xl font-bold text-white">
                                  {user.accuracy || 0}%
                                </p>
                                <p className="text-xs text-zinc-500">
                                  Accuracy
                                </p>
                              </div>
                            </>
                          )}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Your Rank Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-zinc-900 border-zinc-700">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">
                    Your Current Rank
                  </h3>
                  <p className="text-zinc-400">
                    {userRank
                      ? `You are ranked #${userRank} out of ${totalParticipants}`
                      : "Participate to get ranked!"}
                  </p>
                  {userStats && (
                    <div className="mt-2 text-sm text-zinc-400">
                      <p>Avg Score: {userStats.avg_code_score || 0}</p>
                      <p>Submissions: {userStats.code_submissions || 0}</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white">
                    {userRank ? `#${userRank}` : "-"}
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">
                    Out of {totalParticipants}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-700">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">
                    Rank Progress
                  </h3>
                  <p className="text-zinc-400">
                    {userRank && userRank > 1
                      ? `Only ${userRank - 1} points to next rank!`
                      : userRank === 1
                      ? "You're #1! Keep it up!"
                      : "Start coding to climb the ranks!"}
                  </p>
                  {userStats && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Progress to next rank</span>
                        <span>
                          {Math.min(
                            100,
                            ((userStats.avg_code_score || 0) / 100) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              ((userStats.avg_code_score || 0) / 100) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold text-white">
                    {userRank ? `${Math.max(0, 21 - userRank)}` : "0"}
                  </div>
                  <p className="text-sm text-zinc-400">Spots to #20</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Insights */}
        <Card className="mt-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Leaderboard Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Top Performers
                </h4>
                <p className="text-sm text-zinc-400">
                  The top 3 positions are highly competitive. Focus on
                  consistent high-quality submissions to climb the ranks.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Streaks Matter
                </h4>
                <p className="text-sm text-zinc-400">
                  Daily coding streaks can give you bonus points and help
                  maintain consistent ranking improvements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Quality vs Quantity
                </h4>
                <p className="text-sm text-zinc-400">
                  While submission count matters, average score has higher
                  weight in final rankings. Aim for accuracy!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeaderboardPage;
