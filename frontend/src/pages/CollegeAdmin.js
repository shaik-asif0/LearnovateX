import React, { useState, useEffect, useCallback } from "react";
import Connect from "./Connect";
import StudentGroups from "./StudentGroups";
import StudentForm from "./StudentForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Award,
  Code,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  FileText,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Flame,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  Settings,
  UserPlus,
  Upload,
  Send,
  MessageSquare,
  Activity,
  Brain,
  Briefcase,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { toast } from "sonner";
import axiosInstance from "../lib/axios";

const PremiumAdmin = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedItems, setApprovedItems] = useState(new Set());
  const [rejectedItems, setRejectedItems] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollRes, appRes] = await Promise.all([
        axiosInstance.get("/admin/enrollments"),
        axiosInstance.get("/admin/applications"),
      ]);
      setEnrollments(enrollRes.data);
      setApplications(appRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (type, id, status) => {
    try {
      const endpoint =
        type === "enrollment"
          ? `/admin/enrollments/${id}/status`
          : `/admin/applications/${id}/status`;
      await axiosInstance.put(endpoint, null, { params: { status } });

      // Add to the appropriate set for visual feedback
      if (status === "approved") {
        setApprovedItems((prev) => new Set([...prev, `${type}-${id}`]));
      } else if (status === "rejected") {
        setRejectedItems((prev) => new Set([...prev, `${type}-${id}`]));
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Course Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex justify-between items-center p-4 bg-zinc-800 rounded"
              >
                <div>
                  <p className="text-white">
                    {enrollment.name} - {enrollment.course_title}
                  </p>
                  <p className="text-zinc-400">{enrollment.email}</p>
                  <Badge
                    variant={
                      enrollment.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {approvedItems.has(`enrollment-${enrollment.id}`) ? (
                    <CheckCircle2 className="w-6 h-6 text-orange-500" />
                  ) : rejectedItems.has(`enrollment-${enrollment.id}`) ? (
                    <XCircle className="w-6 h-6 text-orange-500" />
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          updateStatus("enrollment", enrollment.id, "approved")
                        }
                        size="sm"
                        className="relative pointer-events-auto"
                        style={{ zIndex: 9999 }}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          updateStatus("enrollment", enrollment.id, "rejected")
                        }
                        variant="destructive"
                        size="sm"
                        className="relative pointer-events-auto"
                        style={{ zIndex: 9999 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Internship Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex justify-between items-center p-4 bg-zinc-800 rounded"
              >
                <div>
                  <p className="text-white">
                    {application.name} - {application.internship_title}
                  </p>
                  <p className="text-zinc-400">{application.email}</p>
                  <Badge
                    variant={
                      application.status === "approved"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {approvedItems.has(`application-${application.id}`) ? (
                    <CheckCircle2 className="w-6 h-6 text-orange-500" />
                  ) : rejectedItems.has(`application-${application.id}`) ? (
                    <XCircle className="w-6 h-6 text-orange-500" />
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          updateStatus(
                            "application",
                            application.id,
                            "approved"
                          )
                        }
                        size="sm"
                        className="relative pointer-events-auto"
                        style={{ zIndex: 9999 }}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          updateStatus(
                            "application",
                            application.id,
                            "rejected"
                          )
                        }
                        variant="destructive"
                        size="sm"
                        className="relative pointer-events-auto"
                        style={{ zIndex: 9999 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CollegeAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    onlineNow: 0,
    todayActive: 0,
    weeklyGrowth: 0,
  });
  const [analytics, setAnalytics] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Simulate real-time activity feed
    const activities = [
      "New student registered: John Doe",
      "Course completed: Sarah Smith - Python 101",
      "New internship application: Mike Johnson",
      "System update: Performance optimized",
      "New announcement posted: Exam Schedule",
    ];

    const interval = setInterval(() => {
      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)];
      const timestamp = new Date().toLocaleTimeString();
      setRecentActivities((prev) => [
        { id: Date.now(), text: randomActivity, time: timestamp },
        ...prev.slice(0, 4),
      ]);
    }, 5000 + Math.random() * 5000); // Random interval between 5-10s

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get("/college/analytics");
      setAnalytics(response.data);
      setRealtimeStats({
        onlineNow: Math.floor(response.data.active_students * 0.3) + Math.floor(Math.random() * 5), // Add random variation
        todayActive: response.data.active_students,
        weeklyGrowth: response.data.engagement_rate,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchStudents();
    fetchAnnouncements();
    fetchAnalytics();

    // Refresh analytics periodically
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddStudent = async (data) => {
    try {
      await axiosInstance.post("/college/students", data);
      toast.success("Student added successfully!");
      setShowStudentForm(false);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to add student");
    }
  };

  const handleEditStudent = async (data) => {
    try {
      await axiosInstance.put(`/college/students/${editStudent.id}`, data);
      toast.success("Student updated successfully!");
      setEditStudent(null);
      setShowStudentForm(false);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to update student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await axiosInstance.delete(`/college/students/${studentId}`);
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleBulkMessage = async (subject, message) => {
    try {
      await Promise.all(
        selectedStudents.map((id) => sendMessageToStudent(id, subject, message))
      );
      toast.success(`Message sent to ${selectedStudents.length} students!`);
      setSelectedStudents([]);
      setShowBulkModal(false);
    } catch (error) {
      toast.error("Failed to send bulk messages");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedStudents.length} students?`)) return;
    try {
      await Promise.all(selectedStudents.map((id) => handleDeleteStudent(id)));
      setSelectedStudents([]);
    } catch (error) {
      toast.error("Failed to delete students");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/college/students");
      // Transform backend data to match frontend structure with real performance
      const transformedStudents = response.data.map((student, index) => ({
        ...student,
        avg_score:
          student.avg_score ||
          Math.min(
            100,
            Math.floor(
              (student.learning_sessions * 2 + student.code_submissions * 5) /
              10
            )
          ), // Real calculation or backend value
        status:
          student.learning_sessions > 0 || student.code_submissions > 0
            ? "active"
            : "inactive",
        department: student.department || "Computer Science",
        year: student.year || ["1st", "2nd", "3rd", "4th"][index % 4],
        last_active: student.learning_sessions > 0 ? "Recently" : "Inactive",
        streak:
          typeof student.login_display_current_streak === "number"
            ? student.login_display_current_streak
            : typeof student.streak === "number"
              ? student.streak
              : 0,
        badges:
          student.code_submissions > 20
            ? ["Code Master"]
            : student.learning_sessions > 30
              ? ["Fast Learner"]
              : [],
      }));
      setStudents(transformedStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students. Please check your permissions.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStudentDetails = async (studentId) => {
    setLoadingDetails(true);
    try {
      const response = await axiosInstance.get(
        `/college/students/${studentId}/details`
      );
      setStudentDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      toast.error("Failed to load student details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const sendMessageToStudent = async (studentId, subject, message) => {
    try {
      await axiosInstance.post(`/college/students/${studentId}/message`, {
        to_id: studentId,
        subject,
        message,
      });
      toast.success("Message sent to student!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get("/college/announcements");
      setAnnouncements(
        response.data.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.message,
          date: new Date(a.created_at).toLocaleDateString(),
          priority:
            a.type === "urgent"
              ? "high"
              : a.type === "event"
                ? "medium"
                : "low",
        }))
      );
    } catch (error) {
      // Default empty announcements on error
      setAnnouncements([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || student.status === filterStatus;
      const matchesDepartment =
        filterDepartment === "all" || student.department === filterDepartment;
      const matchesYear = filterYear === "all" || student.year === filterYear;
      return matchesSearch && matchesFilter && matchesDepartment && matchesYear;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "score") return b.avg_score - a.avg_score;
      if (sortBy === "sessions")
        return b.learning_sessions - a.learning_sessions;
      if (sortBy === "submissions")
        return b.code_submissions - a.code_submissions;
      return 0;
    });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    avgScore:
      students.length > 0
        ? Math.round(
          students.reduce((acc, s) => acc + (s.avg_score || 0), 0) /
          students.length
        )
        : 0,
    totalSessions: students.reduce((acc, s) => acc + s.learning_sessions, 0),
    totalSubmissions: students.reduce((acc, s) => acc + s.code_submissions, 0),
  };

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementType, setAnnouncementType] = useState("general");

  const sendAnnouncement = async () => {
    if (newAnnouncement.trim() && announcementTitle.trim()) {
      try {
        await axiosInstance.post("/college/announcements", {
          title: announcementTitle,
          message: newAnnouncement,
          type: announcementType,
        });
        toast.success("Announcement sent to all students!");
        setNewAnnouncement("");
        setAnnouncementTitle("");
        setShowAnnouncementModal(false);
        fetchAnnouncements();
      } catch (error) {
        toast.error("Failed to send announcement");
      }
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    try {
      await axiosInstance.delete(`/college/announcements/${announcementId}`);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const exportData = (format = "csv") => {
    if (format === "csv") {
      const csvContent = students
        .map(
          (s) =>
            `${s.name},${s.email},${s.learning_sessions},${s.code_submissions},${s.avg_score}`
        )
        .join("\n");
      const header =
        "Name,Email,Learning Sessions,Code Submissions,Avg Score\n";
      const blob = new Blob([header + csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students_data.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === "json") {
      const jsonContent = JSON.stringify(students, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students_data.json";
      a.click();
      window.URL.revokeObjectURL(url);
    }
    toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  const getScoreColor = (score) => {
    return "text-orange-400";
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <GraduationCap className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  College Admin Dashboard
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                  Monitor and manage student progress in real-time
                </p>
              </div>
            </div>
            {/* Live Activity Ticker */}
            <div className="hidden lg:flex flex-col items-end justify-center mr-6 border-r border-zinc-800 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                  Live Feed
                </span>
              </div>
              <div className="h-6 overflow-hidden relative w-64 text-right">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className={`text-xs text-zinc-400 transition-all duration-500 absolute right-0 w-full truncate ${idx === 0
                        ? "top-0 opacity-100 translate-y-0"
                        : "top-6 opacity-0 translate-y-4"
                      }`}
                  >
                    <span className="text-zinc-500 mr-2">{activity.time}</span>
                    {activity.text}
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <span className="text-xs text-zinc-600">
                    Waiting for activity...
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnnouncementModal(true)}
                className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                Announce
              </Button>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => exportData("csv")}
                      className="bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export student data as CSV file</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => exportData("json")}
                      className="bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export student data as JSON file</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Real-time Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">
                      Online Now
                    </p>
                    <p className="text-2xl font-bold text-orange-400">
                      {realtimeStats.onlineNow}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">
                      Active Today
                    </p>
                    <p className="text-2xl font-bold text-orange-400">
                      {realtimeStats.todayActive}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">
                      Weekly Growth
                    </p>
                    <p className="text-2xl font-bold text-orange-400">
                      +{realtimeStats.weeklyGrowth}%
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {students.length}
                    </p>
                  </div>
                  <div className="p-2 bg-zinc-500/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-white mb-2" />
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-zinc-400">Total Students</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-zinc-400">Active</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <XCircle className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {stats.inactive}
                </p>
                <p className="text-xs text-zinc-400">Inactive</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {stats.totalSessions}
                </p>
                <p className="text-xs text-zinc-400">Sessions</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Code className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {stats.totalSubmissions}
                </p>
                <p className="text-xs text-zinc-400">Submissions</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {students.filter((s) => s.avg_score >= 90).length}
                </p>
                <p className="text-xs text-zinc-400">Top Performers</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Users className="w-4 h-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <PieChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Bell className="w-4 h-4 mr-2" />
                Announcements
              </TabsTrigger>
              <TabsTrigger
                value="connect"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Connect
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Users className="w-4 h-4 mr-2" />
                Groups
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Award className="w-4 h-4 mr-2" />
                Premium
              </TabsTrigger>
            </TabsList>
            <TabsContent value="connect" className="mt-6">
              <Connect students={students} />
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <StudentGroups students={students} />
            </TabsContent>

            <TabsContent value="premium" className="mt-6">
              <PremiumAdmin />
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        user: "Sarah Wilson",
                        action: "completed Python Advanced module",
                        time: "2 mins ago",
                        icon: CheckCircle2,
                        color: "text-orange-400",
                      },
                      {
                        user: "John Doe",
                        action: "submitted code for Algorithm Challenge",
                        time: "5 mins ago",
                        icon: Code,
                        color: "text-orange-400",
                      },
                      {
                        user: "Jane Smith",
                        action: "achieved 15-day learning streak",
                        time: "10 mins ago",
                        icon: Flame,
                        color: "text-orange-400",
                      },
                      {
                        user: "Alex Brown",
                        action: "started Data Structures course",
                        time: "15 mins ago",
                        icon: BookOpen,
                        color: "text-orange-400",
                      },
                      {
                        user: "Mike Johnson",
                        action: "logged in after 3 days",
                        time: "20 mins ago",
                        icon: Users,
                        color: "text-zinc-400",
                      },
                    ].map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                      >
                        <div
                          className={`p-2 bg-zinc-800 rounded-lg ${activity.color}`}
                        >
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-medium">{activity.user}</span>{" "}
                            <span className="text-zinc-400">
                              {activity.action}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-400" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {students
                      .sort((a, b) => b.avg_score - a.avg_score)
                      .slice(0, 5)
                      .map((student, idx) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0
                                ? "bg-orange-500/20 text-orange-400"
                                : idx === 1
                                  ? "bg-zinc-400/20 text-zinc-300"
                                  : idx === 2
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-zinc-700 text-zinc-400"
                              }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {student.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {student.department}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${getScoreColor(
                                student.avg_score
                              )}`}
                            >
                              {student.avg_score}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              {/* Search, Filters, and Add Button */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-32 bg-zinc-900 border-zinc-800 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="Information Technology">
                      Information Technology
                    </SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full md:w-32 bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="score">Sort by Score</SelectItem>
                    <SelectItem value="sessions">Sort by Sessions</SelectItem>
                    <SelectItem value="submissions">
                      Sort by Submissions
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-zinc-200"
                  onClick={() => {
                    setEditStudent(null);
                    setShowStudentForm(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                {selectedStudents.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                      onClick={() => {
                        setBulkAction("message");
                        setShowBulkModal(true);
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Bulk Message ({selectedStudents.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-700 text-orange-400 hover:bg-orange-900"
                      onClick={handleBulkDelete}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Bulk Delete ({selectedStudents.length})
                    </Button>
                  </div>
                )}
              </div>

              {/* Students List */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Student Progress ({filteredStudents.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="p-4 bg-zinc-800/50 rounded-xl animate-pulse"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-700 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
                              <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No students found</p>
                    </div>
                  ) : (
                    <div data-testid="students-list" className="space-y-3">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:scale-[1.02] group"
                        >
                          <div
                            className="flex items-center gap-4 mb-3 md:mb-0 cursor-pointer"
                            onClick={() => {
                              setSelectedStudent(student);
                              fetchStudentDetails(student.id);
                              setShowStudentModal(true);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedStudents([
                                    ...selectedStudents,
                                    student.id,
                                  ]);
                                } else {
                                  setSelectedStudents(
                                    selectedStudents.filter(
                                      (id) => id !== student.id
                                    )
                                  );
                                }
                              }}
                              className="w-4 h-4 text-orange-600 bg-zinc-800 border-zinc-600 rounded focus:ring-orange-500"
                            />
                            <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">
                                  {student.name}
                                </h3>
                                <Badge
                                  className={getStatusColor(student.status)}
                                >
                                  {student.status}
                                </Badge>
                                {student.streak > 0 && (
                                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    <Flame className="w-3 h-3 mr-1" />
                                    {student.streak}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-zinc-400">
                                {student.email}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {student.department} • {student.year} Year
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xl font-bold text-white">
                                {student.learning_sessions}
                              </p>
                              <p className="text-xs text-zinc-500">Sessions</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-white">
                                {student.code_submissions}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Submissions
                              </p>
                            </div>
                            <div className="text-center">
                              <p
                                className={`text-xl font-bold ${getScoreColor(
                                  student.avg_score
                                )}`}
                              >
                                {student.avg_score}%
                              </p>
                              <p className="text-xs text-zinc-500">Avg Score</p>
                            </div>
                            <div className="hidden md:block text-right">
                              <p className="text-xs text-zinc-500">
                                Last active
                              </p>
                              <p className="text-sm text-zinc-400">
                                {student.last_active}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-orange-400"
                              title="Edit"
                              onClick={() => {
                                setEditStudent(student);
                                setShowStudentForm(true);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-orange-400"
                              title="Delete"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Student Add/Edit Modal */}
              <Dialog open={showStudentForm} onOpenChange={setShowStudentForm}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
                  <StudentForm
                    initialData={editStudent}
                    onSubmit={
                      editStudent ? handleEditStudent : handleAddStudent
                    }
                    onCancel={() => {
                      setShowStudentForm(false);
                      setEditStudent(null);
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* Bulk Message Modal */}
              <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      Bulk Message to {selectedStudents.length} Students
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Subject"
                      className="bg-zinc-800 border-zinc-700 text-white"
                      value={bulkAction === "message" ? "" : ""}
                      onChange={(e) => { }}
                    />
                    <textarea
                      placeholder="Message"
                      className="w-full h-32 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 resize-none"
                    />
                    <Button
                      className="bg-white text-black hover:bg-zinc-200"
                      onClick={() =>
                        handleBulkMessage("Bulk Subject", "Bulk Message")
                      }
                    >
                      Send to All Selected
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Department Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      "Computer Science",
                      "Information Technology",
                      "Data Science",
                      "Electronics",
                    ].map((dept, idx) => {
                      const count = students.filter(
                        (s) => s.department === dept
                      ).length;
                      const percentage =
                        students.length > 0
                          ? Math.round((count / students.length) * 100)
                          : 0;
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">{dept}</span>
                            <span className="text-white font-medium">
                              {count} students ({percentage}%)
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2 bg-zinc-800"
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        label: "Excellent (90-100)",
                        min: 90,
                        max: 100,
                        color: "bg-orange-500",
                      },
                      {
                        label: "Good (70-89)",
                        min: 70,
                        max: 89,
                        color: "bg-orange-500",
                      },
                      {
                        label: "Average (50-69)",
                        min: 50,
                        max: 69,
                        color: "bg-orange-500",
                      },
                      {
                        label: "Needs Improvement (<50)",
                        min: 0,
                        max: 49,
                        color: "bg-orange-500",
                      },
                    ].map((range) => {
                      const count = students.filter(
                        (s) =>
                          s.avg_score >= range.min && s.avg_score <= range.max
                      ).length;
                      const percentage =
                        students.length > 0
                          ? Math.round((count / students.length) * 100)
                          : 0;
                      return (
                        <div key={range.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">{range.label}</span>
                            <span className="text-white font-medium">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${range.color} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-40 gap-2">
                      {["Week 1", "Week 2", "Week 3", "Week 4"].map(
                        (week, idx) => {
                          const height = Math.random() * 100 + 20;
                          return (
                            <div
                              key={week}
                              className="flex-1 flex flex-col items-center gap-2"
                            >
                              <div
                                className="w-full bg-gradient-to-t from-orange-500/20 to-orange-500/60 rounded-t"
                                style={{ height: `${height}%` }}
                              />
                              <span className="text-xs text-zinc-500">
                                {week}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="mt-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Announcements ({announcements.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowAnnouncementModal(true)}
                        className="bg-white text-black hover:bg-zinc-200"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        New Announcement
                      </Button>
                      {announcements.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => {
                            if (window.confirm("Clear all announcements?")) {
                              setAnnouncements([]);
                              toast.success("All announcements cleared");
                            }
                          }}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {announcement.title}
                          </h3>
                          <Badge
                            className={
                              announcement.priority === "high"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                : announcement.priority === "medium"
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                            }
                          >
                            {announcement.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {announcement.date}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {announcement.content}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Student Detail Modal */}
          <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                    {selectedStudent?.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedStudent?.name}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {selectedStudent?.email}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <BookOpen className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                      <p className="text-xl font-bold text-white">
                        {selectedStudent.learning_sessions}
                      </p>
                      <p className="text-xs text-zinc-500">Sessions</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <Code className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                      <p className="text-xl font-bold text-white">
                        {selectedStudent.code_submissions}
                      </p>
                      <p className="text-xs text-zinc-500">Submissions</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <Target className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                      <p
                        className={`text-xl font-bold ${getScoreColor(
                          selectedStudent.avg_score
                        )}`}
                      >
                        {selectedStudent.avg_score}%
                      </p>
                      <p className="text-xs text-zinc-500">Avg Score</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <Flame className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                      <p className="text-xl font-bold text-white">
                        {selectedStudent.streak}
                      </p>
                      <p className="text-xs text-zinc-500">Day Streak</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">
                      Badges Earned
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.badges?.length > 0 ? (
                        selectedStudent.badges.map((badge, idx) => (
                          <Badge
                            key={idx}
                            className="bg-white/10 text-white border-white/20"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {badge}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">
                          No badges earned yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Student Progress Timeline */}
                  <div className="my-4">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">
                      Progress Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">Sessions</p>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (selectedStudent.learning_sessions / 50) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          {selectedStudent.learning_sessions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Submissions</p>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (selectedStudent.code_submissions / 50) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          {selectedStudent.code_submissions}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Send Message Section */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Subject"
                      className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white mb-2"
                      value={selectedStudent?.messageSubject || ""}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          messageSubject: e.target.value,
                        })
                      }
                    />
                    <textarea
                      placeholder="Type your message..."
                      className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white mb-2"
                      value={selectedStudent?.messageBody || ""}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          messageBody: e.target.value,
                        })
                      }
                    />
                    <Button
                      className="bg-white text-black hover:bg-zinc-200"
                      onClick={() => {
                        if (
                          selectedStudent?.messageSubject &&
                          selectedStudent?.messageBody
                        ) {
                          sendMessageToStudent(
                            selectedStudent.id,
                            selectedStudent.messageSubject,
                            selectedStudent.messageBody
                          );
                          setSelectedStudent({
                            ...selectedStudent,
                            messageSubject: "",
                            messageBody: "",
                          });
                        } else {
                          toast.error("Please enter subject and message");
                        }
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Announcement Modal */}
          <Dialog
            open={showAnnouncementModal}
            onOpenChange={setShowAnnouncementModal}
          >
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Send Announcement</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  This will be sent to all students in your college.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Announcement title..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Select
                  value={announcementType}
                  onValueChange={setAnnouncementType}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
                <textarea
                  placeholder="Write your announcement..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  className="w-full h-32 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={sendAnnouncement}
                    className="flex-1 bg-white text-black hover:bg-zinc-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to All Students
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default CollegeAdmin;
