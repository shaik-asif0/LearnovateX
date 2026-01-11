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
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
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
  const [newSkill, setNewSkill] = useState("");
  const [activityHistory, setActivityHistory] = useState([]);

  useEffect(() => {
    fetchStats();
    loadProfileFromStorage();
    generateActivityHistory();
  }, []);

  const loadProfileFromStorage = () => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfileData((prev) => ({ ...prev, ...JSON.parse(savedProfile) }));
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
    const updatedUser = { ...user, name: profileData.name };
    saveUser(updatedUser);
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    setEditing(false);
    toast.success("Profile updated successfully!");
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
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: GraduationCap,
      },
      job_seeker: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: Briefcase,
      },
      company: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
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
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 p-2 bg-zinc-800 rounded-full border border-zinc-700 cursor-pointer hover:bg-zinc-700 transition-colors">
                  <Camera className="w-4 h-4 text-zinc-400" />
                </div>
                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-black flex items-center gap-1">
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
                        {user?.name}
                      </h1>
                      <Badge className={`${roleBadge.color} border`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user?.role?.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user?.email}
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
                      onClick={() => setEditing(!editing)}
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
                <p className="text-2xl font-bold text-white">
                  {stats?.code_submissions || 0}
                </p>
                <p className="text-xs text-zinc-400">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats?.avg_code_score || 0}%
                </p>
                <p className="text-xs text-zinc-400">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats?.learning_sessions || 0}
                </p>
                <p className="text-xs text-zinc-400">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats?.interviews_taken || 0}
                </p>
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
                    <User className="w-5 h-5 text-purple-400" />
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
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
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
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
                      <Sparkles className="w-5 h-5 text-yellow-400" />
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
                      <Link2 className="w-5 h-5 text-blue-400" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Github className="w-5 h-5 text-zinc-400" />
                          <Input
                            value={profileData.github}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                github: e.target.value,
                              })
                            }
                            placeholder="GitHub username"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-5 h-5 text-blue-400" />
                          <Input
                            value={profileData.linkedin}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                linkedin: e.target.value,
                              })
                            }
                            placeholder="LinkedIn profile URL"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-green-400" />
                          <Input
                            value={profileData.portfolio}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                portfolio: e.target.value,
                              })
                            }
                            placeholder="Portfolio website"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {profileData.github && (
                          <a
                            href={`https://github.com/${profileData.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Github className="w-5 h-5 text-zinc-400" />
                            <span className="text-zinc-300">
                              {profileData.github}
                            </span>
                          </a>
                        )}
                        {profileData.linkedin && (
                          <a
                            href={profileData.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Linkedin className="w-5 h-5 text-blue-400" />
                            <span className="text-zinc-300">
                              LinkedIn Profile
                            </span>
                          </a>
                        )}
                        {profileData.portfolio && (
                          <a
                            href={profileData.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Globe className="w-5 h-5 text-green-400" />
                            <span className="text-zinc-300">Portfolio</span>
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
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/30">
                <CardContent className="p-6 text-center">
                  <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {stats?.code_submissions || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Problems Solved</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/30">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {stats?.avg_code_score || 0}%
                  </p>
                  <p className="text-sm text-zinc-400">Average Score</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/30">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {stats?.learning_sessions || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Learning Sessions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/30">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {stats?.interviews_taken || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Mock Interviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
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
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500/30">
                    <span className="text-white font-medium">Total XP</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
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
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {earnedAchievements.length} of {achievements.length}{" "}
                      unlocked
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
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
                          ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                          : "bg-zinc-900 border-zinc-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-4xl">{achievement.icon}</span>
                        {achievement.earned && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
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
                        <div className="flex items-center gap-1 text-green-400 text-sm">
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
                  <Activity className="w-5 h-5 text-green-400" />
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
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Email notifications",
                      desc: "Receive updates via email",
                    },
                    {
                      label: "Learning reminders",
                      desc: "Daily learning reminders",
                    },
                    {
                      label: "Achievement alerts",
                      desc: "Get notified on new achievements",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-zinc-400">{item.desc}</p>
                      </div>
                      <div className="w-12 h-6 bg-zinc-700 rounded-full relative cursor-pointer">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-red-900/20 via-zinc-900 to-red-900/20 border-red-800/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
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
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
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
