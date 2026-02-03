import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  User,
  Mail,
  Calendar,
  Award,
  Code,
  Trophy,
  Target,
  Edit2,
  Save,
  X,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Link2,
  Github,
  Linkedin,
  Globe,
  Phone,
  Shield,
  Star,
  Flame,
  Zap,
  TrendingUp,
  BookOpen,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  Settings,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Bell,
  Sparkles,
  Heart,
  Share2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Rocket,
  Medal,
  Crown,
  Gem,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { getUser, setUser as saveUser, clearAuth } from "../lib/utils";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const avatarInputRef = useRef(null);

  const getBaseProfileData = (currentUser) => ({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    location: "",
    bio: "",
    title: "",
    company: "",
    university: "",
    graduationYear: "",
    skills: [],
    github: "",
    linkedin: "",
    portfolio: "",

    // Rich profile sections (stored in users.profile_data)
    resume_headline: "",
    profile_summary: "",

    // Resume template header fields
    roll_no: "",
    degree: "",
    branch: "",
    institute: "",

    // Resume template sections
    education: "",
    employment: "",
    internships: "",
    projects: "",
    final_year_project: "",
    certifications: "",
    languages: "",
    languages_known: "",
    key_skills: "",

    // Screenshot-style skills blocks
    technical_languages: "",
    technical_tools: "",
    technical_cloud: "",
    soft_skills: "",

    // Screenshot-style extras
    achievements_text: "",
    hobbies: "",
    declaration: "",
  });

  const getProfileStorageKey = (currentUser) => {
    const keyPart = currentUser?.id || currentUser?._id || currentUser?.email;
    return keyPart ? `userProfile:${keyPart}` : "userProfile:anonymous";
  };

  const [profileData, setProfileData] = useState(getBaseProfileData(user));
  const [newSkill, setNewSkill] = useState("");
  const [activityHistory, setActivityHistory] = useState([]);

  // SaaS widgets (DB-backed)
  const [latestResume, setLatestResume] = useState(null);
  const [latestResumeLoading, setLatestResumeLoading] = useState(false);
  const [heatmap, setHeatmap] = useState({ days: 84, items: [] });
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  // Section-level edit (stored in users.profile_data)
  const [editingSection, setEditingSection] = useState(null);
  const [sectionDraft, setSectionDraft] = useState("");

  // For true "Cancel" behavior (discard unsaved edits)
  const editSnapshotRef = useRef(null);

  // Settings-page bridge: allow Profile buttons to open a specific Settings tab.
  const setSettingsRedirectTabAndGo = (tab) => {
    try {
      localStorage.setItem("settings.redirectTab", tab);
    } catch (e) {
      // ignore
    }
    navigate("/settings");
  };

  // Share the same settings storage as SettingsPage so changes feel real-time.
  const getUserSettingsKey = (currentUser) => {
    const keyPart = currentUser?.id || currentUser?._id || currentUser?.email;
    return keyPart ? `userSettings:${keyPart}` : "userSettings:anonymous";
  };

  const userSettingsKey = getUserSettingsKey(user);
  const [linkedNotificationSettings, setLinkedNotificationSettings] = useState({
    email: true,
    reminders: true,
    achievements: true,
  });

  useEffect(() => {
    fetchStats();
    loadProfile();
    fetchLatestResume();
    fetchHeatmap(84);
    generateActivityHistory();

    // Load notification settings snapshot (shared with SettingsPage)
    try {
      const saved = localStorage.getItem(userSettingsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const n = parsed?.notifications || {};
        setLinkedNotificationSettings({
          email: typeof n.email === "boolean" ? n.email : true,
          reminders: typeof n.reminders === "boolean" ? n.reminders : true,
          achievements:
            typeof n.achievements === "boolean" ? n.achievements : true,
        });
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, []);

  // Real-time sync: if SettingsPage changes notifications, reflect it here instantly.
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem(userSettingsKey);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        const n = parsed?.notifications || {};
        setLinkedNotificationSettings({
          email: typeof n.email === "boolean" ? n.email : true,
          reminders: typeof n.reminders === "boolean" ? n.reminders : true,
          achievements:
            typeof n.achievements === "boolean" ? n.achievements : true,
        });
      } catch (e) {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (e?.key === userSettingsKey) syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("userSettingsChange", syncFromStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userSettingsChange", syncFromStorage);
    };
  }, [userSettingsKey]);

  const persistNotificationSetting = (key, value) => {
    setLinkedNotificationSettings((prev) => ({ ...prev, [key]: value }));
    try {
      const saved = localStorage.getItem(userSettingsKey);
      const parsed = saved ? JSON.parse(saved) : {};
      const next = {
        ...parsed,
        notifications: {
          ...(parsed.notifications || {}),
          [key]: value,
        },
      };
      localStorage.setItem(userSettingsKey, JSON.stringify(next));
      window.dispatchEvent(new Event("userSettingsChange"));
      toast.success("Notification preference updated", {
        duration: 1200,
        position: "bottom-right",
      });
    } catch (e) {
      // ignore
    }
  };

  const loadProfileFromStorage = () => {
    const base = getBaseProfileData(user);
    const perUserKey = getProfileStorageKey(user);

    try {
      const perUserSaved = localStorage.getItem(perUserKey);
      if (perUserSaved) {
        return { ...base, ...JSON.parse(perUserSaved) };
      }

      // Legacy fallback (previous versions stored a single shared "userProfile")
      const legacySaved = localStorage.getItem("userProfile");
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);

        // Only migrate/apply legacy data if it belongs to the currently authenticated user.
        if (
          parsedLegacy?.email &&
          user?.email &&
          parsedLegacy.email === user.email
        ) {
          localStorage.setItem(perUserKey, legacySaved);
          localStorage.removeItem("userProfile");
          return { ...base, ...parsedLegacy };
        }
      }
    } catch (e) {
      // Ignore malformed storage
    }

    return base;
  };

  const getApiBaseUrl = () => {
    const base = axiosInstance?.defaults?.baseURL || "";
    return base.replace(/\/api\/?$/, "");
  };

  const toAbsoluteUploadsUrl = (maybeRelativeUrl) => {
    if (!maybeRelativeUrl) return "";
    if (
      maybeRelativeUrl.startsWith("http://") ||
      maybeRelativeUrl.startsWith("https://")
    ) {
      return maybeRelativeUrl;
    }
    return `${getApiBaseUrl()}${maybeRelativeUrl}`;
  };

  const triggerBrowserDownload = (url, filename) => {
    if (!url) return;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "resume.pdf";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const fetchAtsResumePdfBlob = async () => {
    const res = await axiosInstance.get("/profile/resume/ats?format=pdf", {
      responseType: "blob",
    });
    return res.data;
  };

  const viewAtsResume = async () => {
    try {
      const blob = await fetchAtsResumePdfBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      toast.error("Could not generate ATS resume", {
        duration: 2200,
        position: "bottom-right",
      });
    }
  };

  const downloadAtsResume = async () => {
    try {
      const blob = await fetchAtsResumePdfBlob();
      const blobUrl = URL.createObjectURL(blob);
      const safeName = (profileData?.name || user?.name || "Resume")
        .toString()
        .replace(/[^a-z0-9 _-]/gi, "")
        .trim()
        .replace(/\s+/g, "_");
      triggerBrowserDownload(blobUrl, `${safeName || "Resume"}_ATS_Resume.pdf`);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      toast.error("Could not download ATS resume", {
        duration: 2200,
        position: "bottom-right",
      });
    }
  };

  const fetchLatestResume = async () => {
    setLatestResumeLoading(true);
    try {
      const res = await axiosInstance.get("/resume/latest");
      setLatestResume(res.data);
    } catch (e) {
      // 404 => no resume uploaded yet
      setLatestResume(null);
    } finally {
      setLatestResumeLoading(false);
    }
  };

  const fetchHeatmap = async (days = 84) => {
    setHeatmapLoading(true);
    try {
      const res = await axiosInstance.get(`/activity/heatmap?days=${days}`);
      setHeatmap(res.data || { days, items: [] });
    } catch (e) {
      setHeatmap({ days, items: [] });
    } finally {
      setHeatmapLoading(false);
    }
  };

  const buildHeatmapCells = () => {
    const days = 84;
    const map = new Map();
    for (const it of heatmap?.items || []) {
      if (it?.date) map.set(String(it.date), Number(it.count || 0));
    }

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const cells = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const count = map.get(key) || 0;
      const day = d.getDay();
      cells.push({ key, count, day });
    }

    // Align to week columns
    const firstDay = cells[0]?.day ?? 0;
    const padded = [];
    for (let i = 0; i < firstDay; i++) padded.push(null);
    padded.push(...cells);
    return padded;
  };

  // Social link helpers
  // - GitHub field is stored as username, but users often paste full URLs.
  // - LinkedIn/Portfolio should be valid URLs; we keep them as-is but ensure https://.
  const normalizeGithubUsername = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw) return "";

    // Accept:
    // - "username"
    // - "@username"
    // - "https://github.com/username" (or with trailing slash/query)
    let cleaned = raw.replace(/^@/, "");
    cleaned = cleaned.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    if (cleaned.toLowerCase().startsWith("github.com/")) {
      cleaned = cleaned.slice("github.com/".length);
    }
    return cleaned.split(/[/?#]/)[0].trim();
  };

  const ensureHttpsUrl = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };

  const loadProfile = async () => {
    // Start from a clean base so switching accounts doesn't reuse previous user's cached fields.
    const base = getBaseProfileData(user);
    const localProfile = loadProfileFromStorage();
    setProfileData(localProfile);

    setProfileLoading(true);
    try {
      const response = await axiosInstance.get("/profile");
      const serverProfile = response.data;

      const mergedProfileData = {
        ...base,
        ...localProfile,
        ...(serverProfile?.profile_data || {}),
        name: serverProfile?.name || user?.name || "",
        email: serverProfile?.email || user?.email || "",
      };

      setProfileData(mergedProfileData);
      setAvatarUrl(serverProfile?.avatar_url || "");

      // Keep auth user in sync for name (and avatar if present)
      const updatedUser = {
        ...user,
        name: serverProfile?.name || user?.name,
        avatar_url: serverProfile?.avatar_url || user?.avatar_url,
      };
      saveUser(updatedUser);
      window.dispatchEvent(new Event("authChange"));
    } catch (error) {
      // Fallback to local storage only
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const generateActivityHistory = () => {
    // Generate mock activity based on stats
    const activities = [
      {
        type: "code",
        title: "Completed Coding Challenge",
        desc: "Two Sum Problem - Score: 92%",
        time: "2 hours ago",
        icon: Code,
      },
      {
        type: "learning",
        title: "Learning Session",
        desc: "Completed React Hooks Tutorial",
        time: "5 hours ago",
        icon: BookOpen,
      },
      {
        type: "resume",
        title: "Resume Analyzed",
        desc: "Credibility Score: 78/100",
        time: "1 day ago",
        icon: FileText,
      },
      {
        type: "interview",
        title: "Mock Interview",
        desc: "Technical Interview - Readiness: 85%",
        time: "2 days ago",
        icon: MessageSquare,
      },
      {
        type: "achievement",
        title: "Achievement Unlocked",
        desc: 'Earned "Code Warrior" badge',
        time: "3 days ago",
        icon: Award,
      },
      {
        type: "code",
        title: "Completed Coding Challenge",
        desc: "Binary Search - Score: 88%",
        time: "4 days ago",
        icon: Code,
      },
    ];
    setActivityHistory(activities);
  };

  const saveProfile = async (nextProfileData) => {
    try {
      const { name, email, ...profilePayload } = nextProfileData;
      const response = await axiosInstance.put("/profile", {
        name: nextProfileData.name,
        profile_data: profilePayload,
      });

      const updated = response.data;
      setAvatarUrl(updated?.avatar_url || avatarUrl);

      const updatedUser = {
        ...user,
        name: updated?.name || nextProfileData.name,
        avatar_url: updated?.avatar_url || user?.avatar_url,
      };
      saveUser(updatedUser);

      const perUserKey = getProfileStorageKey(user);
      localStorage.setItem(perUserKey, JSON.stringify(nextProfileData));
      // Clean up legacy shared key if it exists
      localStorage.removeItem("userProfile");
      setEditing(false);
      editSnapshotRef.current = null;
      setEditingSection(null);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSaveProfile = async () => {
    await saveProfile(profileData);
  };

  const toggleEditing = () => {
    if (!editing) {
      // entering edit mode
      editSnapshotRef.current = profileData;
      setEditing(true);
      return;
    }

    // leaving edit mode => treat as Cancel
    if (editSnapshotRef.current) {
      setProfileData(editSnapshotRef.current);
    }
    editSnapshotRef.current = null;
    setEditing(false);
    toast.message("Edits discarded", { duration: 1000 });
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);

      // IMPORTANT: don't manually set multipart Content-Type (boundary must be set by Axios)
      const response = await axiosInstance.post("/profile/avatar", form);

      const newAvatarUrl = response.data?.avatar_url;
      setAvatarUrl(newAvatarUrl);

      const updatedUser = {
        ...user,
        name: profileData.name,
        avatar_url: newAvatarUrl,
      };
      saveUser(updatedUser);
      window.dispatchEvent(new Event("authChange"));

      toast.success("Avatar updated!");
    } catch (error) {
      const status = error?.response?.status;
      const apiBase = axiosInstance?.defaults?.baseURL;
      const endpointUrl = apiBase
        ? `${apiBase.replace(/\/$/, "")}/profile/avatar`
        : "";

      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload avatar";

      // If auth is invalid or user no longer exists in DB, force re-login.
      if (
        status === 401 ||
        status === 403 ||
        (status === 404 && String(detail).toLowerCase() === "user not found")
      ) {
        clearAuth();
        window.dispatchEvent(new Event("authChange"));
        toast.error("Session expired. Please login again.");
        navigate("/auth");
        return;
      }

      // Helpful message when the backend doesn't have this route (usually wrong API base URL or backend not restarted).
      if (status === 404 && String(detail).toLowerCase() === "not found") {
        toast.error(
          endpointUrl
            ? `Avatar upload endpoint not found: ${endpointUrl}`
            : "Avatar upload endpoint not found"
        );
        return;
      }

      // FastAPI validation errors come as an array under `detail`
      if (status === 422 && Array.isArray(error?.response?.data?.detail)) {
        const first = error.response.data.detail[0];
        const loc = Array.isArray(first?.loc) ? first.loc.join(".") : "request";
        const msg = first?.msg || "Validation error";
        toast.error(`422: ${loc} - ${msg}`);
        return;
      }

      toast.error(status ? `${status}: ${detail}` : String(detail));
    } finally {
      // allow re-selecting same file
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event("authChange"));
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const calculateLevel = () => {
    if (!stats) return { level: 1, xp: 0, nextXp: 100 };
    const totalXp =
      (stats.code_submissions || 0) * 10 +
      (stats.learning_sessions || 0) * 5 +
      (stats.interviews_taken || 0) * 15 +
      (stats.resume_analyses || 0) * 8;
    const level = Math.floor(totalXp / 100) + 1;
    const currentXp = totalXp % 100;
    return { level, xp: currentXp, nextXp: 100 };
  };

  const levelInfo = calculateLevel();

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first learning session",
      icon: "🎯",
      earned: (stats?.learning_sessions || 0) >= 1,
      xp: 10,
    },
    {
      id: 2,
      title: "Code Warrior",
      description: "Submit 10 code solutions",
      icon: "⚔️",
      earned: (stats?.code_submissions || 0) >= 10,
      xp: 50,
    },
    {
      id: 3,
      title: "Quick Learner",
      description: "Complete 5 learning sessions",
      icon: "📖",
      earned: (stats?.learning_sessions || 0) >= 5,
      xp: 25,
    },
    {
      id: 4,
      title: "Interview Ready",
      description: "Complete 3 mock interviews",
      icon: "🎤",
      earned: (stats?.interviews_taken || 0) >= 3,
      xp: 30,
    },
    {
      id: 5,
      title: "Resume Pro",
      description: "Analyze 3 resumes",
      icon: "📄",
      earned: (stats?.resume_analyses || 0) >= 3,
      xp: 20,
    },
    {
      id: 6,
      title: "Top Performer",
      description: "Achieve 90%+ average score",
      icon: "🏆",
      earned: (stats?.avg_code_score || 0) >= 90,
      xp: 100,
    },
    {
      id: 7,
      title: "Dedicated Learner",
      description: "20+ learning sessions",
      icon: "📚",
      earned: (stats?.learning_sessions || 0) >= 20,
      xp: 75,
    },
    {
      id: 8,
      title: "Code Master",
      description: "Submit 50 code solutions",
      icon: "👨‍💻",
      earned: (stats?.code_submissions || 0) >= 50,
      xp: 150,
    },
    {
      id: 9,
      title: "Interview Expert",
      description: "Complete 10 mock interviews",
      icon: "💼",
      earned: (stats?.interviews_taken || 0) >= 10,
      xp: 80,
    },
  ];

  const earnedAchievements = achievements.filter((a) => a.earned);
  const totalXpEarned = earnedAchievements.reduce((sum, a) => sum + a.xp, 0);

  const getRoleBadge = (role) => {
    const badges = {
      student: {
        color: "bg-primary/15 text-primary border-primary/30",
        icon: GraduationCap,
      },
      job_seeker: {
        color: "bg-primary/15 text-primary border-primary/30",
        icon: Briefcase,
      },
      company: {
        color: "bg-primary/15 text-primary border-primary/30",
        icon: Briefcase,
      },
      college_admin: {
        color: "bg-primary/15 text-primary border-primary/30",
        icon: Shield,
      },
    };
    return badges[role] || badges.student;
  };

  const roleBadge = getRoleBadge(user?.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-primary to-primary relative">
            <div className="absolute inset-0 bg-background/20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-card shadow-xl">
                  <AvatarImage src={toAbsoluteUploadsUrl(avatarUrl)} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl sm:text-4xl font-bold">
                    {profileData.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
                <div
                  className="absolute bottom-2 right-2 p-2 bg-card rounded-full border border-border cursor-pointer hover:bg-muted transition-colors"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                >
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </div>
                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  LVL {levelInfo.level}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {profileData.name}
                      </h1>
                      <Badge className={`${roleBadge.color} border`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user?.role?.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profileData.email}
                      </span>
                      {profileData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profileData.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined{" "}
                        {new Date(user?.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>
                    {profileData.bio && (
                      <p className="mt-2 text-muted-foreground max-w-xl">
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleEditing}
                      variant={editing ? "default" : "outline"}
                      className={
                        editing
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      }
                    >
                      {editing ? (
                        <X className="w-4 h-4 mr-2" />
                      ) : (
                        <Edit2 className="w-4 h-4 mr-2" />
                      )}
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                    <Button
                      variant="outline"
                      className=""
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-400">
                      Level {levelInfo.level} Progress
                    </span>
                    <span className="text-zinc-400">
                      {levelInfo.xp}/{levelInfo.nextXp} XP
                    </span>
                  </div>
                  <Progress
                    value={(levelInfo.xp / levelInfo.nextXp) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-card border border-border p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: profile sections */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Details
                    </CardTitle>
                    <CardDescription>
                      {editing
                        ? "Update your core details"
                        : "Your account details and contact information"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        {editing ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm font-medium">
                            {profileData.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {profileData.email}
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        {editing ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+91 00000 00000"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {profileData.phone || "Not provided"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        {editing ? (
                          <Input
                            value={profileData.location}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                location: e.target.value,
                              })
                            }
                            placeholder="City, Country"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {profileData.location || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      {editing ? (
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          placeholder="A short summary about you"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {profileData.bio || "No bio added yet"}
                        </p>
                      )}
                    </div>

                    {editing && (
                      <Button onClick={handleSaveProfile} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Section cards (stored in DB in users.profile_data) */}
                {[
                  {
                    key: "profile_summary",
                    title: "Profile Summary",
                    icon: FileText,
                    placeholder: "Write a concise profile summary...",
                  },
                  {
                    key: "roll_no",
                    title: "Roll No / ID",
                    icon: Shield,
                    placeholder: "Ex: 22KP1A44A9",
                  },
                  {
                    key: "degree",
                    title: "Degree",
                    icon: GraduationCap,
                    placeholder: "Ex: Bachelor of Technology",
                  },
                  {
                    key: "branch",
                    title: "Branch / Department",
                    icon: Code,
                    placeholder: "Ex: Computer Science & Engineering",
                  },
                  {
                    key: "institute",
                    title: "Institute / College",
                    icon: BookOpen,
                    placeholder: "Ex: NRI Institute of Technology, Guntur",
                  },

                  {
                    key: "technical_tools",
                    title: "Technical Skills (Tools)",
                    icon: Settings,
                    placeholder: "Ex: Power BI, Git",
                  },
                  {
                    key: "soft_skills",
                    title: "Soft Skills",
                    icon: Sparkles,
                    placeholder:
                      "Ex: Communication, Teamwork, Self-Learning, Critical Thinking",
                  },
                  {
                    key: "education",
                    title: "Education",
                    icon: GraduationCap,
                    placeholder:
                      "Use one line per education entry.\nOptional: use '|' to align right-side info (CGPA/Score).\n\nExample:\nNRI Institute of Technology, Guntur (2022-2026) | CGPA: 8.4\nSri Karthikeya Junior College (2020-2022) | MPC: 76.9%",
                  },
                  {
                    key: "projects",
                    title: "Project",
                    icon: Rocket,
                    placeholder:
                      "Tip: use 'Title: description' to match the template.\n\nExample:\nAI System Assistant Chatbot: NLP-based chatbot using LLM to answer technical queries.\nPortfolio Website: Responsive website showcasing projects and skills.\nPower BI Dashboards: Interactive dashboards using Power BI.",
                  },
                  {
                    key: "final_year_project",
                    title: "Internship",
                    icon: Briefcase,
                    placeholder:
                      "Use one line per internship.\nOptional: use '|' to align dates on the right.\n\nExample:\nSupraja Tech — Ethical Hacking Trainee | May - Jul 2025\nAIMER Society (AI Internship) | Jun 2024\n- Worked on AI projects...",
                  },
                  {
                    key: "certifications",
                    title: "Certifications",
                    icon: Award,
                    placeholder: "Ex: AWS Cloud Practitioner (2025)",
                  },
                  {
                    key: "achievements_text",
                    title: "Achievements",
                    icon: Trophy,
                    placeholder:
                      "Use one achievement per line.\nExample:\nWinner — Chatbot Hackathon\nParticipant — Cloud AI Training",
                  },
                  {
                    key: "languages",
                    title: "Languages",
                    icon: Globe,
                    placeholder: "Ex: English, Telugu, Hindi",
                  },
                  {
                    key: "hobbies",
                    title: "Hobbies",
                    icon: Heart,
                    placeholder:
                      "Ex: Exploring AI tools, Blogging, Playing free fire, Traveling",
                  },
                  {
                    key: "declaration",
                    title: "Declaration",
                    icon: Lock,
                    placeholder:
                      "Ex: I hereby declare that the above information is true to the best of my knowledge...",
                  },
                ].map((section) => {
                  const value = (profileData?.[section.key] || "").trim();
                  const isEditingThis = editingSection === section.key;
                  const Icon = section.icon;

                  return (
                    <Card key={section.key}>
                      <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {Icon ? (
                              <Icon className="w-4 h-4 text-primary" />
                            ) : null}
                            {section.title}
                          </CardTitle>
                          <CardDescription>
                            Stored in your account (database-backed)
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!isEditingThis ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSection(section.key);
                                setSectionDraft(
                                  profileData?.[section.key] || ""
                                );
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              {value ? "Edit" : "Add"}
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const next = {
                                    ...profileData,
                                    [section.key]: sectionDraft,
                                  };
                                  setProfileData(next);
                                  await saveProfile(next);
                                }}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingSection(null);
                                  setSectionDraft("");
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isEditingThis ? (
                          <Textarea
                            value={sectionDraft}
                            onChange={(e) => setSectionDraft(e.target.value)}
                            placeholder={section.placeholder}
                            className="min-h-[120px]"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {value || "Not added yet"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Right: SaaS widgets */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="w-5 h-5 text-primary" />
                      ATS Resume
                    </CardTitle>
                    <CardDescription>
                      Generate an ATS-friendly resume from your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={viewAtsResume}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button className="flex-1" onClick={downloadAtsResume}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tip: keep your Education, Experience, Projects, and Skills
                      updated for best results.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="w-5 h-5 text-primary" />
                      Latest Resume
                    </CardTitle>
                    <CardDescription>
                      View/download your last uploaded resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {latestResumeLoading ? (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : latestResume ? (
                      <>
                        <div className="text-sm">
                          <p className="font-medium truncate">
                            {latestResume.filename || "Resume"}
                          </p>
                          <p className="text-muted-foreground">
                            Credibility: {latestResume.credibility_score ?? "—"}
                            /100
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!latestResume.file_url}
                            onClick={() => {
                              const url = toAbsoluteUploadsUrl(
                                latestResume.file_url
                              );
                              if (url)
                                window.open(
                                  url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            className="flex-1"
                            disabled={!latestResume.file_url}
                            onClick={() => {
                              const url = toAbsoluteUploadsUrl(
                                latestResume.file_url
                              );
                              if (url)
                                triggerBrowserDownload(
                                  url,
                                  latestResume.filename
                                );
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No resume uploaded yet.
                      </p>
                    )}
                    <Button
                      variant={latestResume ? "outline" : "default"}
                      className="w-full"
                      onClick={() => navigate("/resume")}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      {latestResume
                        ? "Analyze a new resume"
                        : "Upload & analyze resume"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="w-5 h-5 text-primary" />
                      Activity Calendar
                    </CardTitle>
                    <CardDescription>
                      Last 12 weeks (auto from DB activity)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {heatmapLoading ? (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : (
                      <div className="grid grid-cols-12 gap-1">
                        {buildHeatmapCells().map((cell, idx) => {
                          if (!cell) {
                            return (
                              <div key={`pad-${idx}`} className="h-3 w-3" />
                            );
                          }
                          const c = cell.count;
                          const intensity =
                            c <= 0
                              ? 0
                              : c === 1
                              ? 1
                              : c <= 3
                              ? 2
                              : c <= 6
                              ? 3
                              : 4;
                          const cls =
                            intensity === 0
                              ? "bg-muted"
                              : intensity === 1
                              ? "bg-primary/20"
                              : intensity === 2
                              ? "bg-primary/35"
                              : intensity === 3
                              ? "bg-primary/55"
                              : "bg-primary";
                          return (
                            <div
                              key={cell.key}
                              title={`${cell.key}: ${c}`}
                              className={`h-3 w-3 rounded-sm ${cls}`}
                            />
                          );
                        })}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fetchHeatmap(84)}
                    >
                      Refresh Activity
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Skills
                    </CardTitle>
                    <CardDescription>
                      {editing
                        ? "Click a skill to remove"
                        : "Your highlighted skills"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profileData.skills?.length > 0 ? (
                        profileData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="cursor-pointer"
                            variant="secondary"
                            onClick={() => editing && handleRemoveSkill(skill)}
                          >
                            {skill}
                            {editing && <X className="w-3 h-3 ml-1" />}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet
                        </p>
                      )}
                    </div>
                    {editing && (
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddSkill()
                          }
                        />
                        <Button onClick={handleAddSkill} size="sm">
                          Add
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Link2 className="w-5 h-5 text-primary" />
                      Online Profiles
                    </CardTitle>
                    <CardDescription>
                      GitHub, LinkedIn and Portfolio links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editing ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Github className="w-5 h-5 text-muted-foreground" />
                          <Input
                            value={profileData.github}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                github: e.target.value,
                              })
                            }
                            onBlur={(e) => {
                              const normalized = normalizeGithubUsername(
                                e.target.value
                              );
                              if (normalized !== profileData.github) {
                                setProfileData({
                                  ...profileData,
                                  github: normalized,
                                });
                              }
                            }}
                            placeholder="GitHub username or URL"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-5 h-5 text-muted-foreground" />
                          <Input
                            value={profileData.linkedin}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                linkedin: e.target.value,
                              })
                            }
                            onBlur={(e) => {
                              const normalized = ensureHttpsUrl(e.target.value);
                              if (normalized !== profileData.linkedin) {
                                setProfileData({
                                  ...profileData,
                                  linkedin: normalized,
                                });
                              }
                            }}
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          <Input
                            value={profileData.portfolio}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                portfolio: e.target.value,
                              })
                            }
                            onBlur={(e) => {
                              const normalized = ensureHttpsUrl(e.target.value);
                              if (normalized !== profileData.portfolio) {
                                setProfileData({
                                  ...profileData,
                                  portfolio: normalized,
                                });
                              }
                            }}
                            placeholder="Portfolio URL"
                          />
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full">
                          <Save className="w-4 h-4 mr-2" />
                          Save Links
                        </Button>
                      </>
                    ) : (
                      <>
                        {profileData.github ? (
                          <a
                            href={`https://github.com/${normalizeGithubUsername(
                              profileData.github
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded-md border border-border p-3 hover:bg-muted transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Github className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm">GitHub</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}

                        {profileData.linkedin ? (
                          <a
                            href={ensureHttpsUrl(profileData.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded-md border border-border p-3 hover:bg-muted transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Linkedin className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm">LinkedIn</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}

                        {profileData.portfolio ? (
                          <a
                            href={ensureHttpsUrl(profileData.portfolio)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded-md border border-border p-3 hover:bg-muted transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Globe className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm">Portfolio</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}

                        {!profileData.github &&
                        !profileData.linkedin &&
                        !profileData.portfolio ? (
                          <p className="text-sm text-muted-foreground">
                            No links added yet
                          </p>
                        ) : null}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-6 text-center">
                  <Code className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="flex items-center justify-center mb-1">
                    <p className="text-3xl font-bold text-white mr-2">
                      {stats?.code_submissions || 0}
                    </p>
                    {/* Progress bars for problems solved */}
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                            i <
                            Math.min(
                              Math.floor((stats?.code_submissions || 0) / 20),
                              5
                            )
                              ? "bg-gradient-to-t from-orange-400 to-orange-600"
                              : "bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">Problems Solved</p>
                  <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((stats?.code_submissions || 0) / 100) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="flex items-center justify-center mb-1">
                    <p className="text-3xl font-bold text-white mr-2">
                      {stats?.avg_code_score || 0}%
                    </p>
                    {/* Horizontal meter for avg score */}
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                            i <
                            Math.floor(((stats?.avg_code_score || 0) / 100) * 5)
                              ? "bg-gradient-to-t from-orange-400 to-orange-600"
                              : "bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">Average Score</p>
                  <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.avg_code_score || 0}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="flex items-center justify-center mb-1">
                    <p className="text-3xl font-bold text-white mr-2">
                      {stats?.learning_sessions || 0}
                    </p>
                    {/* Progress bars for learning sessions */}
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                            i <
                            Math.min(
                              Math.floor((stats?.learning_sessions || 0) / 10),
                              5
                            )
                              ? "bg-gradient-to-t from-orange-400 to-orange-600"
                              : "bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">Learning Sessions</p>
                  <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((stats?.learning_sessions || 0) / 50) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="flex items-center justify-center mb-1">
                    <p className="text-3xl font-bold text-white mr-2">
                      {stats?.interviews_taken || 0}
                    </p>
                    {/* Progress bars for interviews */}
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                            i <
                            Math.min(
                              Math.floor((stats?.interviews_taken || 0) / 2),
                              5
                            )
                              ? "bg-gradient-to-t from-orange-400 to-orange-600"
                              : "bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">Mock Interviews</p>
                  <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((stats?.interviews_taken || 0) / 10) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Coding Skills</span>
                      <span className="text-white font-medium">
                        {stats?.avg_code_score || 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats?.avg_code_score || 0}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Interview Readiness</span>
                      <span className="text-white font-medium">
                        {Math.min((stats?.interviews_taken || 0) * 10, 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min((stats?.interviews_taken || 0) * 10, 100)}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Learning Progress</span>
                      <span className="text-white font-medium">
                        {Math.min((stats?.learning_sessions || 0) * 5, 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min((stats?.learning_sessions || 0) * 5, 100)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    XP Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">From Coding</span>
                    <span className="text-white font-bold">
                      {(stats?.code_submissions || 0) * 10} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">From Learning</span>
                    <span className="text-white font-bold">
                      {(stats?.learning_sessions || 0) * 5} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">From Interviews</span>
                    <span className="text-white font-bold">
                      {(stats?.interviews_taken || 0) * 15} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">From Achievements</span>
                    <span className="text-white font-bold">
                      {totalXpEarned} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-900/50 to-orange-900/50 rounded-lg border border-orange-500/30">
                    <span className="text-white font-medium">Total XP</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400">
                      {(stats?.code_submissions || 0) * 10 +
                        (stats?.learning_sessions || 0) * 5 +
                        (stats?.interviews_taken || 0) * 15 +
                        totalXpEarned}{" "}
                      XP
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Trophy className="w-5 h-5 text-orange-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {earnedAchievements.length} of {achievements.length}{" "}
                      unlocked
                    </CardDescription>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Gem className="w-3 h-3 mr-1" />
                    {totalXpEarned} XP Earned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border transition-all ${
                        achievement.earned
                          ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-orange-500/30 shadow-lg shadow-orange-500/10"
                          : "bg-zinc-900 border-zinc-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{achievement.icon}</span>
                        {achievement.earned && (
                          <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                            +{achievement.xp} XP
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-white mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-2">
                        {achievement.description}
                      </p>
                      {achievement.earned ? (
                        <div className="flex items-center gap-1 text-orange-400 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Unlocked
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-zinc-500 text-sm">
                          <Lock className="w-4 h-4" />
                          Locked
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        <div className="p-2 bg-zinc-700 rounded-lg">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {activity.desc}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        Email notifications
                      </p>
                      <p className="text-sm text-zinc-400">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={linkedNotificationSettings.email}
                      onCheckedChange={(checked) =>
                        persistNotificationSetting("email", checked)
                      }
                      className="data-[state=checked]:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        Learning reminders
                      </p>
                      <p className="text-sm text-zinc-400">
                        Daily learning reminders
                      </p>
                    </div>
                    <Switch
                      checked={linkedNotificationSettings.reminders}
                      onCheckedChange={(checked) =>
                        persistNotificationSetting("reminders", checked)
                      }
                      className="data-[state=checked]:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        Achievement alerts
                      </p>
                      <p className="text-sm text-zinc-400">
                        Get notified on new achievements
                      </p>
                    </div>
                    <Switch
                      checked={linkedNotificationSettings.achievements}
                      onCheckedChange={(checked) =>
                        persistNotificationSetting("achievements", checked)
                      }
                      className="data-[state=checked]:bg-white"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setSettingsRedirectTabAndGo("notifications")}
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Manage all notification settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setSettingsRedirectTabAndGo("security")}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setSettingsRedirectTabAndGo("security")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-orange-900/20 via-zinc-900 to-orange-900/20 border-orange-800/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      Danger Zone
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    onClick={() => setSettingsRedirectTabAndGo("data")}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
