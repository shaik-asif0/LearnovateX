import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
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
  Building2,
  Users,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Award,
  Code,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  Sparkles,
  Target,
  Zap,
  Trophy,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  Settings,
  UserPlus,
  Send,
  MessageSquare,
  Activity,
  Brain,
  Briefcase,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  Video,
  Play,
  ClipboardList,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  PieChart,
  Flame,
  Link,
  Share2,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const CompanyPortal = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");
  const [refreshing, setRefreshing] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({
    newApplications: 0,
    testsCompleted: 0,
    interviewsScheduled: 0,
  });

  // Test creation state
  const [newTest, setNewTest] = useState({
    title: "",
    duration: "60",
    difficulty: "medium",
    skills: [],
    questions: 10,
  });

  useEffect(() => {
    fetchCandidates();
    fetchAssessments();
    fetchJobPostings();
    fetchAnalytics();

    // Refresh analytics periodically
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get("/company/analytics");
      setRealtimeStats({
        newApplications: response.data.total_candidates || 0,
        testsCompleted: response.data.total_assessments || 0,
        interviewsScheduled: response.data.interviews_scheduled || 0,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axiosInstance.get("/company/candidates/status");
      const transformedCandidates = response.data.map((candidate, index) => ({
        ...candidate,
        skills: ["Python", "React", "Node.js", "Java", "AWS"][index % 5].split(
          ", "
        ),
        experience: `${Math.floor(Math.random() * 5) + 1} years`,
        applied_for: [
          "Full Stack Developer",
          "Backend Developer",
          "Frontend Developer",
          "ML Engineer",
        ][index % 4],
        applied_date: `${Math.floor(Math.random() * 7) + 1} days ago`,
        college: ["MIT", "Stanford", "Berkeley", "Harvard"][index % 4],
        interview_score:
          candidate.status === "shortlist"
            ? Math.floor(Math.random() * 20) + 80
            : null,
        location: ["San Francisco", "New York", "Austin", "Seattle"][index % 4],
        phone: "+1 234 567 890",
      }));
      setCandidates(transformedCandidates);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      toast.error("Failed to load candidates. Please check your permissions.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await axiosInstance.get("/company/assessments");
      const transformedAssessments = response.data.map((a) => ({
        id: a.id,
        title: a.title,
        duration: `${a.duration} mins`,
        difficulty: a.type || "medium",
        candidates: a.assigned_count || 0,
        completed: a.completed_count || 0,
        avgScore: a.avg_score || 0,
        status: a.status || "active",
        skills: a.questions?.map((q) => q.skill).filter(Boolean) || ["General"],
      }));
      setAssessments(transformedAssessments);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      setAssessments([]);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const response = await axiosInstance.get("/company/jobs");
      const transformedJobs = response.data.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        applicants: job.applications || 0,
        status: job.status,
        posted: new Date(job.created_at).toLocaleDateString(),
        salary:
          job.salary_min && job.salary_max
            ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
            : "Competitive",
      }));
      setJobPostings(transformedJobs);
    } catch (error) {
      console.error("Failed to fetch job postings:", error);
      setJobPostings([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCandidates();
    await fetchAssessments();
    await fetchJobPostings();
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  const toggleShortlist = async (candidateId) => {
    const isShortlisted = shortlistedCandidates.includes(candidateId);
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: isShortlisted ? "remove_shortlist" : "shortlist",
        notes: isShortlisted ? "Removed from shortlist" : "Added to shortlist",
      });

      if (isShortlisted) {
        setShortlistedCandidates(
          shortlistedCandidates.filter((id) => id !== candidateId)
        );
        toast.success("Removed from shortlist");
      } else {
        setShortlistedCandidates([...shortlistedCandidates, candidateId]);
        toast.success("Added to shortlist");
      }
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to update shortlist");
    }
  };

  const rejectCandidate = async (candidateId, reason = "") => {
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: "reject",
        notes: reason || "Not a fit for current requirements",
      });
      toast.success("Candidate rejected");
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to reject candidate");
    }
  };

  const scheduleInterview = async (
    candidateId,
    interviewDate,
    interviewType
  ) => {
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: "schedule_interview",
        interview_date: interviewDate,
        interview_type: interviewType,
        notes: `Interview scheduled for ${interviewDate}`,
      });
      toast.success("Interview scheduled successfully!");
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to schedule interview");
    }
  };

  const hireCandidate = async (candidateId) => {
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: "hire",
        notes: "Candidate hired",
      });
      toast.success("Congratulations! Offer extended to candidate");
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to process hiring");
    }
  };

  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesSkill =
        filterSkill === "all" || candidate.skills.includes(filterSkill);
      const matchesStatus =
        filterStatus === "all" || candidate.status === filterStatus;
      return matchesSearch && matchesSkill && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score")
        return (
          b.resume_score +
          b.avg_code_score -
          (a.resume_score + a.avg_code_score)
        );
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "resume") return b.resume_score - a.resume_score;
      if (sortBy === "code") return b.avg_code_score - a.avg_code_score;
      return 0;
    });

  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter((c) => c.status === "shortlisted").length,
    interviewing: candidates.filter((c) => c.status === "interview_scheduled")
      .length,
    offered: candidates.filter((c) => c.status === "offer_sent").length,
    avgResumeScore:
      candidates.length > 0
        ? Math.round(
            candidates.reduce((acc, c) => acc + c.resume_score, 0) /
              candidates.length
          )
        : 0,
    avgCodeScore:
      candidates.length > 0
        ? Math.round(
            candidates.reduce((acc, c) => acc + c.avg_code_score, 0) /
              candidates.length
          )
        : 0,
  };

  const getStatusColor = (status) => {
    const colors = {
      shortlisted: "bg-green-500/20 text-green-400 border-green-500/30",
      interview_scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      offer_sent: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  const getStatusLabel = (status) => {
    const labels = {
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      under_review: "Under Review",
      rejected: "Rejected",
      offer_sent: "Offer Sent",
    };
    return labels[status] || status;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const createTest = async () => {
    if (!newTest.title) {
      toast.error("Please enter a test title");
      return;
    }
    try {
      await axiosInstance.post("/company/assessments", {
        title: newTest.title,
        type: newTest.difficulty,
        questions: newTest.skills.map((skill) => ({ skill, type: "coding" })),
        duration: parseInt(newTest.duration),
        passing_score: 70,
      });
      toast.success("Assessment created successfully!");
      setShowCreateTestModal(false);
      setNewTest({
        title: "",
        duration: "60",
        difficulty: "medium",
        skills: [],
        questions: 10,
      });
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to create assessment");
    }
  };

  const deleteAssessment = async (assessmentId) => {
    try {
      await axiosInstance.delete(`/company/assessments/${assessmentId}`);
      toast.success("Assessment deleted");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  // Job posting state
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: [],
  });

  const createJobPosting = async () => {
    if (!newJob.title || !newJob.department || !newJob.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await axiosInstance.post("/company/jobs", {
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        type: newJob.type,
        salary_min: parseInt(newJob.salary_min) * 1000 || null,
        salary_max: parseInt(newJob.salary_max) * 1000 || null,
        description: newJob.description,
        requirements: newJob.requirements,
      });
      toast.success("Job posting created successfully!");
      setShowCreateJobModal(false);
      setNewJob({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        salary_min: "",
        salary_max: "",
        description: "",
        requirements: [],
      });
      fetchJobPostings();
    } catch (error) {
      toast.error("Failed to create job posting");
    }
  };

  const deleteJobPosting = async (jobId) => {
    try {
      await axiosInstance.delete(`/company/jobs/${jobId}`);
      toast.success("Job posting deleted");
      fetchJobPostings();
    } catch (error) {
      toast.error("Failed to delete job posting");
    }
  };

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl">
              <Building2 className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                Company Hiring Portal
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Live
                </Badge>
              </h1>
              <p className="text-zinc-400 text-sm">
                Find and hire top talent with AI-powered assessments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-testid="create-test-btn"
              size="sm"
              onClick={() => setShowCreateTestModal(true)}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
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
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300">New Applications</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.newApplications}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-blue-300">Today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-300">Tests Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.testsCompleted}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-300">
                <TrendingUp className="w-3 h-3" />
                <span>+23% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-300">Interviews</p>
                  <p className="text-2xl font-bold text-white">
                    {realtimeStats.interviewsScheduled}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-purple-300">
                <Calendar className="w-3 h-3" />
                <span>Scheduled this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-300">Avg. Score</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.avgCodeScore}%
                  </p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <Progress
                value={stats.avgCodeScore}
                className="h-1 mt-3 bg-orange-900"
              />
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-white mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-zinc-400">Total Candidates</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.shortlisted}
              </p>
              <p className="text-xs text-zinc-400">Shortlisted</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Video className="w-6 h-6 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.interviewing}
              </p>
              <p className="text-xs text-zinc-400">Interviewing</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Send className="w-6 h-6 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.offered}</p>
              <p className="text-xs text-zinc-400">Offers Sent</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.avgResumeScore}%
              </p>
              <p className="text-xs text-zinc-400">Avg Resume</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Code className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.avgCodeScore}%
              </p>
              <p className="text-xs text-zinc-400">Avg Code</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger
              value="candidates"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="assessments"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Job Postings
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search candidates by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <Select value={filterSkill} onValueChange={setFilterSkill}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview</SelectItem>
                  <SelectItem value="offer_sent">Offer Sent</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="score">Best Match</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="resume">Resume Score</SelectItem>
                  <SelectItem value="code">Code Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Candidates List */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Job Seekers ({filteredCandidates.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                    <p className="text-zinc-400">No candidates found</p>
                  </div>
                ) : (
                  <div data-testid="candidates-list" className="space-y-3">
                    {filteredCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setShowCandidateModal(true);
                        }}
                      >
                        <div className="flex items-center gap-4 mb-3 md:mb-0">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                              {candidate.name.charAt(0)}
                            </div>
                            {shortlistedCandidates.includes(candidate.id) && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-black fill-black" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white">
                                {candidate.name}
                              </h3>
                              <Badge
                                className={getStatusColor(candidate.status)}
                              >
                                {getStatusLabel(candidate.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-400">
                              {candidate.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-zinc-500">
                                {candidate.applied_for}
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-xs text-zinc-500">
                                {candidate.experience}
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-xs text-zinc-500">
                                {candidate.college}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="border-zinc-700 text-zinc-400 text-xs"
                              >
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p
                                className={`text-lg font-bold ${getScoreColor(
                                  candidate.resume_score
                                )}`}
                              >
                                {candidate.resume_score}
                              </p>
                              <p className="text-xs text-zinc-500">Resume</p>
                            </div>
                            <div className="text-center">
                              <p
                                className={`text-lg font-bold ${getScoreColor(
                                  candidate.avg_code_score
                                )}`}
                              >
                                {candidate.avg_code_score}
                              </p>
                              <p className="text-xs text-zinc-500">Code</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShortlist(candidate.id);
                            }}
                            className="text-zinc-400 hover:text-yellow-400"
                          >
                            {shortlistedCandidates.includes(candidate.id) ? (
                              <BookmarkCheck className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </Button>
                          <ChevronRight className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          {assessment.duration} • {assessment.difficulty}
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          assessment.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        }
                      >
                        {assessment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {assessment.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <p className="text-lg font-bold text-white">
                          {assessment.candidates}
                        </p>
                        <p className="text-xs text-zinc-500">Invited</p>
                      </div>
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <p className="text-lg font-bold text-white">
                          {assessment.completed}
                        </p>
                        <p className="text-xs text-zinc-500">Completed</p>
                      </div>
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <p
                          className={`text-lg font-bold ${getScoreColor(
                            assessment.avgScore
                          )}`}
                        >
                          {assessment.avgScore}%
                        </p>
                        <p className="text-xs text-zinc-500">Avg Score</p>
                      </div>
                    </div>
                    <Progress
                      value={
                        (assessment.completed / assessment.candidates) * 100
                      }
                      className="h-2 bg-zinc-800"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Assessment Card */}
              <Card
                className="bg-zinc-900/50 border-zinc-800 border-dashed hover:border-zinc-600 transition-colors cursor-pointer flex items-center justify-center min-h-[280px]"
                onClick={() => setShowCreateTestModal(true)}
              >
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-white font-medium">
                    Create New Assessment
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Design custom coding challenges
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <Card
                  key={job.id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {job.title}
                          </h3>
                          <Badge
                            className={
                              job.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-zinc-500/20 text-zinc-400"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="text-green-400 font-medium">
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">
                            {job.applicants}
                          </p>
                          <p className="text-xs text-zinc-500">Applicants</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-white hover:bg-zinc-800"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Hiring Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Applied",
                      count: candidates.length,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Under Review",
                      count: candidates.filter(
                        (c) => c.status === "under_review"
                      ).length,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Shortlisted",
                      count: candidates.filter(
                        (c) => c.status === "shortlisted"
                      ).length,
                      color: "bg-green-500",
                    },
                    {
                      label: "Interview",
                      count: candidates.filter(
                        (c) => c.status === "interview_scheduled"
                      ).length,
                      color: "bg-purple-500",
                    },
                    {
                      label: "Offer Sent",
                      count: candidates.filter((c) => c.status === "offer_sent")
                        .length,
                      color: "bg-cyan-500",
                    },
                  ].map((stage) => {
                    const percentage =
                      candidates.length > 0
                        ? Math.round((stage.count / candidates.length) * 100)
                        : 0;
                    return (
                      <div key={stage.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">{stage.label}</span>
                          <span className="text-white font-medium">
                            {stage.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${stage.color} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Top Skills in Demand
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allSkills.slice(0, 6).map((skill) => {
                    const count = candidates.filter((c) =>
                      c.skills.includes(skill)
                    ).length;
                    const percentage =
                      candidates.length > 0
                        ? Math.round((count / candidates.length) * 100)
                        : 0;
                    return (
                      <div key={skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">{skill}</span>
                          <span className="text-white font-medium">
                            {count} candidates
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

              <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Application Trends (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => {
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
        </Tabs>

        {/* Candidate Detail Modal */}
        <Dialog open={showCandidateModal} onOpenChange={setShowCandidateModal}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-xl">
                  {selectedCandidate?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCandidate?.name}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {selectedCandidate?.applied_for}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedCandidate.status)}>
                    {getStatusLabel(selectedCandidate.status)}
                  </Badge>
                  <span className="text-sm text-zinc-500">
                    Applied {selectedCandidate.applied_date}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <FileText className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                    <p
                      className={`text-xl font-bold ${getScoreColor(
                        selectedCandidate.resume_score
                      )}`}
                    >
                      {selectedCandidate.resume_score}
                    </p>
                    <p className="text-xs text-zinc-500">Resume Score</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Code className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <p
                      className={`text-xl font-bold ${getScoreColor(
                        selectedCandidate.avg_code_score
                      )}`}
                    >
                      {selectedCandidate.avg_code_score}
                    </p>
                    <p className="text-xs text-zinc-500">Code Score</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Video className="w-5 h-5 mx-auto text-green-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {selectedCandidate.interview_score || "-"}
                    </p>
                    <p className="text-xs text-zinc-500">Interview</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Briefcase className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                    <p className="text-xl font-bold text-white">
                      {selectedCandidate.experience}
                    </p>
                    <p className="text-xs text-zinc-500">Experience</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {selectedCandidate.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {selectedCandidate.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {selectedCandidate.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {selectedCandidate.college}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-white/10 text-white border-white/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-white text-black hover:bg-zinc-200">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-green-700 text-green-400 hover:bg-green-900/30"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-700 text-red-400 hover:bg-red-900/30"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Test Modal */}
        <Dialog
          open={showCreateTestModal}
          onOpenChange={setShowCreateTestModal}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Design a custom coding challenge for candidates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Assessment Title
                </label>
                <Input
                  placeholder="e.g., Full Stack Developer Challenge"
                  value={newTest.title}
                  onChange={(e) =>
                    setNewTest({ ...newTest, title: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">
                    Duration
                  </label>
                  <Select
                    value={newTest.duration}
                    onValueChange={(v) =>
                      setNewTest({ ...newTest, duration: v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">
                    Difficulty
                  </label>
                  <Select
                    value={newTest.difficulty}
                    onValueChange={(v) =>
                      setNewTest({ ...newTest, difficulty: v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Skills to Test
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  {[
                    "Python",
                    "JavaScript",
                    "React",
                    "Node.js",
                    "Java",
                    "SQL",
                    "DSA",
                    "System Design",
                  ].map((skill) => (
                    <Badge
                      key={skill}
                      className={`cursor-pointer ${
                        newTest.skills.includes(skill)
                          ? "bg-white text-black"
                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      }`}
                      onClick={() => {
                        if (newTest.skills.includes(skill)) {
                          setNewTest({
                            ...newTest,
                            skills: newTest.skills.filter((s) => s !== skill),
                          });
                        } else {
                          setNewTest({
                            ...newTest,
                            skills: [...newTest.skills, skill],
                          });
                        }
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={createTest}
                className="w-full bg-white text-black hover:bg-zinc-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CompanyPortal;
