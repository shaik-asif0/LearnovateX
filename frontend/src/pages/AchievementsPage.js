import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Flame,
  Crown,
  Medal,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Gift,
  Sparkles,
  Clock,
  Users,
  BarChart3,
  Activity,
  CheckCircle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Eye,
  Share2,
  Download,
  Settings,
} from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";

const AchievementsPage = () => {
  const { t } = useI18n();
  const [accentColor, setAccentColor] = useState("#ff7a00"); // default orange
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("progress");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showLocked, setShowLocked] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
  });
  const intervalRef = useRef(null);

  // Real-time updates
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await axiosInstance.get("/achievements");
        const newAchievements = res.data;

        // Check for new unlocks
        const previousUnlocked = achievements.flatMap((cat) =>
          cat.items.filter((item) => item.earned).map((item) => item.id)
        );
        const currentUnlocked = newAchievements.flatMap((cat) =>
          cat.items.filter((item) => item.earned).map((item) => item.id)
        );

        const newUnlocks = currentUnlocked.filter(
          (id) => !previousUnlocked.includes(id)
        );
        if (newUnlocks.length > 0) {
          const unlockedItems = newAchievements.flatMap((cat) =>
            cat.items.filter((item) => newUnlocks.includes(item.id))
          );
          setRecentUnlocks((prev) => [...unlockedItems, ...prev].slice(0, 5));

          // Show notification for new unlocks
          unlockedItems.forEach((item) => {
            toast.success(`Achievement Unlocked: ${item.title}`, {
              description: `Earned ${item.points} points!`,
              duration: 5000,
            });
          });
        }

        setAchievements(newAchievements);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    // Set up real-time polling
    if (realTimeEnabled) {
      intervalRef.current = setInterval(fetchAchievements, 30000); // Update every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTimeEnabled]);

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await axiosInstance.get("/user/stats");
        setUserStats(res.data);
      } catch (err) {
        console.error("Failed to load user stats:", err);
      }
    };
    fetchUserStats();
  }, []);

  // Enhanced stats calculations
  const unlocked = achievements.reduce(
    (sum, cat) => sum + cat.items.filter((item) => item.earned).length,
    0
  );
  const inProgress = achievements.reduce(
    (sum, cat) =>
      sum +
      cat.items.filter((item) => !item.earned && item.progress > 0).length,
    0
  );
  const locked = achievements.reduce(
    (sum, cat) =>
      sum +
      cat.items.filter(
        (item) => !item.earned && (!item.progress || item.progress === 0)
      ).length,
    0
  );

  const totalPoints = achievements.reduce(
    (sum, cat) =>
      sum +
      cat.items
        .filter((item) => item.earned)
        .reduce((s, item) => s + item.points, 0),
    0
  );

  const totalPossible = achievements.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + item.points, 0),
    0
  );

  const completionRate =
    totalPossible > 0 ? Math.round((totalPoints / totalPossible) * 100) : 0;

  // Filter and sort achievements
  const filteredAchievements = achievements
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          filterCategory === "all" ||
          category.category.toLowerCase() === filterCategory;
        const matchesStatus =
          (showCompleted && item.earned) ||
          (showLocked && !item.earned) ||
          (!item.earned && item.progress > 0);

        return matchesSearch && matchesCategory && matchesStatus;
      }),
    }))
    .filter((category) => category.items.length > 0)
    .sort((a, b) => {
      switch (sortBy) {
        case "progress":
          const aProgress =
            a.items.filter((item) => item.earned).length / a.items.length;
          const bProgress =
            b.items.filter((item) => item.earned).length / b.items.length;
          return bProgress - aProgress;
        case "points":
          const aPoints = a.items.reduce(
            (sum, item) => sum + (item.earned ? item.points : 0),
            0
          );
          const bPoints = b.items.reduce(
            (sum, item) => sum + (item.earned ? item.points : 0),
            0
          );
          return bPoints - aPoints;
        case "name":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const toggleCategoryExpansion = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with Real-time Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {t("achievements.title", "Achievements")}
                </h1>
                <p className="text-zinc-400">
                  {t(
                    "achievements.subtitle",
                    "Track your progress and unlock rewards"
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

        {/* Recent Unlocks Notification */}
        {recentUnlocks.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-400" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    Recent Achievements Unlocked!
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recentUnlocks.slice(0, 3).map((achievement, idx) => (
                      <Badge
                        key={idx}
                        className="bg-orange-500/20 text-orange-300 border-orange-500/30"
                      >
                        {achievement.title}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRecentUnlocks([])}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {totalPoints}
              </div>
              <p className="text-xs text-zinc-400">Total Points</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {unlocked}
              </div>
              <p className="text-xs text-zinc-400">Unlocked</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {inProgress}
              </div>
              <p className="text-xs text-zinc-400">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Lock className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
              <div className="text-2xl font-bold text-white mb-1">{locked}</div>
              <p className="text-xs text-zinc-400">Locked</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {userStats.currentStreak}
              </div>
              <p className="text-xs text-zinc-400">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-4">
              <Target className="w-6 h-6 mx-auto mb-2 text-white" />
              <div className="text-2xl font-bold text-white mb-1">
                {completionRate}%
              </div>
              <p className="text-xs text-zinc-400">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Time Invested</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatTime(userStats.totalTimeSpent)}
              </div>
              <Progress
                value={Math.min(100, (userStats.totalTimeSpent / 1000) * 100)}
                className="h-2"
              />
              <p className="text-xs text-zinc-400 mt-2">
                Towards 1000h milestone
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Weekly Progress</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                +{userStats.weeklyProgress} pts
              </div>
              <Progress
                value={Math.min(100, userStats.weeklyProgress)}
                className="h-2"
              />
              <p className="text-xs text-zinc-400 mt-2">
                This week's achievement points
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Monthly Goal</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {userStats.monthlyProgress}/50
              </div>
              <Progress
                value={(userStats.monthlyProgress / 50) * 100}
                className="h-2"
              />
              <p className="text-xs text-zinc-400 mt-2">
                Achievements this month
              </p>
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
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800"
                />
                <span className="text-zinc-300">Show Completed</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLocked}
                  onChange={(e) => setShowLocked(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800"
                />
                <span className="text-zinc-300">Show Locked</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        {loading ? (
          <div className="text-center text-zinc-400 py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            Loading achievements...
          </div>
        ) : error ? (
          <div className="text-center text-orange-400 py-8">
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
          <div className="space-y-6">
            {filteredAchievements.map((category) => {
              const categoryProgress =
                (category.items.filter((item) => item.earned).length /
                  category.items.length) *
                100;
              const isExpanded =
                expandedCategories[category.category] !== false;

              return (
                <Card
                  key={category.category}
                  className="bg-zinc-900 border-zinc-800 overflow-hidden"
                >
                  <CardHeader
                    className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => toggleCategoryExpansion(category.category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-white">
                          {category.category}
                        </CardTitle>
                        <Badge className="bg-zinc-700 text-zinc-300">
                          {category.items.filter((item) => item.earned).length}/
                          {category.items.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-zinc-400">
                            {Math.round(categoryProgress)}% Complete
                          </div>
                          <Progress
                            value={categoryProgress}
                            className="w-24 h-2 mt-1"
                          />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                              achievement.earned
                                ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-lg shadow-green-500/10"
                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`text-3xl ${
                                  achievement.earned ? "animate-bounce" : ""
                                }`}
                              >
                                {achievement.earned ? (
                                  <Unlock className="text-green-400" />
                                ) : achievement.progress > 0 ? (
                                  <Activity className="text-blue-400" />
                                ) : (
                                  <Lock className="text-zinc-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-white">
                                    {achievement.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${
                                        achievement.earned
                                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                                          : achievement.progress > 0
                                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                          : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                                      }`}
                                    >
                                      {achievement.points} pts
                                    </Badge>
                                    {achievement.earned && (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  {achievement.desc}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold ${
                                      achievement.earned
                                        ? "text-green-400"
                                        : achievement.progress > 0
                                        ? "text-blue-400"
                                        : "text-zinc-500"
                                    }`}
                                  >
                                    {achievement.earned
                                      ? "✓ Completed"
                                      : achievement.progress !== undefined
                                      ? `${achievement.progress}/${achievement.target}`
                                      : "Locked"}
                                  </span>
                                  {achievement.earned && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Share2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {!achievement.earned &&
                                  achievement.progress !== undefined &&
                                  achievement.target > 0 && (
                                    <div className="mt-3">
                                      <Progress
                                        value={Math.min(
                                          100,
                                          Math.round(
                                            (achievement.progress /
                                              achievement.target) *
                                              100
                                          )
                                        )}
                                        className="h-2"
                                      />
                                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                        <span>
                                          {achievement.progress} /{" "}
                                          {achievement.target}
                                        </span>
                                        <span>
                                          {Math.round(
                                            (achievement.progress /
                                              achievement.target) *
                                              100
                                          )}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Achievement Tips */}
        <Card className="mt-8 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-400" />
              Achievement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Daily Streaks</h4>
                <p className="text-sm text-zinc-400">
                  Maintain daily coding streaks to unlock special achievements
                  and bonus points.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Quality Over Quantity
                </h4>
                <p className="text-sm text-zinc-400">
                  Focus on high-quality submissions rather than just completing
                  challenges quickly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Help Others</h4>
                <p className="text-sm text-zinc-400">
                  Teaching and mentoring others can unlock social achievement
                  badges.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Consistency Wins
                </h4>
                <p className="text-sm text-zinc-400">
                  Regular participation leads to more achievements than sporadic
                  intense sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AchievementsPage;
