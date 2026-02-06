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
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
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
import {
  getUser,
  setUser as saveUser,
  clearAuth,
  toAbsoluteUploadsUrl,
} from "../lib/utils";
import { toast } from "sonner";
import { useI18n } from "../i18n/I18nProvider";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { t } = useI18n();
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

    visibility: "private", // private | public
    weekly_goals: [],

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

  const loadProfileFromStorage = (baseProfile) => {
    const base = baseProfile || getBaseProfileData(user);
    try {
      const perUserKey = getProfileStorageKey(user);
      const raw =
        localStorage.getItem(perUserKey) || localStorage.getItem("userProfile");
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return base;
      return { ...base, ...parsed };
    } catch (e) {
      return base;
    }
  };

  const [profileData, setProfileData] = useState(getBaseProfileData(user));
  const [newSkill, setNewSkill] = useState("");
  const [newGoalText, setNewGoalText] = useState("");
  const [activityHistory, setActivityHistory] = useState([]);

  // ATS Resume templates
  const [atsDialogOpen, setAtsDialogOpen] = useState(false);
  const [atsTemplateId, setAtsTemplateId] = useState("classic");
  const [atsAction, setAtsAction] = useState("view"); // view | download
  const [atsBusy, setAtsBusy] = useState(false);

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
        // ignore malformed storage
      }
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [userSettingsKey]);

  const atsTemplates = [
    { id: "classic", name: "Classic", desc: "Simple, recruiter-friendly" },
    { id: "modern", name: "Modern", desc: "Clean sections, bold headings" },
    { id: "minimal", name: "Minimal", desc: "Ultra-compact spacing" },
    { id: "compact", name: "Compact", desc: "Fits more on one page" },
    { id: "timeline", name: "Timeline", desc: "Timeline-style experience" },
    { id: "twocol", name: "Two Column", desc: "Skills + content split" },
    { id: "academic", name: "Academic", desc: "Education-first layout" },
    { id: "tech", name: "Tech", desc: "Projects-first layout" },
    { id: "freshers", name: "Freshers", desc: "Student/intern oriented" },
    { id: "executive", name: "Executive", desc: "Leadership-focused" },
    { id: "creative", name: "Creative", desc: "ATS-safe, nicer spacing" },
    { id: "bold", name: "Bold", desc: "High-contrast headings" },
  ];

  const fetchAtsResumePdfBlob = async (templateId = "classic") => {
    const safeTemplate = String(templateId || "classic");
    const res = await axiosInstance.get(
      `/profile/resume/ats?format=pdf&template=${encodeURIComponent(
        safeTemplate
      )}`,
      { responseType: "blob" }
    );
    return res.data;
  };

  const viewAtsResume = async (templateId = atsTemplateId) => {
    try {
      setAtsBusy(true);
      const blob = await fetchAtsResumePdfBlob(templateId);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      toast.error(
        t("profile.ats.error.generate", "Could not generate ATS resume"),
        {
          duration: 2200,
          position: "bottom-right",
        }
      );
    } finally {
      setAtsBusy(false);
    }
  };

  const downloadAtsResume = async (templateId = atsTemplateId) => {
    try {
      setAtsBusy(true);
      const blob = await fetchAtsResumePdfBlob(templateId);
      const blobUrl = URL.createObjectURL(blob);
      const safeName = (profileData?.name || user?.name || "Resume")
        .toString()
        .replace(/[^a-z0-9 _-]/gi, "")
        .trim()
        .replace(/\s+/g, "_");
      const suffix = String(templateId || "classic")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 24);
      triggerBrowserDownload(
        blobUrl,
        `${safeName || "Resume"}_ATS_${suffix || "classic"}.pdf`
      );
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      toast.error(
        t("profile.ats.error.download", "Could not download ATS resume"),
        {
          duration: 2200,
          position: "bottom-right",
        }
      );
    } finally {
      setAtsBusy(false);
    }
  };

  const openAtsTemplatePicker = (action) => {
    setAtsAction(action === "download" ? "download" : "view");
    setAtsDialogOpen(true);
  };

  const handleChooseAtsTemplate = async (templateId) => {
    if (atsBusy) return;
    setAtsTemplateId(templateId);
    if (atsAction === "download") {
      await downloadAtsResume(templateId);
    } else {
      await viewAtsResume(templateId);
    }
    setAtsDialogOpen(false);
  };

  const getShareableProfileLink = () => {
    const origin = window.location.origin;
    const id = user?.id || user?._id || "";
    return id
      ? `${origin}/profile?user=${encodeURIComponent(id)}`
      : `${origin}/profile`;
  };

  const copyProfileLink = async () => {
    const link = getShareableProfileLink();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast.success(t("profile.toasts.linkCopied", "Profile link copied"));
    } catch (e) {
      toast.error(
        t("profile.toasts.linkCopyFailed", "Could not copy profile link")
      );
    }
  };

  const addWeeklyGoal = () => {
    const text = newGoalText.trim();
    if (!text) return;
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setProfileData((prev) => ({
      ...prev,
      weekly_goals: [...(prev.weekly_goals || []), { id, text, done: false }],
    }));
    setNewGoalText("");
  };

  const toggleWeeklyGoal = (id) => {
    setProfileData((prev) => ({
      ...prev,
      weekly_goals: (prev.weekly_goals || []).map((g) =>
        g.id === id ? { ...g, done: !g.done } : g
      ),
    }));
  };

  const removeWeeklyGoal = (id) => {
    setProfileData((prev) => ({
      ...prev,
      weekly_goals: (prev.weekly_goals || []).filter((g) => g.id !== id),
    }));
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
    const localProfile = loadProfileFromStorage(base);
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
        title: t(
          "profile.activity.titles.completedCodingChallenge",
          "Completed Coding Challenge"
        ),
        desc: t("profile.activity.desc.twoSum", "Two Sum Problem - Score: 92%"),
        time: t("profile.activity.time.2hoursAgo", "2 hours ago"),
        icon: Code,
      },
      {
        type: "learning",
        title: t("profile.activity.titles.learningSession", "Learning Session"),
        desc: t(
          "profile.activity.desc.reactHooks",
          "Completed React Hooks Tutorial"
        ),
        time: t("profile.activity.time.5hoursAgo", "5 hours ago"),
        icon: BookOpen,
      },
      {
        type: "resume",
        title: t("profile.activity.titles.resumeAnalyzed", "Resume Analyzed"),
        desc: t(
          "profile.activity.desc.credibilityScore",
          "Credibility Score: 78/100"
        ),
        time: t("profile.activity.time.1dayAgo", "1 day ago"),
        icon: FileText,
      },
      {
        type: "interview",
        title: t("profile.activity.titles.mockInterview", "Mock Interview"),
        desc: t(
          "profile.activity.desc.technicalInterview",
          "Technical Interview - Readiness: 85%"
        ),
        time: t("profile.activity.time.2daysAgo", "2 days ago"),
        icon: MessageSquare,
      },
      {
        type: "achievement",
        title: t(
          "profile.activity.titles.achievementUnlocked",
          "Achievement Unlocked"
        ),
        desc: t(
          "profile.activity.desc.earnedCodeWarrior",
          'Earned "Code Warrior" badge'
        ),
        time: t("profile.activity.time.3daysAgo", "3 days ago"),
        icon: Award,
      },
      {
        type: "code",
        title: t(
          "profile.activity.titles.completedCodingChallenge",
          "Completed Coding Challenge"
        ),
        desc: t(
          "profile.activity.desc.binarySearch",
          "Binary Search - Score: 88%"
        ),
        time: t("profile.activity.time.4daysAgo", "4 days ago"),
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
      toast.success(
        t("profile.toasts.updatedSuccessfully", "Profile updated successfully!")
      );
    } catch (error) {
      toast.error(t("profile.toasts.updateFailed", "Failed to update profile"));
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
    toast.message(t("profile.toasts.editsDiscarded", "Edits discarded"), {
      duration: 1000,
    });
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

      toast.success(t("profile.toasts.avatarUpdated", "Avatar updated!"));
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
        toast.error(
          t(
            "auth.toasts.sessionExpiredLoginAgain",
            "Session expired. Please login again."
          )
        );
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
        const msg =
          first?.msg || t("profile.errors.validationError", "Validation error");
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
    toast.success(
      t("auth.toasts.loggedOutSuccessfully", "Logged out successfully")
    );
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
      title: t("profile.achievements.firstSteps.title", "First Steps"),
      description: t(
        "profile.achievements.firstSteps.description",
        "Complete your first learning session"
      ),
      icon: "🎯",
      earned: (stats?.learning_sessions || 0) >= 1,
      xp: 10,
    },
    {
      id: 2,
      title: t("profile.achievements.codeWarrior.title", "Code Warrior"),
      description: t(
        "profile.achievements.codeWarrior.description",
        "Submit 10 code solutions"
      ),
      icon: "⚔️",
      earned: (stats?.code_submissions || 0) >= 10,
      xp: 50,
    },
    {
      id: 3,
      title: t("profile.achievements.quickLearner.title", "Quick Learner"),
      description: t(
        "profile.achievements.quickLearner.description",
        "Complete 5 learning sessions"
      ),
      icon: "📖",
      earned: (stats?.learning_sessions || 0) >= 5,
      xp: 25,
    },
    {
      id: 4,
      title: t("profile.achievements.interviewReady.title", "Interview Ready"),
      description: t(
        "profile.achievements.interviewReady.description",
        "Complete 3 mock interviews"
      ),
      icon: "🎤",
      earned: (stats?.interviews_taken || 0) >= 3,
      xp: 30,
    },
    {
      id: 5,
      title: t("profile.achievements.resumePro.title", "Resume Pro"),
      description: t(
        "profile.achievements.resumePro.description",
        "Analyze 3 resumes"
      ),
      icon: "📄",
      earned: (stats?.resume_analyses || 0) >= 3,
      xp: 20,
    },
    {
      id: 6,
      title: t("profile.achievements.topPerformer.title", "Top Performer"),
      description: t(
        "profile.achievements.topPerformer.description",
        "Achieve 90%+ average score"
      ),
      icon: "🏆",
      earned: (stats?.avg_code_score || 0) >= 90,
      xp: 100,
    },
    {
      id: 7,
      title: t(
        "profile.achievements.dedicatedLearner.title",
        "Dedicated Learner"
      ),
      description: t(
        "profile.achievements.dedicatedLearner.description",
        "20+ learning sessions"
      ),
      icon: "📚",
      earned: (stats?.learning_sessions || 0) >= 20,
      xp: 75,
    },
    {
      id: 8,
      title: t("profile.achievements.codeMaster.title", "Code Master"),
      description: t(
        "profile.achievements.codeMaster.description",
        "Submit 50 code solutions"
      ),
      icon: "👨‍💻",
      earned: (stats?.code_submissions || 0) >= 50,
      xp: 150,
    },
    {
      id: 9,
      title: t(
        "profile.achievements.interviewExpert.title",
        "Interview Expert"
      ),
      description: t(
        "profile.achievements.interviewExpert.description",
        "Complete 10 mock interviews"
      ),
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

  const skillsCount = (profileData?.skills || []).filter(Boolean).length;
  const hasMinSkills = skillsCount >= 3;
  const hasAnySocialLink = Boolean(
    (profileData?.github && String(profileData.github).trim()) ||
      (profileData?.linkedin && String(profileData.linkedin).trim()) ||
      (profileData?.portfolio && String(profileData.portfolio).trim())
  );
  const hasPhone = Boolean(
    profileData?.phone && String(profileData.phone).trim()
  );
  const hasLocation = Boolean(
    profileData?.location && String(profileData.location).trim()
  );
  const hasProfileSummary = Boolean(
    profileData?.profile_summary && String(profileData.profile_summary).trim()
  );

  const profileScoreChecks = [
    {
      key: "skills",
      label: t("profile.score.skillsMin", "Skills (min 3)"),
      ok: hasMinSkills,
    },
    {
      key: "social",
      label: t("profile.score.social", "Social media links"),
      ok: hasAnySocialLink,
    },
    { key: "phone", label: t("profile.score.phone", "Phone"), ok: hasPhone },
    {
      key: "location",
      label: t("profile.score.location", "Location"),
      ok: hasLocation,
    },
    {
      key: "summary",
      label: t("profile.score.summary", "Profile summary"),
      ok: hasProfileSummary,
    },
  ];
  const profileScoreCompleted = profileScoreChecks.filter((c) => c.ok).length;
  const profileScore = Math.round(
    (profileScoreCompleted / profileScoreChecks.length) * 100
  );

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
                      {editing
                        ? t("common.cancel", "Cancel")
                        : t("profile.actions.editProfile", "Edit Profile")}
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
                      {t("profile.level", "Level")} {levelInfo.level}{" "}
                      {t("profile.progress", "Progress")}
                    </span>
                    <span className="text-zinc-400">
                      {levelInfo.xp}/{levelInfo.nextXp} {t("profile.xp", "XP")}
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
              {t("profile.tabs.overview", "Overview")}
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {t("profile.tabs.statistics", "Statistics")}
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Trophy className="w-4 h-4" />
              {t("profile.tabs.achievements", "Achievements")}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Activity className="w-4 h-4" />
              {t("profile.tabs.activity", "Activity")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Settings className="w-4 h-4" />
              {t("profile.tabs.settings", "Settings")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
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
                          placeholder={t(
                            "profile.placeholders.location",
                            "City, Country"
                          )}
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
                        placeholder={t(
                          "profile.placeholders.bio",
                          "A short summary about you"
                        )}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {profileData.bio ||
                          t("profile.empty.bio", "No bio added yet")}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <Button onClick={handleSaveProfile} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {t("common.saveChanges", "Save Changes")}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: profile sections */}
                <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                  {/* Section cards (stored in DB in users.profile_data) */}
                  {[
                    {
                      key: "profile_summary",
                      title: t(
                        "profile.sections.profile_summary.title",
                        "Profile Summary"
                      ),
                      icon: FileText,
                      placeholder: t(
                        "profile.sections.profile_summary.placeholder",
                        "Write a concise profile summary..."
                      ),
                    },
                    {
                      key: "roll_no",
                      title: t(
                        "profile.sections.roll_no.title",
                        "Roll No / ID"
                      ),
                      icon: Shield,
                      placeholder: t(
                        "profile.sections.roll_no.placeholder",
                        "Ex: 22KP1A44A9"
                      ),
                    },
                    {
                      key: "degree",
                      title: t("profile.sections.degree.title", "Degree"),
                      icon: GraduationCap,
                      placeholder: t(
                        "profile.sections.degree.placeholder",
                        "Ex: Bachelor of Technology"
                      ),
                    },
                    {
                      key: "branch",
                      title: t(
                        "profile.sections.branch.title",
                        "Branch / Department"
                      ),
                      icon: Code,
                      placeholder: t(
                        "profile.sections.branch.placeholder",
                        "Ex: Computer Science & Engineering"
                      ),
                    },
                    {
                      key: "institute",
                      title: t(
                        "profile.sections.institute.title",
                        "Institute / College"
                      ),
                      icon: BookOpen,
                      placeholder: t(
                        "profile.sections.institute.placeholder",
                        "Ex: NRI Institute of Technology, Guntur"
                      ),
                    },

                    {
                      key: "technical_tools",
                      title: t(
                        "profile.sections.technical_tools.title",
                        "Technical Skills (Tools)"
                      ),
                      icon: Settings,
                      placeholder: t(
                        "profile.sections.technical_tools.placeholder",
                        "Ex: Power BI, Git"
                      ),
                    },
                    {
                      key: "soft_skills",
                      title: t(
                        "profile.sections.soft_skills.title",
                        "Soft Skills"
                      ),
                      icon: Sparkles,
                      placeholder: t(
                        "profile.sections.soft_skills.placeholder",
                        "Ex: Communication, Teamwork, Self-Learning, Critical Thinking"
                      ),
                    },
                    {
                      key: "education",
                      title: t("profile.sections.education.title", "Education"),
                      icon: GraduationCap,
                      placeholder: t(
                        "profile.sections.education.placeholder",
                        "Use one line per education entry.\nOptional: use '|' to align right-side info (CGPA/Score).\n\nExample:\nNRI Institute of Technology, Guntur (2022-2026) | CGPA: 8.4\nSri Karthikeya Junior College (2020-2022) | MPC: 76.9%"
                      ),
                    },
                    {
                      key: "projects",
                      title: t("profile.sections.projects.title", "Project"),
                      icon: Rocket,
                      placeholder: t(
                        "profile.sections.projects.placeholder",
                        "Tip: use 'Title: description' to match the template.\n\nExample:\nAI System Assistant Chatbot: NLP-based chatbot using LLM to answer technical queries.\nPortfolio Website: Responsive website showcasing projects and skills.\nPower BI Dashboards: Interactive dashboards using Power BI."
                      ),
                    },
                    {
                      key: "final_year_project",
                      title: t(
                        "profile.sections.final_year_project.title",
                        "Internship"
                      ),
                      icon: Briefcase,
                      placeholder: t(
                        "profile.sections.final_year_project.placeholder",
                        "Use one line per internship.\nOptional: use '|' to align dates on the right.\n\nExample:\nSupraja Tech — Ethical Hacking Trainee | May - Jul 2025\nAIMER Society (AI Internship) | Jun 2024\n- Worked on AI projects..."
                      ),
                    },
                    {
                      key: "certifications",
                      title: t(
                        "profile.sections.certifications.title",
                        "Certifications"
                      ),
                      icon: Award,
                      placeholder: t(
                        "profile.sections.certifications.placeholder",
                        "Ex: AWS Cloud Practitioner (2025)"
                      ),
                    },
                    {
                      key: "achievements_text",
                      title: t(
                        "profile.sections.achievements_text.title",
                        "Achievements"
                      ),
                      icon: Trophy,
                      placeholder: t(
                        "profile.sections.achievements_text.placeholder",
                        "Use one achievement per line.\nExample:\nWinner — Chatbot Hackathon\nParticipant — Cloud AI Training"
                      ),
                    },
                    {
                      key: "languages",
                      title: t("profile.sections.languages.title", "Languages"),
                      icon: Globe,
                      placeholder: t(
                        "profile.sections.languages.placeholder",
                        "Ex: English, Telugu, Hindi"
                      ),
                    },
                    {
                      key: "hobbies",
                      title: t("profile.sections.hobbies.title", "Hobbies"),
                      icon: Heart,
                      placeholder: t(
                        "profile.sections.hobbies.placeholder",
                        "Ex: Exploring AI tools, Blogging, Playing free fire, Traveling"
                      ),
                    },
                    {
                      key: "declaration",
                      title: t(
                        "profile.sections.declaration.title",
                        "Declaration"
                      ),
                      icon: Lock,
                      placeholder: t(
                        "profile.sections.declaration.placeholder",
                        "Ex: I hereby declare that the above information is true to the best of my knowledge..."
                      ),
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

                {/* Right: widgets (mobile-first ordering before Profile Summary) */}
                <div className="order-1 lg:order-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t("profile.widgets.score", "Your Profile Score")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "profile.score.subtitle",
                          "Real-time completeness score based on key profile info"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {t("profile.score.score", "Score")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profileScoreCompleted}/{profileScoreChecks.length}{" "}
                            {t("profile.score.itemsComplete", "items complete")}
                          </p>
                        </div>
                        <Badge variant="secondary">{profileScore}%</Badge>
                      </div>

                      <Progress value={profileScore} />

                      <div className="space-y-2">
                        {profileScoreChecks.map((c) => (
                          <div
                            key={c.key}
                            className="flex items-center justify-between gap-3"
                          >
                            <p className="text-sm text-muted-foreground">
                              {c.label}
                            </p>
                            {c.ok ? (
                              <span className="inline-flex items-center gap-1 text-sm text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                {t("common.added", "Added")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <AlertTriangle className="w-4 h-4" />
                                {t("common.missing", "Missing")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {!editing && profileScore < 100 ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            toggleEditing();
                            setActiveTab("overview");
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          {t("profile.score.addMissing", "Add missing info")}
                        </Button>
                      ) : null}

                      <p className="text-xs text-muted-foreground">
                        {t(
                          "profile.score.skillsRequirement",
                          "Skills requirement: at least 3 skills."
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Share2 className="w-5 h-5 text-primary" />
                        {t("profile.widgets.sharing", "Profile Sharing")}
                      </CardTitle>
                      <CardDescription>
                        Visibility setting + shareable profile link
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Visibility</p>
                          <p className="text-xs text-muted-foreground">
                            Public/private is stored in your profile
                          </p>
                        </div>

                        {editing ? (
                          <Select
                            value={profileData.visibility || "private"}
                            onValueChange={(v) =>
                              setProfileData({
                                ...profileData,
                                visibility: v,
                              })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue
                                placeholder={t(
                                  "profile.visibility.label",
                                  "Visibility"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">
                                {t("profile.visibility.private", "Private")}
                              </SelectItem>
                              <SelectItem value="public">
                                {t("profile.visibility.public", "Public")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary">
                            {(
                              profileData.visibility || "private"
                            ).toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:flex-1"
                          onClick={copyProfileLink}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          {t("profile.sharing.copyLink", "Copy Profile Link")}
                        </Button>
                        <Button
                          type="button"
                          className="w-full sm:flex-1"
                          onClick={handleSaveProfile}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {t("common.save", "Save")}
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground break-all">
                        Link: {getShareableProfileLink()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="w-5 h-5 text-primary" />
                        {t("profile.widgets.atsResume", "ATS Resume")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "profile.ats.subtitle",
                          "Generate an ATS-friendly resume from your profile"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          className="w-full sm:flex-1"
                          onClick={() => openAtsTemplatePicker("view")}
                          disabled={atsBusy}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t("profile.ats.viewTemplates", "View Templates")}
                        </Button>
                        <Button
                          className="w-full sm:flex-1"
                          onClick={() => openAtsTemplatePicker("download")}
                          disabled={atsBusy}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t(
                            "profile.ats.downloadTemplate",
                            "Download Template"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected:{" "}
                        {atsTemplates.find(
                          (template) => template.id === atsTemplateId
                        )?.name || "Classic"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tip: keep your Education, Experience, Projects, and
                        Skills updated for best results.
                      </p>
                    </CardContent>
                  </Card>

                  <Dialog open={atsDialogOpen} onOpenChange={setAtsDialogOpen}>
                    <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {t(
                            "profile.ats.chooseTemplate",
                            "Choose an ATS Resume Template"
                          )}
                        </DialogTitle>
                        <DialogDescription>
                          {atsAction === "download"
                            ? t(
                                "profile.ats.pickDownload",
                                "Pick a template to download instantly."
                              )
                            : t(
                                "profile.ats.pickPreview",
                                "Pick a template to preview instantly."
                              )}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {atsTemplates.map((template) => {
                          const active = template.id === atsTemplateId;
                          return (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() =>
                                handleChooseAtsTemplate(template.id)
                              }
                              disabled={atsBusy}
                              className={
                                "text-left rounded-lg border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 " +
                                (active
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted")
                              }
                              aria-pressed={active}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium leading-none">
                                    {template.name}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {template.desc}
                                  </p>
                                </div>
                                {active ? (
                                  <Badge variant="secondary">
                                    {t("common.selected", "Selected")}
                                  </Badge>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "profile.ats.usesCurrentSections",
                            "This uses your current profile sections."
                          )}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAtsDialogOpen(false)}
                          disabled={atsBusy}
                          className="w-full sm:w-auto"
                        >
                          {t("common.close", "Close")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t("profile.widgets.skills", "Skills")}
                      </CardTitle>
                      <CardDescription>
                        {editing
                          ? t(
                              "profile.skills.editHint",
                              "Click a skill to remove"
                            )
                          : t(
                              "profile.skills.subtitle",
                              "Your highlighted skills"
                            )}
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
                              onClick={() =>
                                editing && handleRemoveSkill(skill)
                              }
                            >
                              {skill}
                              {editing && <X className="w-3 h-3 ml-1" />}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("profile.skills.none", "No skills added yet")}
                          </p>
                        )}
                      </div>
                      {editing && (
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder={t(
                              "profile.skills.addPlaceholder",
                              "Add a skill..."
                            )}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddSkill()
                            }
                          />
                          <Button onClick={handleAddSkill} size="sm">
                            {t("common.add", "Add")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Link2 className="w-5 h-5 text-primary" />
                        {t("profile.widgets.onlineProfiles", "Online Profiles")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "profile.onlineProfiles.subtitle",
                          "GitHub, LinkedIn and Portfolio links"
                        )}
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
                              placeholder={t(
                                "profile.onlineProfiles.githubPlaceholder",
                                "GitHub username or URL"
                              )}
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
                                const normalized = ensureHttpsUrl(
                                  e.target.value
                                );
                                if (normalized !== profileData.linkedin) {
                                  setProfileData({
                                    ...profileData,
                                    linkedin: normalized,
                                  });
                                }
                              }}
                              placeholder={t(
                                "profile.onlineProfiles.linkedinPlaceholder",
                                "LinkedIn profile URL"
                              )}
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
                                const normalized = ensureHttpsUrl(
                                  e.target.value
                                );
                                if (normalized !== profileData.portfolio) {
                                  setProfileData({
                                    ...profileData,
                                    portfolio: normalized,
                                  });
                                }
                              }}
                              placeholder={t(
                                "profile.onlineProfiles.portfolioPlaceholder",
                                "Portfolio URL"
                              )}
                            />
                          </div>
                          <Button
                            onClick={handleSaveProfile}
                            className="w-full"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t(
                              "profile.onlineProfiles.saveLinks",
                              "Save Links"
                            )}
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
                                <span className="text-sm">
                                  {t("brand.github", "GitHub")}
                                </span>
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
                                <span className="text-sm">
                                  {t("brand.linkedin", "LinkedIn")}
                                </span>
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
                                <span className="text-sm">
                                  {t("brand.portfolio", "Portfolio")}
                                </span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </a>
                          ) : null}

                          {!profileData.github &&
                          !profileData.linkedin &&
                          !profileData.portfolio ? (
                            <p className="text-sm text-muted-foreground">
                              {t(
                                "profile.onlineProfiles.none",
                                "No links added yet"
                              )}
                            </p>
                          ) : null}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="w-5 h-5 text-primary" />
                        {t("profile.widgets.weeklyGoals", "Weekly Goals")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "profile.weeklyGoals.subtitle",
                          "Track goals you want to finish this week"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(profileData.weekly_goals || []).length > 0 ? (
                        <div className="space-y-2">
                          {(profileData.weekly_goals || []).map((g) => (
                            <div
                              key={g.id}
                              className="flex items-start gap-3 rounded-md border border-border p-3"
                            >
                              <Checkbox
                                checked={!!g.done}
                                onCheckedChange={() => toggleWeeklyGoal(g.id)}
                                aria-label={`Mark goal as ${
                                  g.done ? "not done" : "done"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={
                                    "text-sm " +
                                    (g.done
                                      ? "line-through text-muted-foreground"
                                      : "")
                                  }
                                >
                                  {g.text}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeWeeklyGoal(g.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("profile.weeklyGoals.none", "No goals added yet.")}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newGoalText}
                          onChange={(e) => setNewGoalText(e.target.value)}
                          placeholder={t(
                            "profile.weeklyGoals.addPlaceholder",
                            "Add a weekly goal (e.g., Solve 15 problems)"
                          )}
                          onKeyDown={(e) =>
                            e.key === "Enter" && addWeeklyGoal()
                          }
                        />
                        <Button
                          type="button"
                          onClick={addWeeklyGoal}
                          className="w-full sm:w-auto"
                        >
                          {t("common.add", "Add")}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleSaveProfile}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Goals
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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
                  <p className="text-sm text-zinc-400">
                    {t("profile.stats.averageScore", "Average Score")}
                  </p>
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
                  <p className="text-sm text-zinc-400">
                    {t("profile.stats.learningSessions", "Learning Sessions")}
                  </p>
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
                  <p className="text-sm text-zinc-400">
                    {t("profile.stats.mockInterviews", "Mock Interviews")}
                  </p>
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
                    {t(
                      "profile.stats.performanceOverview",
                      "Performance Overview"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">
                        {t("profile.stats.codingSkills", "Coding Skills")}
                      </span>
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
                      <span className="text-zinc-400">
                        {t(
                          "profile.stats.interviewReadiness",
                          "Interview Readiness"
                        )}
                      </span>
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
                      <span className="text-zinc-400">
                        {t(
                          "profile.stats.learningProgress",
                          "Learning Progress"
                        )}
                      </span>
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
                    {t("profile.stats.xpBreakdown", "XP Breakdown")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">
                      {t("profile.stats.xp.fromCoding", "From Coding")}
                    </span>
                    <span className="text-white font-bold">
                      {(stats?.code_submissions || 0) * 10} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">
                      {t("profile.stats.xp.fromLearning", "From Learning")}
                    </span>
                    <span className="text-white font-bold">
                      {(stats?.learning_sessions || 0) * 5} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">
                      {t("profile.stats.xp.fromInterviews", "From Interviews")}
                    </span>
                    <span className="text-white font-bold">
                      {(stats?.interviews_taken || 0) * 15} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-zinc-400">
                      {t(
                        "profile.stats.xp.fromAchievements",
                        "From Achievements"
                      )}
                    </span>
                    <span className="text-white font-bold">
                      {totalXpEarned} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-900/50 to-orange-900/50 rounded-lg border border-orange-500/30">
                    <span className="text-white font-medium">
                      {t("profile.stats.xp.totalXp", "Total XP")}
                    </span>
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
                      {t("profile.achievements.title", "Achievements")}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {earnedAchievements.length} of {achievements.length}{" "}
                      {t("profile.achievements.unlocked", "unlocked")}
                    </CardDescription>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Gem className="w-3 h-3 mr-1" />
                    {totalXpEarned} {t("profile.stats.xpEarned", "XP Earned")}
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
                          {t(
                            "profile.achievements.status.unlocked",
                            "Unlocked"
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-zinc-500 text-sm">
                          <Lock className="w-4 h-4" />
                          {t("profile.achievements.status.locked", "Locked")}
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
                  {t("profile.activity.recent", "Recent Activity")}
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
                    {t("settings.sidebar.notifications", "Notifications")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {t(
                          "profile.settings.notifications.email.title",
                          "Email notifications"
                        )}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {t(
                          "profile.settings.notifications.email.description",
                          "Receive updates via email"
                        )}
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
                        {t(
                          "profile.settings.notifications.reminders.title",
                          "Learning reminders"
                        )}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {t(
                          "profile.settings.notifications.reminders.description",
                          "Daily learning reminders"
                        )}
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
                        {t(
                          "profile.settings.notifications.achievements.title",
                          "Achievement alerts"
                        )}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {t(
                          "profile.settings.notifications.achievements.description",
                          "Get notified on new achievements"
                        )}
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
                    {t(
                      "profile.settings.notifications.manageAll",
                      "Manage all notification settings"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    {t("settings.sidebar.security", "Security")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setSettingsRedirectTabAndGo("security")}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {t("settings.security.changePassword", "Change Password")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => setSettingsRedirectTabAndGo("security")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t(
                      "profile.settings.security.twoFactor",
                      "Two-Factor Authentication"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("profile.actions.signOut", "Sign Out")}
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
                      {t("settings.data.dangerZone", "Danger Zone")}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {t(
                        "settings.data.deleteAccountDescription",
                        "Permanently delete your account and all data"
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    onClick={() => setSettingsRedirectTabAndGo("data")}
                  >
                    {t("settings.data.deleteAccount", "Delete Account")}
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
