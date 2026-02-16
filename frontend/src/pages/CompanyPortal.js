import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
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
  Check,
  AlertTriangle,
  Info,
  UserCheck,
  UserX,
  CalendarDays,
  Clock3,
  MessageCircle,
  Paperclip,
  Save,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import { useI18n } from "../i18n/I18nProvider";

const CompanyPortal = () => {
  const { t } = useI18n();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
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

  // Advanced Features State
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState([]);
  const [interviewSlots, setInterviewSlots] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [jobBoardIntegrations, setJobBoardIntegrations] = useState([]);
  const [bulkActions, setBulkActions] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    experience: "all",
    location: "all",
    salary: "all",
    remote: "all",
  });
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [bulkMessageData, setBulkMessageData] = useState({
    subject: "",
    message: "",
    type: "email", // email, sms, or both
  });

  // Test creation state
  const [newTest, setNewTest] = useState({
    title: "",
    duration: "60",
    difficulty: "medium",
    skills: [],
    questions: 10,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Simulate real-time activity feed for Company
    const activities = [
      "New candidate applied: Alex Chen",
      "Assessment completed: Java Backend Test",
      "Interview scheduled: Frontend Developer Role",
      "Candidate shortlisted: Emily Davis",
      "New message received from candidate",
    ];

    const interval = setInterval(() => {
      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)];
      const timestamp = new Date().toLocaleTimeString();
      setRecentActivities((prev) => [
        { id: Date.now(), text: randomActivity, time: timestamp },
        ...prev.slice(0, 4),
      ]);

      // Simulate live stat updates
      setRealtimeStats(prev => ({
        ...prev,
        newApplications: prev.newApplications + (Math.random() > 0.7 ? 1 : 0),
      }));

    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

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
      const response = await axiosInstance.get("/company/candidates");
      const candidateList = Array.isArray(response.data) ? response.data : [];
      const transformedCandidates = candidateList.map((candidate, index) => ({
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
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error(
          "Failed to load candidates. Please check your permissions."
        );
      } else {
        toast.error("Failed to load candidates. Please try again.");
      }
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
        notes: isShortlisted
          ? t("companyPortal.removedFromShortlist", "Removed from shortlist")
          : t("companyPortal.addedToShortlist", "Added to shortlist"),
      });

      if (isShortlisted) {
        setShortlistedCandidates(
          shortlistedCandidates.filter((id) => id !== candidateId)
        );
        toast.success(
          t("companyPortal.removedFromShortlist", "Removed from shortlist")
        );
      } else {
        setShortlistedCandidates([...shortlistedCandidates, candidateId]);
        toast.success(
          t("companyPortal.addedToShortlist", "Added to shortlist")
        );
      }
      fetchCandidates();
    } catch (error) {
      toast.error(
        t("companyPortal.failedToUpdateShortlist", "Failed to update shortlist")
      );
    }
  };

  const rejectCandidate = async (candidateId, reason = "") => {
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: "reject",
        notes:
          reason ||
          t(
            "companyPortal.notFitForRequirements",
            "Not a fit for current requirements"
          ),
      });
      toast.success(t("companyPortal.candidateRejected", "Candidate rejected"));
      fetchCandidates();
    } catch (error) {
      toast.error(
        t("companyPortal.failedToRejectCandidate", "Failed to reject candidate")
      );
    }
  };

  const hireCandidate = async (candidateId) => {
    try {
      await axiosInstance.post(`/company/candidates/${candidateId}/action`, {
        action: "hire",
        notes: t("companyPortal.candidateHired", "Candidate hired"),
      });
      toast.success(
        t(
          "companyPortal.offerExtended",
          "Congratulations! Offer extended to candidate"
        )
      );
      fetchCandidates();
    } catch (error) {
      toast.error(
        t("companyPortal.failedToProcessHiring", "Failed to process hiring")
      );
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
      shortlisted:
        "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)]",
      interview_scheduled:
        "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)]",
      under_review:
        "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)]",
      rejected:
        "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)]",
      offer_sent:
        "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)]",
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
    if (score >= 85) return "text-[var(--accent-color)]";
    if (score >= 70) return "text-[var(--accent-color)]";
    return "text-[var(--accent-color)]";
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

  // Advanced Features Functions
  const performAIMatching = async (jobId) => {
    try {
      const response = await axiosInstance.post(`/company/ai-match/${jobId}`);
      toast.success("AI matching completed");
      return response.data;
    } catch (error) {
      toast.error("AI matching failed");
    }
  };

  const scheduleInterview = async (candidateId, slot) => {
    try {
      await axiosInstance.post(`/company/interviews`, {
        candidate_id: candidateId,
        slot: slot,
      });
      toast.success("Interview scheduled successfully");
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to schedule interview");
    }
  };

  const analyzeSkillGap = async (candidateId) => {
    try {
      const response = await axiosInstance.get(
        `/company/skill-gap/${candidateId}`
      );
      setSkillGapAnalysis(response.data);
      return response.data;
    } catch (error) {
      toast.error("Failed to analyze skill gap");
    }
  };

  const sendBulkEmail = async (candidates, template) => {
    try {
      await axiosInstance.post(`/company/bulk-email`, {
        candidate_ids: candidates,
        template: template,
      });
      toast.success(`Email sent to ${candidates.length} candidates`);
    } catch (error) {
      toast.error("Failed to send bulk email");
    }
  };

  const exportCandidateData = (format = "csv") => {
    const data = filteredCandidates.map((candidate) => ({
      name: candidate.name,
      email: candidate.email,
      skills: candidate.skills?.join(", "),
      experience: candidate.experience,
      status: candidate.status,
      resume_score: candidate.resume_score,
      avg_code_score: candidate.avg_code_score,
    }));

    if (format === "csv") {
      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map((row) => Object.values(row).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidates.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidates.json";
      a.click();
      window.URL.revokeObjectURL(url);
    }

    toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
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

  const exportCandidates = () => {
    const dataToExport = filteredCandidates.map((candidate) => ({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      applied_for: candidate.applied_for,
      status: candidate.status,
      skills: candidate.skills.join(", "),
      experience: candidate.experience,
      college: candidate.college,
      location: candidate.location,
      applied_date: candidate.applied_date,
      resume_score: candidate.resume_score || 0,
      avg_code_score: candidate.avg_code_score || 0,
      interview_score: candidate.interview_score || null,
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Candidates exported as CSV successfully!");
  };

  const handleBulkShortlist = async () => {
    try {
      await Promise.all(
        selectedCandidates.map((id) => updateCandidateStatus(id, "shortlisted"))
      );
      toast.success(`${selectedCandidates.length} candidates shortlisted!`);
      setSelectedCandidates([]);
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to shortlist candidates");
    }
  };

  const handleBulkMessage = async () => {
    if (selectedCandidates.length === 0) {
      toast.error("Please select candidates to message");
      return;
    }
    setShowBulkMessageModal(true);
  };

  const sendBulkMessage = async () => {
    if (!bulkMessageData.subject || !bulkMessageData.message) {
      toast.error("Please fill in both subject and message");
      return;
    }

    try {
      await axiosInstance.post("/company/bulk-message", {
        candidate_ids: selectedCandidates,
        subject: bulkMessageData.subject,
        message: bulkMessageData.message,
        type: bulkMessageData.type,
      });

      toast.success(`Message sent to ${selectedCandidates.length} candidates!`);
      setShowBulkMessageModal(false);
      setBulkMessageData({ subject: "", message: "", type: "email" });
      setSelectedCandidates([]);
    } catch (error) {
      toast.error("Failed to send bulk message");
    }
  };

  const handleBulkReject = async () => {
    if (!window.confirm(`Reject ${selectedCandidates.length} candidates?`))
      return;
    try {
      await Promise.all(
        selectedCandidates.map((id) => updateCandidateStatus(id, "rejected"))
      );
      toast.success(`${selectedCandidates.length} candidates rejected!`);
      setSelectedCandidates([]);
      fetchCandidates();
    } catch (error) {
      toast.error("Failed to reject candidates");
    }
  };

  const updateCandidateStatus = async (candidateId, status) => {
    try {
      await axiosInstance.put(`/company/candidates/${candidateId}/status`, {
        status,
      });
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      throw error;
    }
  };

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 rounded-xl border border-zinc-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.9)] rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Advanced Hiring Portal
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                AI-powered talent acquisition with intelligent matching
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)] text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enabled
                </Badge>
                <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)] text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Smart Analytics
                </Badge>
              </div>
            </div>
          </div>

          {/* Live Activity Ticker */}
          <div className="hidden lg:flex flex-col items-end justify-center px-6 border-r border-zinc-700/50 flex-1 mx-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                Live Activity
              </span>
            </div>
            <div className="h-6 overflow-hidden relative w-full max-w-md text-right">
              {recentActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className={`text-xs text-zinc-300 transition-all duration-500 absolute right-0 w-full truncate ${idx === 0
                    ? "top-0 opacity-100 translate-y-0"
                    : "top-6 opacity-0 translate-y-4"
                    }`}
                >
                  <span className="text-zinc-500 mr-2">{activity.time}</span>
                  {activity.text}
                </div>
              ))}
              {recentActivities.length === 0 && (
                <span className="text-xs text-zinc-500">
                  Monitoring events...
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowAnalyticsDashboard(true)}
              className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              size="sm"
              onClick={() => setShowInterviewScheduler(true)}
              className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              size="sm"
              onClick={() => setShowBulkActionModal(true)}
              className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white transition-colors"
              disabled={selectedCandidates.length === 0}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Bulk Actions ({selectedCandidates.length})
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateTestModal(true)}
              className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCandidates()}
                className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
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

        {/* Advanced Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--accent-color)] text-sm font-medium mb-1">
                    New Applications
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {realtimeStats.newApplications}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[var(--accent-color)]" />
                    <span className="text-xs text-[var(--accent-color)]">
                      +12% this week
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[rgba(var(--accent-rgb),0.2)] rounded-xl">
                  <UserPlus className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--accent-color)] text-sm font-medium mb-1">
                    Tests Completed
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {realtimeStats.testsCompleted}
                  </p>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--accent-color)]" />
                    <span className="text-xs text-[var(--accent-color)]">
                      85% pass rate
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[rgba(var(--accent-rgb),0.2)] rounded-xl">
                  <Brain className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--accent-color)] text-sm font-medium mb-1">
                    Interviews Scheduled
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {realtimeStats.interviewsScheduled}
                  </p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--accent-color)]" />
                    <span className="text-xs text-[var(--accent-color)]">
                      Next: Today 2PM
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[rgba(var(--accent-rgb),0.2)] rounded-xl">
                  <Video className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)] hover:border-[rgba(var(--accent-rgb),0.4)] transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--accent-color)] text-sm font-medium mb-1">
                    AI Match Score
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">94%</p>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--accent-color)]" />
                    <span className="text-xs text-[var(--accent-color)]">
                      Top 5% matches
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[rgba(var(--accent-rgb),0.2)] rounded-xl">
                  <Target className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
              </div>
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
              <Star className="w-6 h-6 mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.shortlisted}
              </p>
              <p className="text-xs text-zinc-400">Shortlisted</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Video className="w-6 h-6 mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.interviewing}
              </p>
              <p className="text-xs text-zinc-400">Interviewing</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Send className="w-6 h-6 mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.offered}</p>
              <p className="text-xs text-zinc-400">Offers Sent</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.avgResumeScore}%
              </p>
              <p className="text-xs text-zinc-400">Avg Resume</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Code className="w-6 h-6 mx-auto text-[var(--accent-color)] mb-2" />
              <p className="text-2xl font-bold text-white">
                {stats.avgCodeScore}%
              </p>
              <p className="text-xs text-zinc-400">Avg Code</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger
              value="candidates"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <Users className="w-4 h-4 mr-1" />
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="assessments"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <ClipboardList className="w-4 h-4 mr-1" />
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="interviews"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <Video className="w-4 h-4 mr-1" />
              Interviews
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <Mail className="w-4 h-4 mr-1" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <Briefcase className="w-4 h-4 mr-1" />
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-xs"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-insights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--accent-color)]" />
                    AI-Powered Matching
                  </CardTitle>
                  <CardDescription>
                    Intelligent candidate-job matching based on skills,
                    experience, and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Top Match Rate
                      </p>
                      <p className="text-2xl font-bold text-[var(--accent-color)]">
                        94%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-[var(--accent-color)]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Skills Analysis
                      </p>
                      <p className="text-lg font-semibold text-[var(--accent-color)]">
                        AI Processed
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-[var(--accent-color)]" />
                  </div>
                  <Button
                    className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)]"
                    onClick={() => performAIMatching(1)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Matching
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--accent-color)]" />
                    Skill Gap Analysis
                  </CardTitle>
                  <CardDescription>
                    Identify skill gaps and recommend training programs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillGapAnalysis.length > 0 ? (
                    skillGapAnalysis.map((gap, idx) => (
                      <div key={idx} className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white">
                            {gap.skill}
                          </span>
                          <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                            {gap.gap}% gap
                          </Badge>
                        </div>
                        <Progress value={100 - gap.gap} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400">
                        Run analysis to identify skill gaps
                      </p>
                      <Button
                        className="mt-4 bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)]"
                        onClick={() => analyzeSkillGap(selectedCandidates[0])}
                        disabled={selectedCandidates.length === 0}
                      >
                        Analyze Skills
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="mt-6">
            {/* Advanced Search and Filters */}
            <div className="bg-zinc-900/50 rounded-xl p-6 mb-6 border border-zinc-800">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search candidates by name, email, skills, or experience..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={filterSkill} onValueChange={setFilterSkill}>
                    <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Skills</SelectItem>
                      {allSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interview_scheduled">
                        Interview
                      </SelectItem>
                      <SelectItem value="offer_sent">Offer Sent</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={advancedFilters.experience}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        experience: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={advancedFilters.location}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        location: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="score">AI Match Score</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="resume">Resume Score</SelectItem>
                      <SelectItem value="code">Code Score</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{filteredCandidates.length} candidates found</span>
                  {aiMatchingEnabled && (
                    <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Matching Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiMatchingEnabled(!aiMatchingEnabled)}
                    className={`border-zinc-700 ${aiMatchingEnabled
                      ? "bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb),0.5)]"
                      : ""
                      }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiMatchingEnabled ? "AI On" : "AI Off"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedCandidates.length ===
                        filteredCandidates.length &&
                        filteredCandidates.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates(
                            filteredCandidates.map((c) => c.id)
                          );
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                      className="w-4 h-4 text-[var(--accent-color)] bg-zinc-800 border-zinc-600 rounded focus:ring-[rgba(var(--accent-rgb),0.3)] mr-2"
                    />
                    <Users className="w-5 h-5" />
                    Job Seekers ({filteredCandidates.length})
                    {selectedCandidates.length > 0 && (
                      <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border-[rgba(var(--accent-rgb),0.3)] ml-2">
                        {selectedCandidates.length} selected
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {selectedCandidates.length > 0 && (
                      <div className="flex gap-2 mr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkShortlist()}
                          className="border-[rgba(var(--accent-rgb),0.6)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.15)]"
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          Shortlist ({selectedCandidates.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkMessage()}
                          className="border-[rgba(var(--accent-rgb),0.6)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.15)]"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkReject()}
                          className="border-[rgba(var(--accent-rgb),0.6)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.15)]"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportCandidates()}
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
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
                        onClick={(e) => {
                          // Don't open modal if clicking checkbox
                          if (e.target.type !== "checkbox") {
                            setSelectedCandidate(candidate);
                            setShowCandidateModal(true);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4 mb-3 md:mb-0">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedCandidates([
                                  ...selectedCandidates,
                                  candidate.id,
                                ]);
                              } else {
                                setSelectedCandidates(
                                  selectedCandidates.filter(
                                    (id) => id !== candidate.id
                                  )
                                );
                              }
                            }}
                            className="w-4 h-4 text-[var(--accent-color)] bg-zinc-800 border-zinc-600 rounded focus:ring-[rgba(var(--accent-rgb),0.3)]"
                          />
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                              {candidate.name.charAt(0)}
                            </div>
                            {shortlistedCandidates.includes(candidate.id) && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(var(--accent-rgb))] rounded-full flex items-center justify-center">
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
                            className="text-zinc-400 hover:text-[var(--accent-color)]"
                          >
                            {shortlistedCandidates.includes(candidate.id) ? (
                              <BookmarkCheck className="w-5 h-5 text-[var(--accent-color)]" />
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

          <TabsContent value="campaigns" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[var(--accent-color)]" />
                    Email Campaigns
                  </CardTitle>
                  <CardDescription>
                    Automated email campaigns for candidate engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        name: "Welcome Series",
                        sent: 45,
                        opened: 78,
                        status: "active",
                      },
                      {
                        name: "Interview Follow-up",
                        sent: 23,
                        opened: 65,
                        status: "active",
                      },
                      {
                        name: "Offer Acceptance",
                        sent: 8,
                        opened: 90,
                        status: "draft",
                      },
                    ].map((campaign, idx) => (
                      <div key={idx} className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white">
                            {campaign.name}
                          </span>
                          <Badge
                            className={
                              campaign.status === "active"
                                ? "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]"
                                : "bg-zinc-500/20 text-zinc-400"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>{campaign.sent} sent</span>
                          <span>{campaign.opened}% opened</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-[var(--accent-color)]" />
                    Bulk Messaging
                  </CardTitle>
                  <CardDescription>
                    Send personalized messages to multiple candidates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400 mb-2">
                        Selected Candidates
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {selectedCandidates.length}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400 mb-2">
                        Available Templates
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                          Interview Invite
                        </Badge>
                        <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                          Offer Letter
                        </Badge>
                        <Badge className="bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                          Feedback Request
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)]"
                    onClick={() =>
                      sendBulkEmail(selectedCandidates, "interview_invite")
                    }
                    disabled={selectedCandidates.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Bulk Message
                  </Button>
                </CardContent>
              </Card>
            </div>
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
                            ? "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]"
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
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
                                ? "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]"
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
                          <span className="text-[var(--accent-color)] font-medium">
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
                      color: "bg-[rgb(var(--accent-rgb))]",
                    },
                    {
                      label: "Under Review",
                      count: candidates.filter(
                        (c) => c.status === "under_review"
                      ).length,
                      color: "bg-[rgb(var(--accent-rgb))]",
                    },
                    {
                      label: "Shortlisted",
                      count: candidates.filter(
                        (c) => c.status === "shortlisted"
                      ).length,
                      color: "bg-[rgb(var(--accent-rgb))]",
                    },
                    {
                      label: "Interview",
                      count: candidates.filter(
                        (c) => c.status === "interview_scheduled"
                      ).length,
                      color: "bg-[rgb(var(--accent-rgb))]",
                    },
                    {
                      label: "Offer Sent",
                      count: candidates.filter((c) => c.status === "offer_sent")
                        .length,
                      color: "bg-[rgb(var(--accent-rgb))]",
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

          <TabsContent value="interviews" className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Interview Management
                </h2>
                <p className="text-zinc-400 text-sm">
                  Schedule and manage candidate interviews
                </p>
              </div>
              <Button className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates
                .filter(
                  (c) =>
                    c.status === "interview_scheduled" ||
                    c.status === "shortlisted"
                )
                .map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-white to-zinc-300 rounded-lg flex items-center justify-center text-black font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {candidate.applied_for}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-400">
                            Interview:{" "}
                            {candidate.interview_date || "Not scheduled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-400">
                            Type: {candidate.interview_type || "Video Call"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Reports & Insights
                </h2>
                <p className="text-zinc-400 text-sm">
                  Generate detailed reports and analytics
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Hiring Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--accent-color)]">
                        {candidates.length}
                      </div>
                      <div className="text-sm text-zinc-400">
                        Total Applications
                      </div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--accent-color)]">
                        {
                          candidates.filter((c) => c.status === "shortlisted")
                            .length
                        }
                      </div>
                      <div className="text-sm text-zinc-400">Shortlisted</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--accent-color)]">
                        {
                          candidates.filter(
                            (c) => c.status === "interview_scheduled"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-zinc-400">Interviews</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-[var(--accent-color)]">
                        {
                          candidates.filter((c) => c.status === "offer_sent")
                            .length
                        }
                      </div>
                      <div className="text-sm text-zinc-400">Offers Sent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Time to Hire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-zinc-400">Average Time</span>
                      <span className="text-white font-semibold">18 days</span>
                    </div>
                    <Progress value={75} className="h-2 bg-zinc-800" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="text-zinc-400">Fastest</div>
                        <div className="text-[var(--accent-color)] font-semibold">
                          5 days
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Median</div>
                        <div className="text-[var(--accent-color)] font-semibold">
                          15 days
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Slowest</div>
                        <div className="text-[var(--accent-color)] font-semibold">
                          45 days
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: "New candidate applied",
                        candidate: "Sarah Johnson",
                        time: "2 hours ago",
                        type: "application",
                      },
                      {
                        action: "Interview scheduled",
                        candidate: "Mike Chen",
                        time: "4 hours ago",
                        type: "interview",
                      },
                      {
                        action: "Assessment completed",
                        candidate: "Emma Davis",
                        time: "6 hours ago",
                        type: "assessment",
                      },
                      {
                        action: "Offer sent",
                        candidate: "Alex Rodriguez",
                        time: "1 day ago",
                        type: "offer",
                      },
                      {
                        action: "Candidate rejected",
                        candidate: "John Smith",
                        time: "2 days ago",
                        type: "rejection",
                      },
                    ].map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                      >
                        <div className="p-2 rounded-lg bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)]">
                          {activity.type === "application" ? (
                            <UserPlus className="w-4 h-4" />
                          ) : activity.type === "interview" ? (
                            <Video className="w-4 h-4" />
                          ) : activity.type === "assessment" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : activity.type === "offer" ? (
                            <Send className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-medium">
                              {activity.candidate}
                            </span>{" "}
                            - {activity.action}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
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
                    <FileText className="w-5 h-5 mx-auto text-[var(--accent-color)] mb-1" />
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
                    <Code className="w-5 h-5 mx-auto text-[var(--accent-color)] mb-1" />
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
                    <Video className="w-5 h-5 mx-auto text-[var(--accent-color)] mb-1" />
                    <p className="text-xl font-bold text-white">
                      {selectedCandidate.interview_score || "-"}
                    </p>
                    <p className="text-xs text-zinc-500">Interview</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-800 rounded-lg">
                    <Briefcase className="w-5 h-5 mx-auto text-[var(--accent-color)] mb-1" />
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
                    className="flex-1 border-[rgba(var(--accent-rgb),0.6)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[rgba(var(--accent-rgb),0.6)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.12)]"
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
                      className={`cursor-pointer ${newTest.skills.includes(skill)
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

        {/* Bulk Message Modal */}
        <Dialog
          open={showBulkMessageModal}
          onOpenChange={setShowBulkMessageModal}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[var(--accent-color)]" />
                Send Bulk Message
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Send a message to {selectedCandidates.length} selected
                candidates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Message Type
                </label>
                <select
                  value={bulkMessageData.type}
                  onChange={(e) =>
                    setBulkMessageData({
                      ...bulkMessageData,
                      type: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Subject
                </label>
                <Input
                  placeholder="Message subject"
                  value={bulkMessageData.subject}
                  onChange={(e) =>
                    setBulkMessageData({
                      ...bulkMessageData,
                      subject: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Message
                </label>
                <Textarea
                  placeholder="Type your message here..."
                  value={bulkMessageData.message}
                  onChange={(e) =>
                    setBulkMessageData({
                      ...bulkMessageData,
                      message: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowBulkMessageModal(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={sendBulkMessage}
                className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analytics Dashboard Modal */}
        <Dialog
          open={showAnalyticsDashboard}
          onOpenChange={setShowAnalyticsDashboard}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--accent-color)]" />
                Advanced Analytics Dashboard
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Comprehensive insights into your recruitment pipeline and
                candidate performance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--accent-color)] text-sm font-medium">
                          Total Candidates
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {candidates.length}
                        </p>
                      </div>
                      <UserPlus className="w-6 h-6 text-[var(--accent-color)]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--accent-color)] text-sm font-medium">
                          Shortlisted
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {shortlistedCandidates.length}
                        </p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-[var(--accent-color)]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--accent-color)] text-sm font-medium">
                          Interviews
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {realtimeStats.interviewsScheduled}
                        </p>
                      </div>
                      <Video className="w-6 h-6 text-[var(--accent-color)]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[rgba(var(--accent-rgb),0.1)] to-[rgba(var(--accent-rgb),0.05)] border-[rgba(var(--accent-rgb),0.2)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--accent-color)] text-sm font-medium">
                          Avg Score
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {candidates.length > 0
                            ? Math.round(
                              candidates.reduce(
                                (acc, c) => acc + (c.score || 0),
                                0
                              ) / candidates.length
                            )
                            : 0}
                          %
                        </p>
                      </div>
                      <Trophy className="w-6 h-6 text-[var(--accent-color)]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Application Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">This Week</span>
                        <span className="text-white font-semibold">
                          +{realtimeStats.newApplications}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">This Month</span>
                        <span className="text-white font-semibold">
                          +{realtimeStats.newApplications * 4}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Conversion Rate</span>
                        <span className="text-[var(--accent-color)] font-semibold">
                          {candidates.length > 0
                            ? Math.round(
                              (shortlistedCandidates.length /
                                candidates.length) *
                              100
                            )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Skill Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["JavaScript", "Python", "React", "Node.js", "SQL"].map(
                        (skill) => {
                          const count = candidates.filter(
                            (c) =>
                              c.skills &&
                              c.skills.some((s) =>
                                s.toLowerCase().includes(skill.toLowerCase())
                              )
                          ).length;
                          const percentage =
                            candidates.length > 0
                              ? Math.round((count / candidates.length) * 100)
                              : 0;
                          return (
                            <div
                              key={skill}
                              className="flex items-center justify-between"
                            >
                              <span className="text-zinc-300">{skill}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={percentage} className="w-20" />
                                <span className="text-white text-sm w-8">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--accent-color)]">
                        {candidates.filter((c) => (c.score || 0) >= 80).length}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        High Performers (80%+)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--accent-color)]">
                        {
                          candidates.filter(
                            (c) => (c.score || 0) >= 60 && (c.score || 0) < 80
                          ).length
                        }
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Medium Performers (60-79%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--accent-color)]">
                        {candidates.filter((c) => (c.score || 0) < 60).length}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Need Improvement (&lt;60%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="mt-6">
              <Button
                onClick={() => setShowAnalyticsDashboard(false)}
                className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white"
              >
                Close Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Interview Scheduler Modal */}
        <Dialog
          open={showInterviewScheduler}
          onOpenChange={setShowInterviewScheduler}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                Schedule Interview
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Schedule an interview with selected candidates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Interview Type
                </label>
                <select className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="technical">Technical Interview</option>
                  <option value="hr">HR Interview</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Date & Time
                </label>
                <Input
                  type="datetime-local"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="60"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Interviewer
                </label>
                <Input
                  placeholder="Interviewer name"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Notes
                </label>
                <Textarea
                  placeholder="Additional notes or requirements..."
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowInterviewScheduler(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Interview scheduled successfully!");
                  setShowInterviewScheduler(false);
                }}
                className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Action Modal */}
        <Dialog
          open={showBulkActionModal}
          onOpenChange={setShowBulkActionModal}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--accent-color)]" />
                Bulk Actions
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Perform bulk actions on {selectedCandidates.length} selected
                candidates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <Button
                onClick={handleBulkShortlist}
                className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white justify-start"
                disabled={selectedCandidates.length === 0}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Shortlist Candidates ({selectedCandidates.length})
              </Button>
              <Button
                onClick={handleBulkMessage}
                className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white justify-start"
                disabled={selectedCandidates.length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Message ({selectedCandidates.length})
              </Button>
              <Button
                onClick={handleBulkReject}
                className="w-full bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.9)] text-white justify-start"
                disabled={selectedCandidates.length === 0}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject Candidates ({selectedCandidates.length})
              </Button>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowBulkActionModal(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CompanyPortal;
