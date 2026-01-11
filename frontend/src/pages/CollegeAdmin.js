import React, { useState, useEffect, useCallback } from "react";
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
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const CollegeAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
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

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get("/college/analytics");
      setAnalytics(response.data);
      setRealtimeStats({
        onlineNow: Math.floor(response.data.active_students * 0.3),
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

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/college/students");
      // Transform backend data to match frontend structure
      const transformedStudents = response.data.map((student, index) => ({
        ...student,
        avg_score: Math.floor(Math.random() * 30) + 70, // Temporary until backend provides this
        status:
          student.learning_sessions > 0 || student.code_submissions > 0
            ? "active"
            : "inactive",
        department: "Computer Science",
        year: ["1st", "2nd", "3rd", "4th"][index % 4],
        last_active: student.learning_sessions > 0 ? "Recently" : "Inactive",
        streak: Math.floor(Math.random() * 15),
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
      return matchesSearch && matchesFilter;
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

  const exportData = () => {
    const csvContent = students
      .map(
        (s) =>
          `${s.name},${s.email},${s.learning_sessions},${s.code_submissions}`
      )
      .join("\n");
    const header = "Name,Email,Learning Sessions,Code Submissions\n";
    const blob = new Blob([header + csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Student data exported successfully!");
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl">
              <GraduationCap className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                College Admin Dashboard
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Live
                </Badge>
              </h1>
              <p className="text-zinc-400 text-sm">
                Monitor and manage student progress in real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnouncementModal(true)}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              <Bell className="w-4 h-4 mr-2" />
              Announce
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Real-time Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-300">Online Now</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.onlineNow}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-300">Live tracking</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300">Today Active</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.todayActive}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-300">
                <TrendingUp className="w-3 h-3" />
                <span>+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-300">Avg. Score</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.avgScore}%
                  </p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <Progress
                value={stats.avgScore}
                className="h-1 mt-3 bg-purple-900"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-300">Weekly Growth</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.weeklyGrowth}%
                  </p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-orange-300">
                {parseFloat(realtimeStats.weeklyGrowth) > 0 ? (
                  <>
                    <ArrowUpRight className="w-3 h-3" /> Growing
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3 h-3" /> Declining
                  </>
                )}
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
              <CheckCircle2 className="w-6 h-6 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-zinc-400">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
              <p className="text-xs text-zinc-400">Inactive</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.totalSessions}
              </p>
              <p className="text-xs text-zinc-400">Sessions</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Code className="w-6 h-6 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.totalSubmissions}
              </p>
              <p className="text-xs text-zinc-400">Submissions</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
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
          </TabsList>

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
                      color: "text-green-400",
                    },
                    {
                      user: "John Doe",
                      action: "submitted code for Algorithm Challenge",
                      time: "5 mins ago",
                      icon: Code,
                      color: "text-blue-400",
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
                      color: "text-purple-400",
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
                      className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
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
                        <p className="text-xs text-zinc-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
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
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx === 0
                              ? "bg-yellow-500/20 text-yellow-400"
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
            {/* Search and Filters */}
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
                <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
            </div>

            {/* Students List */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Progress ({filteredStudents.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
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
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700"
                        onClick={() => {
                          setSelectedStudent(student);
                          fetchStudentDetails(student.id);
                          setShowStudentModal(true);
                        }}
                      >
                        <div className="flex items-center gap-4 mb-3 md:mb-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {student.name}
                              </h3>
                              <Badge className={getStatusColor(student.status)}>
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
                            <p className="text-xs text-zinc-500">Submissions</p>
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
                            <p className="text-xs text-zinc-500">Last active</p>
                            <p className="text-sm text-zinc-400">
                              {student.last_active}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                      color: "bg-green-500",
                    },
                    {
                      label: "Good (70-89)",
                      min: 70,
                      max: 89,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Average (50-69)",
                      min: 50,
                      max: 69,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Needs Improvement (<50)",
                      min: 0,
                      max: 49,
                      color: "bg-red-500",
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
                    Weekly Activity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, idx) => {
                        const height = Math.random() * 100 + 20;
                        return (
                          <div
                            key={day}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-full bg-gradient-to-t from-white/20 to-white/60 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-xs text-zinc-500">{day}</span>
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
                    Announcements
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAnnouncementModal(true)}
                    className="bg-white text-black hover:bg-zinc-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
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
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : announcement.priority === "medium"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
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
                  <h2 className="text-xl font-bold">{selectedStudent?.name}</h2>
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
                    <BookOpen className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {selectedStudent.learning_sessions}
                    </p>
                    <p className="text-xs text-zinc-500">Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Code className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {selectedStudent.code_submissions}
                    </p>
                    <p className="text-xs text-zinc-500">Submissions</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Target className="w-5 h-5 mx-auto text-green-400 mb-1" />
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

                <div className="flex gap-2">
                  <Button className="flex-1 bg-white text-black hover:bg-zinc-200">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Report
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
  );
};

export default CollegeAdmin;
