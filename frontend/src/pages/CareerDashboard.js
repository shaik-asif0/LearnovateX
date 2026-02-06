import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import { useI18n } from "../i18n/I18nProvider";

const CareerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      toast.error(
        t("careerDashboard.toasts.loadStatsFailed", "Failed to load statistics")
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats
    ? [
        {
          name: t("careerDashboard.chart.codeScore", "Code Score"),
          value: stats.avg_code_score,
        },
        {
          name: t("careerDashboard.chart.submissions", "Submissions"),
          value: stats.code_submissions * 10,
        },
        {
          name: t("careerDashboard.chart.interviews", "Interviews"),
          value: stats.interviews_taken * 20,
        },
        {
          name: t("careerDashboard.chart.learning", "Learning"),
          value: stats.learning_sessions * 5,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">
            {t("careerDashboard.title", "Career Readiness Dashboard")}
          </h1>
        </div>

        {!loading && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div
              data-testid="stats-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-300">
                    {t(
                      "careerDashboard.stats.codeSubmissions",
                      "Code Submissions"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-100">
                    {stats.code_submissions}
                  </div>
                  <p className="text-xs text-orange-400 mt-1">
                    {t(
                      "careerDashboard.stats.totalSubmissions",
                      "Total submissions"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-300">
                    {t("careerDashboard.stats.averageScore", "Average Score")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-100">
                    {stats.avg_code_score}%
                  </div>
                  <p className="text-xs text-orange-400 mt-1">
                    {t("careerDashboard.stats.codeQuality", "Code quality")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-300">
                    {t(
                      "careerDashboard.stats.interviewsTaken",
                      "Interviews Taken"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-100">
                    {stats.interviews_taken}
                  </div>
                  <p className="text-xs text-orange-400 mt-1">
                    {t(
                      "careerDashboard.stats.mockInterviews",
                      "Mock interviews"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-300">
                    {t(
                      "careerDashboard.stats.learningSessions",
                      "Learning Sessions"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-100">
                    {stats.learning_sessions}
                  </div>
                  <p className="text-xs text-orange-400 mt-1">
                    {t(
                      "careerDashboard.stats.aiTutorSessions",
                      "AI tutor sessions"
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {t(
                    "careerDashboard.performanceOverview",
                    "Performance Overview"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-testid="performance-chart" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#1e40af"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {t("careerDashboard.tips.title", "Career Readiness Tips")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-900/30 to-orange-900/30 rounded-lg border border-orange-700/30">
                    <h4 className="font-semibold mb-2 text-orange-300">
                      {t("careerDashboard.tips.focusAreas", "🎯 Focus Areas")}
                    </h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {stats.code_submissions < 5 && (
                        <li>
                          {t(
                            "careerDashboard.tips.bullets.moreChallenges",
                            "• Complete more coding challenges to improve problem-solving skills"
                          )}
                        </li>
                      )}
                      {stats.avg_code_score < 70 && (
                        <li>
                          {t(
                            "careerDashboard.tips.bullets.codeQuality",
                            "• Focus on code quality and optimization techniques"
                          )}
                        </li>
                      )}
                      {stats.interviews_taken < 3 && (
                        <li>
                          {t(
                            "careerDashboard.tips.bullets.moreInterviews",
                            "• Practice more mock interviews to build confidence"
                          )}
                        </li>
                      )}
                      {stats.learning_sessions < 10 && (
                        <li>
                          {t(
                            "careerDashboard.tips.bullets.moreLearning",
                            "• Increase learning sessions with AI tutor for better concept understanding"
                          )}
                        </li>
                      )}
                      {stats.code_submissions >= 5 &&
                        stats.avg_code_score >= 70 && (
                          <li className="text-orange-400">
                            {t(
                              "careerDashboard.tips.bullets.greatJob",
                              "✓ Great job! Keep maintaining this momentum"
                            )}
                          </li>
                        )}
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-900/30 to-orange-900/30 rounded-lg border border-orange-700/30">
                    <h4 className="font-semibold mb-2 text-orange-300">
                      {t("careerDashboard.tips.nextSteps", "✨ Next Steps")}
                    </h4>
                    <p className="text-sm text-zinc-300">
                      {t(
                        "careerDashboard.tips.nextStepsParagraph",
                        "Continue building your skills across all areas. Consider tackling more advanced problems and practicing system design concepts for senior positions."
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerDashboard;
