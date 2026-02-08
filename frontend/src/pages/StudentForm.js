import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const StudentForm = ({ onSubmit, onCancel, initialData }) => {
  const { t } = useI18n();

  const [form, setForm] = useState(
    initialData || { name: "", email: "", department: "", year: "1st" }
  );
  return (
    <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData
            ? t("studentForm.edit", "Edit Student")
            : t("studentForm.add", "Add Student")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <Input
            placeholder={t("studentForm.placeholder.name", "Name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Input
            placeholder={t("studentForm.placeholder.email", "Email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Input
            placeholder={t("studentForm.placeholder.department", "Department")}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <select
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white p-2 rounded w-full"
          >
            <option value="1st">{t("studentForm.year.1", "1st Year")}</option>
            <option value="2nd">{t("studentForm.year.2", "2nd Year")}</option>
            <option value="3rd">{t("studentForm.year.3", "3rd Year")}</option>
            <option value="4th">{t("studentForm.year.4", "4th Year")}</option>
          </select>
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 flex-1"
            >
              {initialData
                ? t("studentForm.update", "Update")
                : t("studentForm.add", "Add")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
              onClick={onCancel}
            >
              {t("common.cancel", "Cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
