import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import axiosInstance from "../lib/axios";

const StudentAnalytics = () => {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/college/analytics");
        setAnalytics(response.data);
      } catch (error) {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const exportReport = () => {
    if (!analytics) return;
    const csv = [
      "Metric,Value",
      ...Object.entries(analytics).map(([k, v]) => `${k},${v}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_analytics_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>
                {t(
                  "studentAnalytics.title",
                  "Student Analytics & Deep Reports"
                )}
              </span>
              <Button
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto"
                onClick={exportReport}
              >
                {t("studentAnalytics.exportCsv", "Export CSV")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-zinc-400">
                {t("studentAnalytics.loading", "Loading analytics...")}
              </p>
            ) : !analytics ? (
              <p className="text-orange-400">
                {t("studentAnalytics.failed", "Failed to load analytics.")}
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-white font-medium">
                        {typeof value === "object"
                          ? t("studentAnalytics.complexData", "Complex data")
                          : value}
                      </span>
                    </div>
                    <Progress
                      value={
                        typeof value === "number" ? Math.min(value, 100) : 0
                      }
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentAnalytics;
