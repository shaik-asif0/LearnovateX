import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { getUser } from "../lib/utils";
import { useI18n } from "../i18n/I18nProvider";
import axiosInstance from "../lib/axios";

const LeaderboardPage = () => {
  const currentUser = getUser();
  const { t } = useI18n();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/leaderboard?limit=10");
        setLeaderboard(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Find current user rank and stats
  let userRank = null;
  let userStats = null;
  leaderboard.forEach((user, idx) => {
    if (user.id === currentUser?.id) {
      userRank = idx + 1;
      userStats = user;
    }
  });

  // Stats for cards
  const totalParticipants = leaderboard.length;
  const topScore = leaderboard.length > 0 ? leaderboard[0].avg_code_score : 0;
  const bestAvg = leaderboard.length > 0 ? leaderboard[0].avg_code_score : 0;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-orange-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-xl font-bold text-zinc-500">#{rank}</span>;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-1 bg-orange-500/10 border-orange-500/30";
    if (rank === 2) return "rank-2 bg-gray-400/10 border-gray-400/30";
    if (rank === 3) return "rank-3 bg-orange-400/10 border-orange-400/30";
    return "bg-zinc-800 border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-white" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {t("leaderboard.title", "Global Leaderboard")}
            </h1>
          </div>
          <p className="text-zinc-400">
            {t("leaderboard.subtitle", "Top performers across all challenges")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {totalParticipants}
              </div>
              <p className="text-sm text-zinc-400">
                {t("leaderboard.stats.totalParticipants", "Total Participants")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {topScore}
              </div>
              <p className="text-sm text-zinc-400">
                {t("leaderboard.stats.topScore", "Top Score")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Medal className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {bestAvg}%
              </div>
              <p className="text-sm text-zinc-400">
                {t("leaderboard.stats.bestAverage", "Best Average")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top 10 Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-zinc-400 py-8">
                Loading leaderboard...
              </div>
            ) : error ? (
              <div className="text-center text-orange-400 py-8">{error}</div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, idx) => (
                  <div
                    key={user.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-all ${getRankClass(
                      idx + 1
                    )} ${
                      user.id === currentUser?.id ? "ring-2 ring-white" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full min-w-0">
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center shrink-0">
                        {getRankIcon(idx + 1)}
                      </div>

                      {/* Avatar & Name */}
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarFallback className="bg-white text-black font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-zinc-400">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {user.code_submissions} submissions
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-6 sm:gap-8 items-center">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {user.avg_code_score}
                        </p>
                        <p className="text-xs text-zinc-500">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          {user.code_submissions}
                        </p>
                        <p className="text-xs text-zinc-500">Submissions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Rank */}
        <Card className="mt-6 bg-zinc-900 border-zinc-700">
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
      </main>
    </div>
  );
};

export default LeaderboardPage;
