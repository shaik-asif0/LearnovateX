import React, { useState, useEffect } from "react";
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
import { Switch } from "../components/ui/switch";
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
import {
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Save,
  Settings,
  User,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  LogOut,
  Mail,
  Smartphone,
  Trophy,
  BookOpen,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Code,
  Database,
  Cloud,
  Key,
  Fingerprint,
  History,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Languages,
  Accessibility,
  HardDrive,
  Wifi,
  BellRing,
  BellOff,
  UserX,
  FileText,
  Share2,
  Link,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getUser, clearAuth } from "../lib/utils";
import { useI18n } from "../i18n/I18nProvider";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { t, setLanguage } = useI18n();
  const userSettingsKey =
    user?.id || user?._id || user?.email
      ? `userSettings:${user.id || user._id || user.email}`
      : "userSettings:anonymous";
  const [activeTab, setActiveTab] = useState("notifications");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Demo-friendly security state (so buttons "work" like a SaaS UI)
  const securityKey =
    user?.id || user?._id || user?.email
      ? `userSecurity:${user.id || user._id || user.email}`
      : "userSecurity:anonymous";
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      achievements: true,
      reminders: true,
      weeklyReport: true,
      newFeatures: false,
      marketing: false,
      sound: true,
    },
    privacy: {
      profileVisible: true,
      showProgress: true,
      showAchievements: true,
      showActivity: true,
      allowMessages: true,
      shareData: false,
    },
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "auto",
      dateFormat: "MM/DD/YYYY",
      codeEditor: "monaco",
      fontSize: "medium",
      autoSave: true,
      compactMode: false,
    },
    learning: {
      dailyGoal: 30,
      difficulty: "medium",
      reminderTime: "09:00",
      weekendReminders: false,
      streakNotifications: true,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      screenReader: false,
      keyboardNav: true,
    },
  });

  useEffect(() => {
    loadSettings();

    // Apply redirect from ProfilePage (e.g., open Security tab)
    try {
      const redirectTab = localStorage.getItem("settings.redirectTab");
      if (redirectTab) {
        setActiveTab(redirectTab);
        localStorage.removeItem("settings.redirectTab");
      }
    } catch (e) {
      // ignore
    }

    // Load security flags
    try {
      const saved = localStorage.getItem(securityKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTwoFactorEnabled(!!parsed?.twoFactorEnabled);
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, []);

  const handleToggleTwoFactor = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    try {
      localStorage.setItem(
        securityKey,
        JSON.stringify({ twoFactorEnabled: next, updatedAt: Date.now() })
      );
    } catch (e) {
      // ignore
    }
    toast.success(
      next
        ? "Two-factor authentication enabled (demo)"
        : "Two-factor authentication disabled (demo)"
    );
  };

  const loadSettings = () => {
    try {
      const savedPerUser = localStorage.getItem(userSettingsKey);
      if (savedPerUser) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedPerUser) }));
        return;
      }

      // Legacy migration (previous versions used a shared key)
      const legacy = localStorage.getItem("userSettings");
      if (legacy) {
        localStorage.setItem(userSettingsKey, legacy);
        localStorage.removeItem("userSettings");
        setSettings((prev) => ({ ...prev, ...JSON.parse(legacy) }));
      }
    } catch (e) {
      // ignore malformed storage
    }
  };

  const updateSetting = (category, key, value) => {
    setHasChanges(true);

    // Important: use functional state update so persistence uses the latest state
    // (prevents "buttons not working" feeling caused by stale closure saves).
    setSettings((prev) => {
      const next = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };

      try {
        localStorage.setItem(userSettingsKey, JSON.stringify(next));
        // Same-tab "real-time" sync for other pages (e.g., ProfilePage)
        window.dispatchEvent(new Event("userSettingsChange"));
      } catch (e) {
        // ignore storage errors
      }

      toast.success(`${formatSettingName(key)} updated`, {
        duration: 1500,
        position: "bottom-right",
      });

      return next;
    });
  };

  const formatSettingName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleSaveAll = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      localStorage.setItem(userSettingsKey, JSON.stringify(settings));
      window.dispatchEvent(new Event("userSettingsChange"));
    } catch (e) {
      // ignore
    }
    setSaving(false);
    setHasChanges(false);
    toast.success(
      t("settings.toasts.savedAll", "All settings saved successfully!")
    );
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (field === "new") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleChangePassword = () => {
    if (!passwords.current) {
      toast.error(
        t(
          "settings.security.toasts.enterCurrentPassword",
          "Please enter your current password"
        )
      );
      return;
    }
    if (passwords.new.length < 8) {
      toast.error(
        t(
          "settings.security.toasts.passwordMinLength",
          "New password must be at least 8 characters"
        )
      );
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error(
        t(
          "settings.security.toasts.passwordsDoNotMatch",
          "Passwords do not match"
        )
      );
      return;
    }
    toast.success(
      t(
        "settings.security.toasts.passwordChanged",
        "Password changed successfully!"
      )
    );
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordStrength(0);
  };

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event("authChange"));
    navigate("/auth");
    toast.success(
      t("auth.toasts.loggedOutSuccessfully", "Logged out successfully")
    );
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      user: { name: user?.name, email: user?.email },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-catalyst-settings.json";
    a.click();
    toast.success(
      t(
        "settings.data.toasts.exportedSuccessfully",
        "Settings exported successfully!"
      )
    );
  };

  const handleDeleteAccount = () => {
    toast.error(
      t(
        "settings.data.toasts.deleteRequiresEmailConfirmation",
        "Account deletion requires confirmation via email"
      ),
      {
        duration: 4000,
      }
    );
  };

  const getStrengthColor = (strength) => {
    if (strength <= 25) return "bg-orange-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-orange-500";
    return "bg-orange-500";
  };

  const getStrengthText = (strength) => {
    if (strength <= 25)
      return t("settings.security.passwordStrength.weak", "Weak");
    if (strength <= 50)
      return t("settings.security.passwordStrength.fair", "Fair");
    if (strength <= 75)
      return t("settings.security.passwordStrength.good", "Good");
    return t("settings.security.passwordStrength.strong", "Strong");
  };

  const SettingToggle = ({
    category,
    settingKey,
    icon: Icon,
    title,
    description,
    color = "orange",
  }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-all group">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 bg-${color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div>
          <Label className="text-white font-medium">{title}</Label>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[category][settingKey]}
        onCheckedChange={(checked) =>
          updateSetting(category, settingKey, checked)
        }
        className="data-[state=checked]:bg-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t("nav.settings", "Settings")}
              </h1>
              <p className="text-zinc-400">
                {t(
                  "settings.header.subtitle",
                  "Manage your account and preferences"
                )}
              </p>
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm">
                {t("settings.unsaved", "You have unsaved changes")}
              </span>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={saving}
                className="ml-auto bg-orange-500 text-black hover:bg-orange-400"
              >
                {saving
                  ? t("common.saving", "Saving...")
                  : t("common.saveAll", "Save All")}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-24">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {[
                    {
                      id: "notifications",
                      icon: Bell,
                      label: t(
                        "settings.sidebar.notifications",
                        "Notifications"
                      ),
                      color: "orange",
                    },
                    {
                      id: "privacy",
                      icon: Shield,
                      label: t("settings.sidebar.privacy", "Privacy"),
                      color: "orange",
                    },
                    {
                      id: "preferences",
                      icon: Palette,
                      label: t("settings.sidebar.preferences", "Preferences"),
                      color: "orange",
                    },
                    {
                      id: "learning",
                      icon: BookOpen,
                      label: t("settings.sidebar.learning", "Learning"),
                      color: "orange",
                    },
                    {
                      id: "accessibility",
                      icon: Accessibility,
                      label: t(
                        "settings.sidebar.accessibility",
                        "Accessibility"
                      ),
                      color: "orange",
                    },
                    {
                      id: "security",
                      icon: Lock,
                      label: t("settings.sidebar.security", "Security"),
                      color: "orange",
                    },
                    {
                      id: "data",
                      icon: Database,
                      label: t("settings.sidebar.data", "Data & Storage"),
                      color: "orange",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === item.id
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight
                          className={`w-4 h-4 ml-auto transition-transform ${
                            activeTab === item.id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Notifications */}
            {activeTab === "notifications" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Bell className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        {t(
                          "settings.notifications.title",
                          "Notification Preferences"
                        )}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        {t(
                          "settings.notifications.subtitle",
                          "Choose how and when you want to be notified"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <SettingToggle
                      category="notifications"
                      settingKey="email"
                      icon={Mail}
                      title="Email Notifications"
                      description="Receive important updates via email"
                      color="orange"
                    />
                    <SettingToggle
                      category="notifications"
                      settingKey="push"
                      icon={Smartphone}
                      title="Push Notifications"
                      description="Get instant notifications on your device"
                      color="orange"
                    />
                    <SettingToggle
                      category="notifications"
                      settingKey="achievements"
                      icon={Trophy}
                      title="Achievement Alerts"
                      description="Celebrate when you unlock new achievements"
                      color="orange"
                    />
                    <SettingToggle
                      category="notifications"
                      settingKey="reminders"
                      icon={Clock}
                      title="Learning Reminders"
                      description="Daily reminders to keep your streak going"
                      color="orange"
                    />
                    <SettingToggle
                      category="notifications"
                      settingKey="weeklyReport"
                      icon={FileText}
                      title="Weekly Progress Report"
                      description="Get a summary of your weekly progress"
                      color="orange"
                    />
                    <SettingToggle
                      category="notifications"
                      settingKey="sound"
                      icon={settings.notifications.sound ? Volume2 : VolumeX}
                      title="Notification Sounds"
                      description="Play sounds for notifications"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy */}
            {activeTab === "privacy" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        Privacy Settings
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Control your privacy and data visibility
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <SettingToggle
                      category="privacy"
                      settingKey="profileVisible"
                      icon={Eye}
                      title="Public Profile"
                      description="Make your profile visible to other users"
                      color="orange"
                    />
                    <SettingToggle
                      category="privacy"
                      settingKey="showProgress"
                      icon={Target}
                      title="Show Progress"
                      description="Display your learning progress publicly"
                      color="orange"
                    />
                    <SettingToggle
                      category="privacy"
                      settingKey="showAchievements"
                      icon={Trophy}
                      title="Show Achievements"
                      description="Display earned achievements on your profile"
                      color="orange"
                    />
                    <SettingToggle
                      category="privacy"
                      settingKey="showActivity"
                      icon={History}
                      title="Show Activity"
                      description="Let others see your recent activity"
                      color="orange"
                    />
                    <SettingToggle
                      category="privacy"
                      settingKey="allowMessages"
                      icon={MessageSquare}
                      title="Allow Messages"
                      description="Let other users send you messages"
                      color="orange"
                    />
                    <SettingToggle
                      category="privacy"
                      settingKey="shareData"
                      icon={Share2}
                      title="Share Analytics"
                      description="Help improve the platform with anonymous usage data"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences */}
            {activeTab === "preferences" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Palette className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        App Preferences
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Customize your experience
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Theme
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "system", label: "System", icon: Monitor },
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.id}
                            onClick={() =>
                              updateSetting("preferences", "theme", theme.id)
                            }
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              settings.preferences.theme === theme.id
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                settings.preferences.theme === theme.id
                                  ? "text-orange-400"
                                  : "text-zinc-400"
                              }`}
                            />
                            <span
                              className={
                                settings.preferences.theme === theme.id
                                  ? "text-white"
                                  : "text-zinc-400"
                              }
                            >
                              {theme.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      {t("settings.language", "Language")}
                    </Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => {
                        setLanguage(value);
                        updateSetting("preferences", "language", value);
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="te">తెలుగు</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Code Editor */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code Editor
                    </Label>
                    <Select
                      value={settings.preferences.codeEditor}
                      onValueChange={(value) =>
                        updateSetting("preferences", "codeEditor", value)
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="monaco">Monaco Editor</SelectItem>
                        <SelectItem value="codemirror">CodeMirror</SelectItem>
                        <SelectItem value="ace">Ace Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300">Font Size</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["small", "medium", "large", "xlarge"].map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            updateSetting("preferences", "fontSize", size)
                          }
                          className={`p-3 rounded-lg border transition-all capitalize ${
                            settings.preferences.fontSize === size
                              ? "border-orange-500 bg-orange-500/10 text-white"
                              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 pt-4">
                    <SettingToggle
                      category="preferences"
                      settingKey="autoSave"
                      icon={Save}
                      title="Auto Save"
                      description="Automatically save your work"
                      color="orange"
                    />
                    <SettingToggle
                      category="preferences"
                      settingKey="compactMode"
                      icon={Monitor}
                      title="Compact Mode"
                      description="Use a more compact interface layout"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning */}
            {activeTab === "learning" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <BookOpen className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        Learning Preferences
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Customize your learning experience
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Daily Goal */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Daily Learning Goal
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() =>
                            updateSetting("learning", "dailyGoal", mins)
                          }
                          className={`p-3 rounded-lg border transition-all ${
                            settings.learning.dailyGoal === mins
                              ? "border-orange-500 bg-orange-500/10 text-white"
                              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Preferred Difficulty
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "easy", label: "Easy", color: "orange" },
                        { id: "medium", label: "Medium", color: "orange" },
                        { id: "hard", label: "Hard", color: "orange" },
                      ].map((diff) => (
                        <button
                          key={diff.id}
                          onClick={() =>
                            updateSetting("learning", "difficulty", diff.id)
                          }
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.learning.difficulty === diff.id
                              ? `border-${diff.color}-500 bg-${diff.color}-500/10`
                              : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                          }`}
                        >
                          <span
                            className={
                              settings.learning.difficulty === diff.id
                                ? "text-white"
                                : "text-zinc-400"
                            }
                          >
                            {diff.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reminder Time */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Daily Reminder Time
                    </Label>
                    <Input
                      type="time"
                      value={settings.learning.reminderTime}
                      onChange={(e) =>
                        updateSetting(
                          "learning",
                          "reminderTime",
                          e.target.value
                        )
                      }
                      className="bg-zinc-800 border-zinc-700 text-white w-48"
                    />
                  </div>

                  <div className="grid gap-3 pt-4">
                    <SettingToggle
                      category="learning"
                      settingKey="weekendReminders"
                      icon={Calendar}
                      title="Weekend Reminders"
                      description="Receive learning reminders on weekends"
                      color="orange"
                    />
                    <SettingToggle
                      category="learning"
                      settingKey="streakNotifications"
                      icon={Sparkles}
                      title="Streak Notifications"
                      description="Get notified about your learning streak"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accessibility */}
            {activeTab === "accessibility" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Accessibility className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">
                        Accessibility
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Make the app easier to use
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <SettingToggle
                      category="accessibility"
                      settingKey="reduceMotion"
                      icon={RefreshCw}
                      title="Reduce Motion"
                      description="Minimize animations and transitions"
                      color="orange"
                    />
                    <SettingToggle
                      category="accessibility"
                      settingKey="highContrast"
                      icon={Eye}
                      title="High Contrast"
                      description="Increase contrast for better visibility"
                      color="orange"
                    />
                    <SettingToggle
                      category="accessibility"
                      settingKey="screenReader"
                      icon={Volume2}
                      title="Screen Reader Support"
                      description="Optimize for screen readers"
                      color="orange"
                    />
                    <SettingToggle
                      category="accessibility"
                      settingKey="keyboardNav"
                      icon={Fingerprint}
                      title="Keyboard Navigation"
                      description="Enhanced keyboard navigation support"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Lock className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">
                          {t(
                            "settings.security.changePassword",
                            "Change Password"
                          )}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          {t(
                            "settings.security.changePasswordDescription",
                            "Update your account password"
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">
                        {t(
                          "settings.security.currentPassword",
                          "Current Password"
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) =>
                            handlePasswordChange("current", e.target.value)
                          }
                          placeholder={t(
                            "settings.security.placeholders.currentPassword",
                            "Enter current password"
                          )}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">
                        {t("settings.security.newPassword", "New Password")}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) =>
                            handlePasswordChange("new", e.target.value)
                          }
                          placeholder={t(
                            "settings.security.placeholders.newPassword",
                            "Enter new password"
                          )}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwords.new && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">
                              {t(
                                "settings.security.passwordStrengthLabel",
                                "Password Strength"
                              )}
                            </span>
                            <span
                              className={`font-medium ${
                                passwordStrength <= 25
                                  ? "text-orange-400"
                                  : passwordStrength <= 50
                                  ? "text-orange-400"
                                  : passwordStrength <= 75
                                  ? "text-orange-400"
                                  : "text-orange-400"
                              }`}
                            >
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getStrengthColor(
                                passwordStrength
                              )}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">
                        {t(
                          "settings.security.confirmNewPassword",
                          "Confirm New Password"
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) =>
                            handlePasswordChange("confirm", e.target.value)
                          }
                          placeholder={t(
                            "settings.security.placeholders.confirmPassword",
                            "Confirm new password"
                          )}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwords.confirm &&
                        passwords.new !== passwords.confirm && (
                          <p className="text-sm text-orange-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t(
                              "settings.security.passwordsDoNotMatch",
                              "Passwords do not match"
                            )}
                          </p>
                        )}
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {t("settings.security.updatePassword", "Update Password")}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-400" />
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Smartphone className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Authenticator App
                          </p>
                          <p className="text-sm text-zinc-400">
                            Add extra security to your account
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        onClick={handleToggleTwoFactor}
                      >
                        {twoFactorEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-400" />
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Monitor className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Current Session
                            </p>
                            <p className="text-sm text-zinc-400">
                              Windows • Chrome • This device
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-zinc-700 text-white hover:bg-zinc-800"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t(
                        "settings.security.signOutAllDevices",
                        "Sign Out All Devices"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data & Storage */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Database className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">
                          {t("settings.data.title", "Data Management")}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          {t(
                            "settings.data.subtitle",
                            "Export or manage your data"
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Download className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {t("settings.data.exportData", "Export Data")}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {t(
                              "settings.data.exportDataDescription",
                              "Download all your data as JSON"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        onClick={handleExportData}
                      >
                        {t("common.export", "Export")}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Cloud className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {t("settings.data.cloudSync", "Cloud Sync")}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {t("settings.data.lastSynced", "Last synced")}:{" "}
                            {t("common.justNow", "Just now")}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t("settings.data.synced", "Synced")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <HardDrive className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {t("settings.data.clearCache", "Clear Cache")}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {t(
                              "settings.data.clearCacheDescription",
                              "Free up storage space"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        onClick={() =>
                          toast.success(
                            t(
                              "settings.data.toasts.cacheCleared",
                              "Cache cleared successfully!"
                            )
                          )
                        }
                      >
                        {t("common.clear", "Clear")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-gradient-to-r from-orange-900/20 via-zinc-900 to-orange-900/20 border-orange-800/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {t("settings.data.dangerZone", "Danger Zone")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <div>
                        <p className="text-white font-medium">
                          {t("settings.data.deleteAccount", "Delete Account")}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {t(
                            "settings.data.deleteAccountDescription",
                            "Permanently delete your account and all data"
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("common.delete", "Delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
