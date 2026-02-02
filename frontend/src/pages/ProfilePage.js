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
  });

  const getProfileStorageKey = (currentUser) => {
    const keyPart = currentUser?.id || currentUser?._id || currentUser?.email;
    return keyPart ? `userProfile:${keyPart}` : "userProfile:anonymous";
  };

  const [profileData, setProfileData] = useState(getBaseProfileData(user));
  const [newSkill, setNewSkill] = useState("");
  const [activityHistory, setActivityHistory] = useState([]);

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

  const handleSaveProfile = async () => {
    try {
      const { name, email, ...profilePayload } = profileData;
      const response = await axiosInstance.put("/profile", {
        name: profileData.name,
        profile_data: profilePayload,
      });

      const updated = response.data;
      setAvatarUrl(updated?.avatar_url || avatarUrl);

      const updatedUser = {
        ...user,
        name: updated?.name || profileData.name,
        avatar_url: updated?.avatar_url || user?.avatar_url,
      };
      saveUser(updatedUser);

      const perUserKey = getProfileStorageKey(user);
      localStorage.setItem(perUserKey, JSON.stringify(profileData));
      // Clean up legacy shared key if it exists
      localStorage.removeItem("userProfile");
      setEditing(false);
      editSnapshotRef.current = null;
      window.dispatchEvent(new Event("authChange"));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
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
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: GraduationCap,
      },
      job_seeker: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: Briefcase,
      },
      company: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: Briefcase,
      },
      college_admin: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: Shield,
      },
    };
    return badges[role] || badges.student;
  };

  const roleBadge = getRoleBadge(user?.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-zinc-800 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-600 via-orange-600 to-orange-600 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-xl">
                  <AvatarImage src={toAbsoluteUploadsUrl(avatarUrl)} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-500 text-white text-3xl sm:text-4xl font-bold">
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
                  className="absolute bottom-2 right-2 p-2 bg-zinc-800 rounded-full border border-zinc-700 cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                >
                  <Camera className="w-4 h-4 text-zinc-400" />
                </div>
                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-xs font-bold text-black flex items-center gap-1">
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
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
                      <p className="mt-2 text-zinc-300 max-w-xl">
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
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "border-zinc-700 text-white hover:bg-zinc-800"
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
                      className="border-zinc-700 text-white hover:bg-zinc-800"
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="text-2xl font-bold text-white mr-2">
                    {stats?.code_submissions || 0}
                  </div>
                  {/* Progress bars for problems solved */}
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-sm transition-all duration-300 ${
                          i <
                          Math.min(
                            Math.floor((stats?.code_submissions || 0) / 20),
                            3
                          )
                            ? "bg-gradient-to-t from-orange-400 to-orange-600"
                            : "bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Problems Solved</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="text-2xl font-bold text-white mr-2">
                    {stats?.avg_code_score || 0}%
                  </div>
                  {/* Horizontal meter for avg score */}
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-sm transition-all duration-300 ${
                          i <
                          Math.floor(((stats?.avg_code_score || 0) / 100) * 5)
                            ? "bg-gradient-to-t from-orange-400 to-orange-600"
                            : "bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Avg Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="text-2xl font-bold text-white mr-2">
                    {stats?.learning_sessions || 0}
                  </div>
                  {/* Progress bars for sessions */}
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-sm transition-all duration-300 ${
                          i <
                          Math.min(
                            Math.floor((stats?.learning_sessions || 0) / 10),
                            3
                          )
                            ? "bg-gradient-to-t from-orange-400 to-orange-600"
                            : "bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Sessions</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="text-2xl font-bold text-white mr-2">
                    {stats?.interviews_taken || 0}
                  </div>
                  {/* Progress bars for interviews */}
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-sm transition-all duration-300 ${
                          i <
                          Math.min(
                            Math.floor((stats?.interviews_taken || 0) / 2),
                            3
                          )
                            ? "bg-gradient-to-t from-orange-400 to-orange-600"
                            : "bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Interviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {earnedAchievements.length}
                </p>
                <p className="text-xs text-zinc-400">Achievements</p>
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
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-orange-400" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {editing
                      ? "Update your profile information"
                      : "Your personal details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Full Name</Label>
                      {editing ? (
                        <Input
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">
                          {user?.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Email</Label>
                      <p className="text-white font-medium p-2 flex items-center gap-2">
                        {user?.email}
                        <CheckCircle2 className="w-4 h-4 text-orange-400" />
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Phone</Label>
                      {editing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+1 (555) 000-0000"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">
                          {profileData.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Location</Label>
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
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">
                          {profileData.location || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Current Title</Label>
                      {editing ? (
                        <Input
                          value={profileData.title}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              title: e.target.value,
                            })
                          }
                          placeholder="Software Engineer"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">
                          {profileData.title || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">
                        Company / University
                      </Label>
                      {editing ? (
                        <Input
                          value={profileData.company}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              company: e.target.value,
                            })
                          }
                          placeholder="Company or University name"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">
                          {profileData.company || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Bio</Label>
                    {editing ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Tell us about yourself..."
                        className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                      />
                    ) : (
                      <p className="text-zinc-300 p-2">
                        {profileData.bio || "No bio added yet"}
                      </p>
                    )}
                  </div>
                  {editing && (
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Links */}
              <div className="space-y-6">
                {/* Skills */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                            onClick={() => editing && handleRemoveSkill(skill)}
                          >
                            {skill}
                            {editing && <X className="w-3 h-3 ml-1" />}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-zinc-400 text-sm">
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
                          className="bg-zinc-800 border-zinc-700 text-white"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddSkill()
                          }
                        />
                        <Button
                          onClick={handleAddSkill}
                          size="sm"
                          className="bg-white text-black hover:bg-zinc-200"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Link2 className="w-5 h-5 text-orange-400" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Github className="w-5 h-5 text-orange-400" />
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
                            placeholder="GitHub username (or paste profile URL)"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-5 h-5 text-orange-400" />
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
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-orange-400" />
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
                            placeholder="Portfolio website"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {profileData.github && (
                          <a
                            href={`https://github.com/${normalizeGithubUsername(
                              profileData.github
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Github className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">
                              GitHub Profile
                            </span>
                          </a>
                        )}
                        {profileData.linkedin && (
                          <a
                            href={ensureHttpsUrl(profileData.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Linkedin className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">
                              LinkedIn Profile
                            </span>
                          </a>
                        )}
                        {profileData.portfolio && (
                          <a
                            href={ensureHttpsUrl(profileData.portfolio)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Globe className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                            <span className="text-zinc-300 group-hover:text-white transition-colors">
                              Portfolio
                            </span>
                          </a>
                        )}
                        {!profileData.github &&
                          !profileData.linkedin &&
                          !profileData.portfolio && (
                            <p className="text-zinc-400 text-sm">
                              No links added yet
                            </p>
                          )}
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
