import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Award, Trophy, Star, Zap } from "lucide-react";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/achievements");
        setAchievements(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  // Stats
  // (Removed duplicate totalPoints declaration)
  // (Removed duplicate totalPossible declaration)
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

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-10 h-10 text-white" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Achievements
            </h1>
          </div>
          <p className="text-zinc-400">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {totalPoints}
              </div>
              <p className="text-sm text-zinc-400">Total Points</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Award className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {unlocked}
              </div>
              <p className="text-sm text-zinc-400">Unlocked</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Star className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {inProgress}
              </div>
              <p className="text-sm text-zinc-400">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">
                {totalPossible > 0
                  ? Math.round((totalPoints / totalPossible) * 100)
                  : 0}
                %
              </div>
              <p className="text-sm text-zinc-400">Completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Categories */}
        {loading ? (
          <div className="text-center text-zinc-400 py-8">
            Loading achievements...
          </div>
        ) : error ? (
          <div className="text-center text-orange-400 py-8">{error}</div>
        ) : (
          <div className="space-y-8">
            {achievements.map((category) => (
              <Card
                key={category.category}
                className="bg-zinc-900 border-zinc-800"
              >
                <CardHeader>
                  <CardTitle className="text-white">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.earned
                            ? "bg-zinc-800 border-zinc-600"
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 text-white">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-zinc-400 mb-2">
                              {achievement.desc}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white font-bold">
                                {achievement.points} pts
                              </span>
                              {achievement.earned ? (
                                <span className="text-xs text-white">
                                  ✓ Unlocked
                                </span>
                              ) : achievement.progress !== undefined ? (
                                <span className="text-xs text-zinc-500">
                                  {achievement.progress}/{achievement.target}
                                </span>
                              ) : (
                                <span className="text-xs text-zinc-500">
                                  Locked
                                </span>
                              )}
                            </div>
                            {!achievement.earned &&
                              achievement.progress !== undefined &&
                              achievement.target > 0 && (
                                <Progress
                                  value={Math.min(
                                    100,
                                    Math.round(
                                      (achievement.progress /
                                        achievement.target) *
                                        100
                                    )
                                  )}
                                  className="h-2 mt-2"
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
