import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const Connect = ({ students }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(students || []);

  useEffect(() => {
    setFiltered(
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, students]);

  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              {t("connect.title", "Connect with Students")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={t(
                "connect.searchPlaceholder",
                "Search by name or email..."
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 bg-zinc-800 border-zinc-700 text-white"
            />
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-zinc-400">
                  {t("connect.noStudents", "No students found.")}
                </p>
              ) : (
                filtered.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{student.name}</p>
                      <p className="text-xs text-zinc-400">{student.email}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      {t("connect.message", "Message")}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Connect;
