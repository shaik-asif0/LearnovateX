import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const StudentGroups = ({ students }) => {
  const [groups, setGroups] = useState([
    { id: 1, name: "Web Development", students: [1, 2], color: "blue" },
    { id: 2, name: "Data Science", students: [3, 4], color: "green" },
  ]);
  const [newGroup, setNewGroup] = useState("");

  const addGroup = () => {
    if (newGroup.trim()) {
      setGroups([
        ...groups,
        { id: Date.now(), name: newGroup, students: [], color: "gray" },
      ]);
      setNewGroup("");
    }
  };

  const assignStudent = (groupId, studentId) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              students: g.students.includes(studentId)
                ? g.students.filter((id) => id !== studentId)
                : [...g.students, studentId],
            }
          : g
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              Student Groups Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="New group name"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                onClick={addGroup}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Add Group
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      {group.name}
                      <Badge
                        className={`bg-${group.color}-500/20 text-${group.color}-400`}
                      >
                        {group.students.length} students
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {students
                        .filter((s) => group.students.includes(s.id))
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex justify-between items-center p-2 bg-zinc-700 rounded"
                          >
                            <span className="text-white">{student.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                assignStudent(group.id, student.id)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      <select
                        className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            assignStudent(group.id, parseInt(e.target.value));
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Add student...</option>
                        {students
                          .filter((s) => !group.students.includes(s.id))
                          .map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentGroups;
