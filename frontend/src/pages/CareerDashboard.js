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

const CareerDashboard = () => {
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

  const chartData = stats
    ? [
        { name: "Code Score", value: stats.avg_code_score },
        { name: "Submissions", value: stats.code_submissions * 10 },
        { name: "Interviews", value: stats.interviews_taken * 20 },
        { name: "Learning", value: stats.learning_sessions * 5 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">
            Career Readiness Dashboard
          </h1>
        </div>

        {!loading && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div
              data-testid="stats-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                  <p className="text-xs text-blue-400 mt-1">
                    Total submissions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50 hover:border-green-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-300">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-100">
                    {stats.avg_code_score}%
                  </div>
                  <p className="text-xs text-green-400 mt-1">Code quality</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 hover:border-purple-600/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">
                    Interviews Taken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-100">
                    {stats.interviews_taken}
                  </div>
                  <p className="text-xs text-purple-400 mt-1">
                    Mock interviews
                  </p>
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
                  <p className="text-xs text-orange-400 mt-1">
                    AI tutor sessions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Performance Overview
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
                  Career Readiness Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/30">
                    <h4 className="font-semibold mb-2 text-blue-300">
                      🎯 Focus Areas
                    </h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {stats.code_submissions < 5 && (
                        <li>
                          • Complete more coding challenges to improve
                          problem-solving skills
                        </li>
                      )}
                      {stats.avg_code_score < 70 && (
                        <li>
                          • Focus on code quality and optimization techniques
                        </li>
                      )}
                      {stats.interviews_taken < 3 && (
                        <li>
                          • Practice more mock interviews to build confidence
                        </li>
                      )}
                      {stats.learning_sessions < 10 && (
                        <li>
                          • Increase learning sessions with AI tutor for better
                          concept understanding
                        </li>
                      )}
                      {stats.code_submissions >= 5 &&
                        stats.avg_code_score >= 70 && (
                          <li className="text-green-400">
                            ✓ Great job! Keep maintaining this momentum
                          </li>
                        )}
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg border border-green-700/30">
                    <h4 className="font-semibold mb-2 text-green-300">
                      ✨ Next Steps
                    </h4>
                    <p className="text-sm text-zinc-300">
                      Continue building your skills across all areas. Consider
                      tackling more advanced problems and practicing system
                      design concepts for senior positions.
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
