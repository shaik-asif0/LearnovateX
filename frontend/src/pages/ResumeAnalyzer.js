import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  Briefcase,
  Users,
  Clock,
  RefreshCw,
  Download,
  Share2,
  Sparkles,
  Brain,
  Zap,
  Shield,
  AlertCircle,
  ChevronRight,
  FileCheck,
  BarChart3,
  CircleDot,
  Flame,
  Trophy,
  ArrowRight,
  History,
  Trash2,
  Filter,
  Bookmark,
  Heart,
  GitCompare,
  Search,
  Settings,
  Globe,
  MessageSquare,
  Copy,
  Bell,
  X,
  Bot,
  Send,
  Info,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Camera,
  Mic,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Edit,
  Plus,
  Minus,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Activity,
  Cpu,
  Database,
  Wifi,
  Battery,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  Layers,
  GitBranch,
  Terminal,
  Code2,
  Palette,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const ResumeAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [livePreview, setLivePreview] = useState("");
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [skillAnalysis, setSkillAnalysis] = useState([]);
  const [keywordAnalysis, setKeywordAnalysis] = useState([]);
  const [atsScore, setAtsScore] = useState(0);
  const [industryMatch, setIndustryMatch] = useState("");
  const [careerSuggestions, setCareerSuggestions] = useState([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState([]);
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonResume, setComparisonResume] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [liveChat, setLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    scoreRange: [0, 100],
    dateRange: null,
    industry: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [lastActivity, setLastActivity] = useState(new Date());

  const scoreIntervalRef = useRef(null);
  const intervalRef = useRef(null);

  const analysisSteps = [
    { label: "Reading PDF", icon: FileText, duration: 1000 },
    { label: "Extracting Text", icon: Search, duration: 1500 },
    { label: "AI Content Analysis", icon: Brain, duration: 2000 },
    { label: "Skill Verification", icon: Shield, duration: 1500 },
    { label: "ATS Compatibility Check", icon: Target, duration: 1200 },
    { label: "Keyword Optimization", icon: Search, duration: 1000 },
    { label: "Industry Matching", icon: Briefcase, duration: 1200 },
    { label: "Career Path Analysis", icon: TrendingUp, duration: 1500 },
    { label: "Competitor Benchmarking", icon: Users, duration: 1200 },
    { label: "Generating Recommendations", icon: Lightbulb, duration: 1800 },
    { label: "Final Scoring", icon: BarChart3, duration: 1000 },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "AI Credibility Score",
      desc: "Advanced ML model analyzes resume quality, authenticity, and market competitiveness",
      color: "text-blue-400 bg-blue-500/20",
      premium: false,
    },
    {
      icon: Shield,
      title: "Skill Verification",
      desc: "AI detects potentially exaggerated skills and suggests better alternatives",
      color: "text-orange-400 bg-orange-500/20",
      premium: false,
    },
    {
      icon: Target,
      title: "ATS Optimization",
      desc: "Checks resume compatibility with applicant tracking systems",
      color: "text-green-400 bg-green-500/20",
      premium: false,
    },
    {
      icon: Search,
      title: "Keyword Analysis",
      desc: "Identifies optimal keywords for your target industry and role",
      color: "text-purple-400 bg-purple-500/20",
      premium: true,
    },
    {
      icon: Briefcase,
      title: "Industry Matching",
      desc: "Matches your profile with relevant industries and job markets",
      color: "text-cyan-400 bg-cyan-500/20",
      premium: true,
    },
    {
      icon: TrendingUp,
      title: "Career Path Prediction",
      desc: "AI suggests optimal career progression based on your experience",
      color: "text-pink-400 bg-pink-500/20",
      premium: true,
    },
    {
      icon: Users,
      title: "Competitor Analysis",
      desc: "Compares your resume against similar profiles in your field",
      color: "text-yellow-400 bg-yellow-500/20",
      premium: true,
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      desc: "Personalized suggestions to improve your resume's impact",
      color: "text-indigo-400 bg-indigo-500/20",
      premium: false,
    },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    setConnectionStatus("connecting");
    try {
      const response = await axiosInstance.get("/resume/history");
      setAnalysisHistory(response.data || []);
      setConnectionStatus("connected");
      setLastActivity(new Date());
      // Add success notification
      toast.success("Analysis history refreshed!");
    } catch (error) {
      console.error("Failed to load history:", error);
      setConnectionStatus("disconnected");
      toast.error("Failed to refresh history. Please check your connection.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setAnalysis(null);
      setAnalysisStep(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);
    setAnalysisProgress(0);
    setRealTimeScore(0);
    setLivePreview("");

    // Real-time score simulation
    scoreIntervalRef.current = setInterval(() => {
      setRealTimeScore((prev) => Math.min(prev + Math.random() * 5, 95));
    }, 500);

    // Step progress simulation
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < analysisSteps.length) {
        setAnalysisStep(currentStep);
        setAnalysisProgress((currentStep / analysisSteps.length) * 100);

        // Simulate live preview updates
        if (currentStep === 1) {
          setLivePreview("Extracting resume content...");
        } else if (currentStep === 2) {
          setLivePreview("Analyzing skills and experience...");
        } else if (currentStep === 3) {
          setLivePreview("Verifying skill claims...");
        } else if (currentStep === 4) {
          setLivePreview("Checking ATS compatibility...");
        }

        currentStep++;
      }
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(stepInterval);
      clearInterval(scoreIntervalRef.current);
      setAnalysisStep(analysisSteps.length);
      setAnalysisProgress(100);
      setRealTimeScore(response.data.credibility_score || 0);
      setAnalysis(response.data);
      setLivePreview("Analysis complete!");
      setActiveTab("results");

      // Simulate additional analysis features
      setTimeout(() => {
        setSkillAnalysis([
          { skill: "Python", confidence: 85, verified: true },
          { skill: "JavaScript", confidence: 78, verified: true },
          { skill: "React", confidence: 92, verified: true },
          { skill: "Node.js", confidence: 45, verified: false },
        ]);
        setKeywordAnalysis([
          { keyword: "JavaScript", frequency: 12, relevance: 95 },
          { keyword: "React", frequency: 8, relevance: 90 },
          { keyword: "API", frequency: 6, relevance: 85 },
        ]);
        setAtsScore(87);
        setIndustryMatch("Technology - Full Stack Development");
        setCareerSuggestions([
          "Senior Full Stack Developer",
          "Technical Lead",
          "Software Architect",
        ]);
        setCompetitorAnalysis([
          {
            name: "Similar Profile A",
            score: 82,
            gap: "More experience needed",
          },
          {
            name: "Similar Profile B",
            score: 79,
            gap: "Stronger portfolio required",
          },
        ]);
        setResumeTemplates([
          { name: "Modern Tech Resume", suitability: 95 },
          { name: "Executive Summary", suitability: 88 },
          { name: "Skills-Focused", suitability: 92 },
        ]);
      }, 1000);

      toast.success("Resume analyzed successfully!");
      loadHistory();
    } catch (error) {
      clearInterval(stepInterval);
      clearInterval(scoreIntervalRef.current);
      toast.error(error.response?.data?.detail || "Failed to analyze resume");
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80)
      return "from-green-500/20 to-green-600/10 border-green-500/30";
    if (score >= 60)
      return "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    if (score >= 40)
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    return "from-red-500/20 to-red-600/10 border-red-500/30";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Work";
    return "Poor";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <Trophy className="w-6 h-6 text-green-400" />;
    if (score >= 60) return <Award className="w-6 h-6 text-yellow-400" />;
    if (score >= 40) return <Target className="w-6 h-6 text-orange-400" />;
    return <AlertTriangle className="w-6 h-6 text-red-400" />;
  };

  const clearFile = () => {
    setFile(null);
    setAnalysis(null);
    setAnalysisStep(0);
    setLivePreview("");
    setRealTimeScore(0);
    setSkillAnalysis([]);
    setKeywordAnalysis([]);
    setAtsScore(0);
    setIndustryMatch("");
    setCareerSuggestions([]);
    setCompetitorAnalysis([]);
    setResumeTemplates([]);
  };

  const exportAnalysis = async () => {
    setExportLoading(true);
    try {
      // Simulate export functionality
      const reportData = {
        analysis,
        skillAnalysis,
        keywordAnalysis,
        atsScore,
        industryMatch,
        careerSuggestions,
        competitorAnalysis,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Analysis report exported!");
    } catch (error) {
      toast.error("Failed to export analysis");
    } finally {
      setExportLoading(false);
    }
  };

  const toggleBookmark = (analysisId) => {
    setBookmarks((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
    toast.success(
      bookmarks.includes(analysisId) ? "Bookmark removed!" : "Bookmark added!"
    );
  };

  const toggleFavorite = (analysisId) => {
    setFavorites((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
    toast.success(
      favorites.includes(analysisId)
        ? "Removed from favorites!"
        : "Added to favorites!"
    );
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/20">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                {isAnalyzing && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  AI Resume Analyzer
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Real-time AI
                  </Badge>
                  {isAnalyzing && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                      <Activity className="w-3 h-3 mr-1" />
                      Analyzing
                    </Badge>
                  )}
                </h1>
                <p className="text-zinc-400 text-sm">
                  Advanced AI-powered resume analysis with real-time insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiveChat(!liveChat)}
                className="border-zinc-700 text-white hover:bg-zinc-800 relative"
              >
                <MessageSquare className="w-4 h-4" />
                {chatMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {chatMessages.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <Palette className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNotifications((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      type: "info",
                      message: "New feature available: Voice Analysis!",
                      timestamp: new Date(),
                    },
                  ])
                }
                className="border-zinc-700 text-white hover:bg-zinc-800 relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-400"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                ></div>
                <span className="text-xs text-zinc-400 capitalize">
                  {connectionStatus}
                </span>
              </div>
              <Button
                onClick={loadHistory}
                variant="outline"
                className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingHistory ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Live Analysis Preview */}
          {isAnalyzing && (
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      Live Analysis
                    </span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {Math.round(realTimeScore)}/100
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-xs text-zinc-400">{livePreview}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Analyzed</p>
                  <p className="text-xl font-bold text-white">
                    {analysisHistory.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Avg Score</p>
                  <p className="text-xl font-bold text-white">
                    {analysisHistory.length > 0
                      ? Math.round(
                          analysisHistory.reduce(
                            (a, b) => a + (b.credibility_score || 0),
                            0
                          ) / analysisHistory.length
                        )
                      : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Suggestions</p>
                  <p className="text-xl font-bold text-white">
                    {analysisHistory.reduce(
                      (a, b) => a + (b.suggestions?.length || 0),
                      0
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">AI Insights</p>
                  <p className="text-xl font-bold text-white">Real-time</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Top Score</p>
                  <p className="text-xl font-bold text-white">
                    {analysisHistory.length > 0
                      ? Math.max(
                          ...analysisHistory.map(
                            (a) => a.credibility_score || 0
                          )
                        )
                      : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
              disabled={!analysis}
            >
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Comparison Mode Banner */}
            {comparisonMode && (
              <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitCompare className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">
                          Comparison Mode Active
                        </p>
                        <p className="text-zinc-400 text-sm">
                          Upload another resume to compare with "
                          {comparisonResume?.filename}"
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setComparisonMode(false);
                        setComparisonResume(null);
                        setComparisonResults(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-400" />
                    Upload Resume
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Drop your PDF resume to get AI-powered analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getRootProps()}
                    data-testid="dropzone"
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
                        : file
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                          <FileCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">
                            {file.name}
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFile();
                          }}
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                          <Upload className="w-8 h-8 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">
                            {isDragActive
                              ? "Drop your resume here"
                              : "Drag & drop your resume"}
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">
                            or click to browse files
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                          <FileText className="w-3 h-3" />
                          <span>PDF format • Max 10MB</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Progress */}
                  {loading && (
                    <div className="space-y-4 p-4 bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          Analyzing Resume...
                        </span>
                        <span className="text-xs text-zinc-400">
                          {Math.round(
                            (analysisStep / analysisSteps.length) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(analysisStep / analysisSteps.length) * 100}
                        className="h-2"
                      />
                      <div className="space-y-2">
                        {analysisSteps.map((step, index) => {
                          const Icon = step.icon;
                          const isActive = index === analysisStep;
                          const isComplete = index < analysisStep;
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                isActive
                                  ? "bg-purple-500/20 text-purple-400"
                                  : isComplete
                                  ? "text-green-400"
                                  : "text-zinc-500"
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isActive ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CircleDot className="w-4 h-4" />
                              )}
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Additional Analysis Features */}
                      {(voiceAnalysis || videoAnalysis) && (
                        <div className="mt-4 pt-4 border-t border-zinc-700">
                          <p className="text-xs text-zinc-400 mb-2">
                            Additional Analysis:
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {voiceAnalysis && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                <Mic className="w-3 h-3 mr-1" />
                                Voice Analysis
                              </Badge>
                            )}
                            {videoAnalysis && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                <Video className="w-3 h-3 mr-1" />
                                Video Analysis
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    data-testid="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="w-full rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-base"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Features Preview */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      icon: BarChart3,
                      title: "Credibility Score",
                      desc: "AI-powered score from 0-100 based on resume quality",
                      color: "text-blue-400 bg-blue-500/20",
                    },
                    {
                      icon: AlertTriangle,
                      title: "Skill Verification",
                      desc: "Detect potentially exaggerated or misrepresented skills",
                      color: "text-orange-400 bg-orange-500/20",
                    },
                    {
                      icon: Lightbulb,
                      title: "Smart Suggestions",
                      desc: "Personalized tips to improve your resume",
                      color: "text-yellow-400 bg-yellow-500/20",
                    },
                    {
                      icon: Brain,
                      title: "Detailed Analysis",
                      desc: "Comprehensive AI review of content and structure",
                      color: "text-purple-400 bg-purple-500/20",
                    },
                    {
                      icon: Target,
                      title: "ATS Compatibility",
                      desc: "Check if your resume passes applicant tracking systems",
                      color: "text-green-400 bg-green-500/20",
                    },
                    {
                      icon: TrendingUp,
                      title: "Improvement Tracking",
                      desc: "Track your resume score over time",
                      color: "text-pink-400 bg-pink-500/20",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className={`p-2.5 rounded-xl ${feature.color}`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-zinc-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {analysis && (
              <>
                {/* Score Card */}
                <Card
                  className={`bg-gradient-to-br ${getScoreBg(
                    analysis.credibility_score
                  )} border overflow-hidden`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full bg-zinc-900/50 flex items-center justify-center">
                            <div className="text-center">
                              <p
                                className={`text-5xl font-bold ${getScoreColor(
                                  analysis.credibility_score
                                )}`}
                              >
                                {analysis.credibility_score}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">
                                out of 100
                              </p>
                            </div>
                          </div>
                          <div className="absolute -top-2 -right-2">
                            {getScoreIcon(analysis.credibility_score)}
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">
                            {getScoreLabel(analysis.credibility_score)} Resume
                          </h2>
                          <p className="text-zinc-400 mb-3">
                            Based on AI analysis of your resume content
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className="bg-zinc-800 text-white border-zinc-700">
                              <FileText className="w-3 h-3 mr-1" />
                              {analysis.filename}
                            </Badge>
                            <Badge className="bg-zinc-800 text-white border-zinc-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Just analyzed
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `Resume Score: ${analysis.credibility_score}/100\n${analysis.analysis}`
                            );
                            toast.success("Analysis copied to clipboard!");
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => setActiveTab("upload")}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Analyze New
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Questionable Skills */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Skill Verification
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Skills that may need better justification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysis.fake_skills &&
                      analysis.fake_skills.length > 0 ? (
                        <div className="space-y-2">
                          {analysis.fake_skills.map((skill, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20"
                            >
                              <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                              <span className="text-sm text-zinc-300">
                                {skill}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-green-400">
                            No questionable skills detected! Great job.
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Improvement Suggestions
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        AI-powered tips to enhance your resume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.suggestions &&
                        analysis.suggestions.length > 0 ? (
                          analysis.suggestions.map((suggestion, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                              <div className="p-1 bg-yellow-500/20 rounded">
                                <ChevronRight className="w-3 h-3 text-yellow-400" />
                              </div>
                              <span className="text-sm text-zinc-300">
                                {suggestion.replace(/^[-•]\s*/, "")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-zinc-400 text-sm">
                            No specific suggestions at this time.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Analysis Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Skill Analysis */}
                  {skillAnalysis.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Shield className="w-5 h-5 text-blue-400" />
                          Skill Verification
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          AI-verified skills with confidence scores
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {skillAnalysis.map((skill, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                  {skill.skill}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-zinc-400">
                                    {skill.confidence}%
                                  </span>
                                  {skill.verified ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                  )}
                                </div>
                              </div>
                              <Progress
                                value={skill.confidence}
                                className="h-1"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Keyword Analysis */}
                  {keywordAnalysis.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Search className="w-5 h-5 text-purple-400" />
                          Keyword Analysis
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Optimal keywords for your industry
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {keywordAnalysis.map((keyword, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                            >
                              <span className="text-sm font-medium text-white">
                                {keyword.keyword}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`text-xs ${
                                    keyword.relevance >= 90
                                      ? "bg-green-500/20 text-green-400"
                                      : keyword.relevance >= 80
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-orange-500/20 text-orange-400"
                                  }`}
                                >
                                  {keyword.relevance}%
                                </Badge>
                                <span className="text-xs text-zinc-400">
                                  {keyword.frequency}x
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* ATS Score */}
                  {atsScore > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Target className="w-5 h-5 text-green-400" />
                          ATS Compatibility
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Applicant Tracking System score
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="relative w-24 h-24 mx-auto">
                            <svg
                              className="w-24 h-24 transform -rotate-90"
                              viewBox="0 0 36 36"
                            >
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${atsScore}, 100`}
                                className="text-green-400"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">
                                {atsScore}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-400">
                            {atsScore >= 80
                              ? "Excellent ATS compatibility"
                              : atsScore >= 60
                              ? "Good ATS compatibility"
                              : "Needs ATS optimization"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Industry Matching */}
                  {industryMatch && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Briefcase className="w-5 h-5 text-cyan-400" />
                          Industry Match
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Best industry fit based on your profile
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <Briefcase className="w-8 h-8 text-cyan-400" />
                          <div>
                            <p className="font-medium text-white">
                              {industryMatch}
                            </p>
                            <p className="text-sm text-zinc-400">
                              High compatibility detected
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Career Suggestions */}
                  {careerSuggestions.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5 text-pink-400" />
                          Career Path
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Recommended career progression
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {careerSuggestions.map((career, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-pink-500/10 rounded-lg border border-pink-500/20"
                            >
                              <div className="p-1 bg-pink-500/20 rounded">
                                <ChevronRight className="w-4 h-4 text-pink-400" />
                              </div>
                              <span className="text-sm font-medium text-white">
                                {career}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Competitor Analysis */}
                  {competitorAnalysis.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Users className="w-5 h-5 text-yellow-400" />
                          Market Position
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          How you compare to similar profiles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {competitorAnalysis.map((competitor, i) => (
                            <div
                              key={i}
                              className="p-3 bg-zinc-800/50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">
                                  {competitor.name}
                                </span>
                                <Badge
                                  className={`text-xs ${
                                    competitor.score >= 80
                                      ? "bg-green-500/20 text-green-400"
                                      : competitor.score >= 70
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-orange-500/20 text-orange-400"
                                  }`}
                                >
                                  {competitor.score}/100
                                </Badge>
                              </div>
                              <p className="text-xs text-zinc-400">
                                {competitor.gap}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Resume Templates */}
                {resumeTemplates.length > 0 && (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Recommended Templates
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        AI-suggested resume templates for better impact
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resumeTemplates.map((template, i) => (
                          <div
                            key={i}
                            className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">
                                {template.name}
                              </span>
                              <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                                {template.suitability}%
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-400">
                              Suitability score
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={exportAnalysis}
                    disabled={exportLoading}
                    variant="outline"
                    className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    {exportLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export Report
                  </Button>
                  <Button
                    onClick={() => setComparisonMode(!comparisonMode)}
                    variant="outline"
                    className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    <Users className="w-4 h-4" />
                    Compare Resumes
                  </Button>
                  <Button
                    onClick={() => setVoiceAnalysis(!voiceAnalysis)}
                    variant="outline"
                    className={`gap-2 border-zinc-700 text-white hover:bg-zinc-800 ${
                      voiceAnalysis ? "bg-purple-500/20 border-purple-500" : ""
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Voice Analysis{" "}
                    {voiceAnalysis && (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setVideoAnalysis(!videoAnalysis)}
                    variant="outline"
                    className={`gap-2 border-zinc-700 text-white hover:bg-zinc-800 ${
                      videoAnalysis ? "bg-blue-500/20 border-blue-500" : ""
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video Analysis{" "}
                    {videoAnalysis && (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                  </Button>
                </div>

                {/* Detailed Analysis */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Brain className="w-5 h-5 text-purple-400" />
                          Detailed AI Analysis
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Comprehensive review of your resume
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-zinc-400 hover:text-white"
                      >
                        {showDetails ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`bg-zinc-800/50 rounded-xl p-4 ${
                        showDetails ? "max-h-[600px]" : "max-h-48"
                      } overflow-y-auto transition-all duration-300`}
                    >
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {analysis.analysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-r from-purple-900/20 via-zinc-900 to-pink-900/20 border-zinc-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Flame className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Ready to Improve Your Resume?
                          </h3>
                          <p className="text-zinc-400 text-sm">
                            Use AI Tutor for personalized guidance
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => (window.location.href = "/tutor")}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Ask AI Tutor
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("upload")}
                          className="border-zinc-600 text-white hover:bg-zinc-800"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Advanced Filters */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300 mb-2 block">
                      Score Range
                    </label>
                    <div className="px-3 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300">
                      {filterCriteria.scoreRange[0]} -{" "}
                      {filterCriteria.scoreRange[1]}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 mb-2 block">
                      Sort By
                    </label>
                    <select
                      value={filterCriteria.sortBy}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,
                          sortBy: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="score">Score</option>
                      <option value="filename">Filename</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 mb-2 block">
                      Industry
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by industry..."
                      value={filterCriteria.industry}
                      onChange={(e) =>
                        setFilterCriteria((prev) => ({
                          ...prev,
                          industry: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setFilterCriteria({
                          scoreRange: [0, 100],
                          dateRange: null,
                          industry: "",
                          sortBy: "date",
                          sortOrder: "desc",
                        });
                        toast.success("Filters reset!");
                      }}
                      variant="outline"
                      className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Analysis History ({analysisHistory.length})
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Your previous resume analyses with detailed insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                  </div>
                ) : analysisHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-400 mb-4">
                      No analysis history yet
                    </p>
                    <Button
                      onClick={() => setActiveTab("upload")}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze Your First Resume
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysisHistory
                      .filter(
                        (analysis) =>
                          analysis.credibility_score >=
                            filterCriteria.scoreRange[0] &&
                          analysis.credibility_score <=
                            filterCriteria.scoreRange[1] &&
                          (filterCriteria.industry === "" ||
                            analysis.analysis
                              ?.toLowerCase()
                              .includes(filterCriteria.industry.toLowerCase()))
                      )
                      .sort((a, b) => {
                        if (filterCriteria.sortBy === "score") {
                          return filterCriteria.sortOrder === "desc"
                            ? b.credibility_score - a.credibility_score
                            : a.credibility_score - b.credibility_score;
                        }
                        if (filterCriteria.sortBy === "filename") {
                          return filterCriteria.sortOrder === "desc"
                            ? b.filename.localeCompare(a.filename)
                            : a.filename.localeCompare(b.filename);
                        }
                        // Default date sorting
                        return filterCriteria.sortOrder === "desc"
                          ? new Date(b.created_at || 0) -
                              new Date(a.created_at || 0)
                          : new Date(a.created_at || 0) -
                              new Date(b.created_at || 0);
                      })
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                          onClick={() => {
                            setAnalysis(item);
                            setActiveTab("results");
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getScoreBg(
                                item.credibility_score
                              )}`}
                            >
                              <span
                                className={`text-lg font-bold ${getScoreColor(
                                  item.credibility_score
                                )}`}
                              >
                                {item.credibility_score}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-white">
                                {item.filename}
                              </h4>
                              <p className="text-sm text-zinc-400">
                                {new Date(item.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(item.id);
                              }}
                              className={`text-zinc-400 hover:text-yellow-400 ${
                                bookmarks.includes(item.id)
                                  ? "text-yellow-400"
                                  : ""
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id);
                              }}
                              className={`text-zinc-400 hover:text-red-400 ${
                                favorites.includes(item.id)
                                  ? "text-red-400"
                                  : ""
                              }`}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setComparisonResume(item);
                                setComparisonMode(true);
                                setActiveTab("upload");
                                toast.success(
                                  "Resume selected for comparison!"
                                );
                              }}
                              className="text-zinc-400 hover:text-blue-400"
                            >
                              <GitCompare className="w-4 h-4" />
                            </Button>
                            <Badge
                              className={`bg-gradient-to-br ${getScoreBg(
                                item.credibility_score
                              )}`}
                            >
                              {getScoreLabel(item.credibility_score)}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-zinc-400" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Live Chat Widget */}
      {liveChat && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              AI Assistant
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLiveChat(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-zinc-400">
                <Bot className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p>
                  Hi! I'm your AI assistant. How can I help you with your resume
                  analysis?
                </p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    const newMessage = {
                      sender: "user",
                      text: e.target.value.trim(),
                      timestamp: new Date(),
                    };
                    setChatMessages((prev) => [...prev, newMessage]);
                    e.target.value = "";

                    // Simulate AI response
                    setTimeout(() => {
                      const responses = [
                        "That's a great question! Let me help you with that.",
                        "I can assist you with resume optimization and career advice.",
                        "Your resume looks strong! Here are some suggestions...",
                        "Would you like me to analyze specific sections of your resume?",
                      ];
                      const aiResponse = {
                        sender: "ai",
                        text: responses[
                          Math.floor(Math.random() * responses.length)
                        ],
                        timestamp: new Date(),
                      };
                      setChatMessages((prev) => [...prev, aiResponse]);
                    }, 1000);
                  }
                }}
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 w-80 max-h-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Notifications ({notifications.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1 rounded-full ${
                      notification.type === "success"
                        ? "bg-green-500/20"
                        : notification.type === "error"
                        ? "bg-red-500/20"
                        : notification.type === "warning"
                        ? "bg-yellow-500/20"
                        : "bg-blue-500/20"
                    }`}
                  >
                    {notification.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : notification.type === "error" ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : notification.type === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300">
                      {notification.message}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notification.id)
                      )
                    }
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
