import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
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
  MessageSquare,
  Loader2,
  Play,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Target,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Bot,
  Code,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  Timer,
  RotateCcw,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Lightbulb,
  BookOpen,
  ArrowRight,
  BarChart3,
  PieChart,
  History,
  Flame,
  CircleDot,
  Pause,
  StopCircle,
  Trash2,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { getUser } from "../lib/utils";
import { toast } from "sonner";

const MockInterview = () => {
  const user = getUser();
  const interviewHistoryKey =
    user?.id || user?._id || user?.email
      ? `interviewHistory:${user.id || user._id || user.email}`
      : "interviewHistory:anonymous";

  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftMeta, setDraftMeta] = useState(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [dictationListening, setDictationListening] = useState(false);
  const [dictationInterim, setDictationInterim] = useState("");
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentQuestionRef = useRef(0);

  const interviewDraftKey =
    user?.id || user?._id || user?.email
      ? `mockInterviewDraft:${user.id || user._id || user.email}`
      : "mockInterviewDraft:anonymous";

  useEffect(() => {
    loadInterviewHistory();

    // Web Speech API support detection (Chrome/Edge typically support this).
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setDictationSupported(Boolean(SpeechRecognition));

    // Detect unfinished draft on load (so the experience feels like a real app)
    try {
      const draftRaw = localStorage.getItem(interviewDraftKey);
      if (draftRaw) {
        const parsed = JSON.parse(draftRaw);
        if (parsed?.started && !parsed?.evaluation) {
          setHasDraft(true);
          setDraftMeta({
            interviewType: parsed.interviewType,
            difficulty: parsed.difficulty,
            updatedAt: parsed.updatedAt,
            answeredCount: (parsed.answers || []).filter((a) =>
              (a || "").trim()
            ).length,
            total: (parsed.questions || []).length,
          });
        }
      }
    } catch (e) {
      // ignore malformed storage
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Safety cleanup on unmount
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError("Camera not supported in this browser");
        toast.error("Camera is not supported in this browser");
        return;
      }

      // If already running, no-op
      if (mediaStreamRef.current) {
        setVideoEnabled(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setVideoEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Some browsers require play() call.
        try {
          await videoRef.current.play();
        } catch (e) {
          // ignore autoplay restrictions
        }
      }
    } catch (e) {
      setVideoEnabled(false);
      setCameraError("Camera permission denied or unavailable");
      toast.error("Could not access camera. Please allow permission.");
    }
  };

  const stopCamera = () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      // ignore
    }
    mediaStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoEnabled(false);
  };

  const startDictation = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech-to-text is not supported in this browser");
      setDictationSupported(false);
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
      }

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator?.language || "en-US";

      recognition.onresult = (event) => {
        let interim = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = (result?.[0]?.transcript || "").trim();
          if (!transcript) continue;
          if (result.isFinal) finalText += ` ${transcript}`;
          else interim += ` ${transcript}`;
        }

        const interimClean = interim.trim();
        setDictationInterim(interimClean);

        const finalClean = finalText.trim();
        if (finalClean) {
          const qIndex = currentQuestionRef.current;
          setAnswers((prev) => {
            const next = [...prev];
            const existing = (next[qIndex] || "").trimEnd();
            const spacer = existing.length > 0 ? " " : "";
            next[qIndex] = `${existing}${spacer}${finalClean}`;
            return next;
          });
        }
      };

      recognition.onerror = () => {
        setDictationListening(false);
        setMicEnabled(false);
        setDictationInterim("");
        toast.error("Speech-to-text stopped (microphone permission needed)");
      };

      recognition.onend = () => {
        setDictationListening(false);
        setMicEnabled(false);
        setDictationInterim("");
      };

      recognition.start();
      setDictationListening(true);
      setMicEnabled(true);
      toast.success("Dictation started — speak naturally");
    } catch (e) {
      toast.error("Could not start speech-to-text");
      setDictationListening(false);
      setMicEnabled(false);
      setDictationInterim("");
    }
  };

  const stopDictation = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      // ignore
    }
    setDictationListening(false);
    setMicEnabled(false);
    setDictationInterim("");
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const loadInterviewHistory = async () => {
    try {
      const response = await axiosInstance.get("/interview/history?limit=10");
      const mapped = (response.data || []).map((item) => ({
        id: item.id,
        type: item.interview_type,
        difficulty: "n/a",
        score: item.readiness_score,
        date: item.created_at,
        duration: 0,
        questionsCount: item.questions?.length || 0,
      }));

      setInterviewHistory(mapped);
      localStorage.setItem(interviewHistoryKey, JSON.stringify(mapped));
    } catch (error) {
      try {
        const saved = localStorage.getItem(interviewHistoryKey);
        if (saved) {
          setInterviewHistory(JSON.parse(saved));
          return;
        }

        // Legacy migration
        const legacy = localStorage.getItem("interviewHistory");
        if (legacy) {
          localStorage.setItem(interviewHistoryKey, legacy);
          localStorage.removeItem("interviewHistory");
          setInterviewHistory(JSON.parse(legacy));
        }
      } catch (e) {
        // ignore malformed storage
      }
    }
  };

  const saveToHistory = (evalData) => {
    const historyItem = {
      id: Date.now(),
      type: interviewType,
      difficulty,
      score: evalData.readiness_score,
      date: new Date().toISOString(),
      duration: timer,
      questionsCount: questions.length,
    };
    const newHistory = [historyItem, ...interviewHistory].slice(0, 10);
    setInterviewHistory(newHistory);
    localStorage.setItem(interviewHistoryKey, JSON.stringify(newHistory));
  };

  const formatTime = (seconds) => {
    if (seconds == null || Number.isNaN(Number(seconds))) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      // Try to start camera + dictation at the moment the user clicks Start.
      // If the browser blocks due to permissions, user can enable from sidebar.
      await startCamera();
      if (dictationSupported) startDictation();

      const response = await axiosInstance.post(
        `/interview/start?interview_type=${interviewType}`
      );
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(""));
      setStarted(true);
      setTimer(0);
      setIsTimerRunning(true);
      setLastSavedAt(null);
      setHasDraft(false);
      setDraftMeta(null);
      toast.success("Interview started! Good luck! 🎯");
    } catch (error) {
      // If starting interview fails, stop any media we may have started.
      stopDictation();
      stopCamera();
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const resumeDraft = () => {
    try {
      const draftRaw = localStorage.getItem(interviewDraftKey);
      if (!draftRaw) return;
      const parsed = JSON.parse(draftRaw);
      if (!parsed?.started || parsed?.evaluation) return;

      setInterviewType(parsed.interviewType || "technical");
      setDifficulty(parsed.difficulty || "medium");
      setQuestions(parsed.questions || []);
      setAnswers(parsed.answers || []);
      setCurrentQuestion(parsed.currentQuestion || 0);
      setTimer(parsed.timer || 0);
      setStarted(true);
      setEvaluation(null);
      setIsTimerRunning(true);
      setLastSavedAt(parsed.updatedAt ? new Date(parsed.updatedAt) : null);
      setHasDraft(false);
      setDraftMeta(null);
      toast.success("Resumed your previous interview session");
    } catch (e) {
      toast.error("Could not resume draft");
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(interviewDraftKey);
    } catch (e) {
      // ignore
    }
    setHasDraft(false);
    setDraftMeta(null);
    toast.success("Draft cleared");
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  // Autosave interview progress (debounced)
  useEffect(() => {
    if (!started || evaluation) return;

    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      try {
        const payload = {
          started: true,
          evaluation: null,
          interviewType,
          difficulty,
          questions,
          answers,
          currentQuestion,
          timer,
          updatedAt: Date.now(),
        };
        localStorage.setItem(interviewDraftKey, JSON.stringify(payload));
        setLastSavedAt(new Date(payload.updatedAt));
      } catch (e) {
        // ignore
      }
    }, 400);

    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [
    started,
    evaluation,
    interviewType,
    difficulty,
    questions,
    answers,
    currentQuestion,
    timer,
    interviewDraftKey,
  ]);

  const submitInterview = async () => {
    if (answers.some((a) => !a.trim())) {
      toast.error("Please answer all questions");
      return;
    }

    setLoading(true);
    setIsTimerRunning(false);
    setTypingIndicator(true);

    try {
      const formattedAnswers = answers.map((answer, i) => ({
        question_id: questions[i].id,
        answer,
      }));

      const response = await axiosInstance.post(
        `/interview/evaluate?interview_type=${interviewType}`,
        {
          questions,
          answers: formattedAnswers,
        }
      );

      setTypingIndicator(false);
      setEvaluation(response.data);

      // Stop live media once interview is submitted.
      stopDictation();
      stopCamera();

      try {
        localStorage.removeItem(interviewDraftKey);
      } catch (e) {
        // ignore
      }

      // Refresh from backend so history is real & shared across devices
      await loadInterviewHistory();
      toast.success("Interview evaluated! Great job! 🎉");
    } catch (error) {
      toast.error("Failed to evaluate interview");
      setTypingIndicator(false);
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    stopDictation();
    stopCamera();
    setStarted(false);
    setEvaluation(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setTimer(0);
    setIsTimerRunning(false);
    setLastSavedAt(null);
    try {
      localStorage.removeItem(interviewDraftKey);
    } catch (e) {
      // ignore
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const endInterviewNow = () => {
    // Stop timer and exit to start screen but keep draft for resume
    stopDictation();
    stopCamera();
    setIsTimerRunning(false);
    setStarted(false);
    setCurrentQuestion(0);
    setHasDraft(true);
    toast.success("Interview ended (draft saved)", { duration: 1200 });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-orange-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-orange-400";
    return "text-orange-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80)
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    if (score >= 60)
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    if (score >= 40)
      return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
    return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const interviewTypes = [
    {
      id: "technical",
      label: "Technical",
      icon: Code,
      color: "white",
      desc: "DSA, System Design, Coding",
    },
    {
      id: "behavioral",
      label: "Behavioral",
      icon: Users,
      color: "white",
      desc: "STAR Method, Soft Skills",
    },
    {
      id: "hr",
      label: "HR Round",
      icon: Briefcase,
      color: "white",
      desc: "Culture Fit, Expectations",
    },
  ];

  const difficultyLevels = [
    { id: "easy", label: "Easy", color: "green" },
    { id: "medium", label: "Medium", color: "yellow" },
    { id: "hard", label: "Hard", color: "red" },
  ];

  const difficultyClass = (levelId) => {
    // Tailwind does not reliably generate dynamic classes like `border-${color}-500`.
    // Use explicit mappings so UI always shows correct colors.
    const map = {
      easy: "border-green-500 bg-green-500/10",
      medium: "border-yellow-500 bg-yellow-500/10",
      hard: "border-red-500 bg-red-500/10",
    };
    return map[levelId] || "border-zinc-700 bg-zinc-800";
  };

  const interviewTips = {
    technical: [
      "Think out loud - explain your thought process",
      "Ask clarifying questions before jumping into code",
      "Consider edge cases and time complexity",
      "Test your solution with examples",
    ],
    behavioral: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Be specific with examples from your experience",
      "Show self-awareness and growth mindset",
      "Connect your experiences to the role",
    ],
    hr: [
      "Research the company culture and values",
      "Be honest about your expectations",
      "Ask thoughtful questions about the role",
      "Show enthusiasm and genuine interest",
    ],
  };

  const answeredCount = answers.filter((a) => a.trim()).length;
  const progressPercent =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Mock Interview
              </h1>
              <p className="text-zinc-400">
                Practice with AI-powered interviews
              </p>
            </div>
          </div>
          {started && !evaluation && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-mono text-white">
                  {formatTime(timer)}
                </span>
              </div>
              <Badge
                className={`capitalize ${
                  interviewType === "technical"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    : interviewType === "behavioral"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                }`}
              >
                {interviewType}
              </Badge>

              <Button
                variant="outline"
                onClick={toggleTimer}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Resume
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={videoEnabled ? stopCamera : startCamera}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                {videoEnabled ? (
                  <>
                    <VideoOff className="w-4 h-4 mr-2" /> Camera
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" /> Camera
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={dictationListening ? stopDictation : startDictation}
                disabled={!dictationSupported}
                className="border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-60"
                title={
                  dictationSupported
                    ? "Speak to fill your answer"
                    : "Speech-to-text not supported in this browser"
                }
              >
                {dictationListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" /> Dictation
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" /> Dictation
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={endInterviewNow}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <StopCircle className="w-4 h-4 mr-2" /> End
              </Button>
            </div>
          )}
        </div>

        {/* Resume Draft Banner */}
        {!started && !evaluation && hasDraft && draftMeta && (
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-white font-semibold">
                  Resume your last mock interview?
                </div>
                <div className="text-sm text-zinc-400">
                  {draftMeta.interviewType} • {draftMeta.difficulty} •{" "}
                  {draftMeta.answeredCount}/{draftMeta.total} answered
                  {draftMeta.updatedAt ? (
                    <span>
                      {" "}
                      • saved {new Date(draftMeta.updatedAt).toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={resumeDraft}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  <Play className="w-4 h-4 mr-2" /> Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={discardDraft}
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Discard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Interview Screen */}
        {!started && !evaluation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Config Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-orange-400" />
                    Start New Interview
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Choose your interview type and get ready to practice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Interview Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300">
                      Interview Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {interviewTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setInterviewType(type.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              interviewType === type.id
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`p-2 rounded-lg ${
                                  interviewType === type.id
                                    ? "bg-orange-500/20"
                                    : "bg-zinc-700"
                                }`}
                              >
                                <Icon
                                  className={`w-5 h-5 ${
                                    interviewType === type.id
                                      ? "text-orange-400"
                                      : "text-zinc-400"
                                  }`}
                                />
                              </div>
                              <span
                                className={
                                  interviewType === type.id
                                    ? "text-white font-medium"
                                    : "text-zinc-300"
                                }
                              >
                                {type.label}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500">{type.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300">
                      Difficulty Level
                    </label>
                    <div className="flex gap-3">
                      {difficultyLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setDifficulty(level.id)}
                          className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                            difficulty === level.id
                              ? `${difficultyClass(level.id)} text-white`
                              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <Button
                    data-testid="start-interview-btn"
                    onClick={startInterview}
                    disabled={loading}
                    className="w-full h-14 rounded-xl font-semibold text-lg bg-white text-black hover:bg-zinc-200"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Preparing Questions...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Interview
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              {showTips && (
                <Card className="bg-gradient-to-br from-orange-900/20 to-orange-900/20 border-orange-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-orange-400" />
                      Tips for{" "}
                      {interviewType.charAt(0).toUpperCase() +
                        interviewType.slice(1)}{" "}
                      Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {interviewTips[interviewType].map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-zinc-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* History Sidebar */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <History className="w-5 h-5 text-orange-400" />
                    Recent Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interviewHistory.length > 0 ? (
                    <div className="space-y-3">
                      {interviewHistory.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="outline"
                              className="capitalize text-xs border-zinc-700 text-zinc-300"
                            >
                              {item.type}
                            </Badge>
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                item.score
                              )}`}
                            >
                              {item.score}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span>
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                            <span>{formatTime(item.duration)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 text-sm">No interviews yet</p>
                      <p className="text-zinc-500 text-xs">
                        Start practicing to build history
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              {interviewHistory.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                      Your Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400 text-sm">
                        Total Interviews
                      </span>
                      <span className="text-white font-bold">
                        {interviewHistory.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400 text-sm">
                        Average Score
                      </span>
                      <span className="text-white font-bold">
                        {Math.round(
                          interviewHistory.reduce(
                            (sum, i) => sum + i.score,
                            0
                          ) / interviewHistory.length
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-400 text-sm">Best Score</span>
                      <span className="text-orange-400 font-bold">
                        {Math.max(...interviewHistory.map((i) => i.score))}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Interview In Progress */}
        {started && !evaluation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bar */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Progress</span>
                    <span className="text-sm text-zinc-400">
                      {answeredCount}/{questions.length} answered
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
                    <span>
                      {lastSavedAt
                        ? `Autosaved at ${lastSavedAt.toLocaleTimeString()}`
                        : "Autosave on"}
                    </span>
                    <span className="text-zinc-400">
                      Difficulty: {difficulty}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          index === currentQuestion
                            ? "bg-orange-500"
                            : answers[index]?.trim()
                            ? "bg-orange-500"
                            : "bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Question Card */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <CircleDot className="w-5 h-5 text-orange-400" />
                      Question {currentQuestion + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {answers[currentQuestion]?.trim() && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Display */}
                  <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700">
                    <p className="text-lg text-white leading-relaxed">
                      {questions[currentQuestion]?.question}
                    </p>
                  </div>

                  {/* Answer Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        Your Answer
                        {dictationListening && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            <Mic className="w-3 h-3 mr-1" />
                            Listening
                          </Badge>
                        )}
                      </label>
                      <span className="text-xs text-zinc-500">
                        {answers[currentQuestion]?.length || 0} characters
                      </span>
                    </div>
                    <Textarea
                      data-testid="answer-textarea"
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here... or use Dictation to speak your answer."
                      rows={10}
                      className="resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-base leading-relaxed"
                    />
                    {dictationListening && dictationInterim && (
                      <div className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                        <span className="text-zinc-500">Live transcript: </span>
                        {dictationInterim}
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      data-testid="prev-btn"
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestion(Math.max(0, currentQuestion - 1))
                      }
                      disabled={currentQuestion === 0}
                      className="border-zinc-700 text-white hover:bg-zinc-800 gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex gap-3">
                      {currentQuestion < questions.length - 1 ? (
                        <Button
                          data-testid="next-btn"
                          onClick={() =>
                            setCurrentQuestion(currentQuestion + 1)
                          }
                          disabled={!(answers[currentQuestion] || "").trim()}
                          className="bg-white text-black hover:bg-zinc-200 gap-2"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          data-testid="submit-interview-btn"
                          onClick={submitInterview}
                          disabled={loading || answers.some((a) => !a.trim())}
                          className="bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Evaluating...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit Interview
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-orange-400" />
                    <p className="text-sm text-zinc-400">
                      <span className="text-orange-400 font-medium">Tip: </span>
                      {
                        interviewTips[interviewType][
                          currentQuestion % interviewTips[interviewType].length
                        ]
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar: Camera + Speech-to-text */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5 text-orange-400" />
                    Camera
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Optional — helps simulate real interviews
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {videoEnabled ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-800 text-center">
                      <VideoOff className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
                      <div className="text-sm text-zinc-400">
                        Camera is off.
                      </div>
                      {cameraError && (
                        <div className="text-xs text-zinc-500 mt-2">
                          {cameraError}
                        </div>
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={videoEnabled ? stopCamera : startCamera}
                    className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    {videoEnabled ? (
                      <>
                        <VideoOff className="w-4 h-4 mr-2" /> Stop Camera
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" /> Start Camera
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Mic className="w-5 h-5 text-orange-400" />
                    Speech-to-Text
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Speak and it will fill the answer box
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!dictationSupported ? (
                    <div className="text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-800 rounded-xl p-4">
                      Speech-to-text isn’t supported in this browser.
                      <div className="text-xs text-zinc-500 mt-1">
                        Use Chrome/Edge for dictation.
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-800 rounded-xl p-4">
                      Status: {dictationListening ? "Listening" : "Off"}
                      <div className="text-xs text-zinc-500 mt-1">
                        Tip: speak in full sentences; pause to finalize text.
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={
                      dictationListening ? stopDictation : startDictation
                    }
                    disabled={!dictationSupported}
                    className="w-full border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {dictationListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" /> Stop Dictation
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" /> Start Dictation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* AI Typing Indicator */}
        {typingIndicator && (
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Bot className="w-16 h-16 text-white animate-pulse" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-white animate-bounce" />
                  </div>
                </div>
                <div>
                  <p className="text-lg text-white mb-2">
                    AI is analyzing your responses...
                  </p>
                  <p className="text-sm text-zinc-400">
                    Evaluating communication, knowledge, and problem-solving
                    skills
                  </p>
                </div>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-6">
            {/* Score Hero Card */}
            <Card
              className={`bg-gradient-to-br ${getScoreBg(
                evaluation.readiness_score
              )} border`}
            >
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-zinc-400 mb-2">Interview Complete!</p>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      Your Readiness Score
                    </h2>
                    <p className="text-zinc-400">
                      {getScoreLabel(evaluation.readiness_score)}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-zinc-800/50 flex items-center justify-center">
                      <div className="text-center">
                        <p
                          className={`text-4xl sm:text-5xl font-bold ${getScoreColor(
                            evaluation.readiness_score
                          )}`}
                        >
                          {evaluation.readiness_score}
                        </p>
                        <p className="text-zinc-400 text-sm">out of 100</p>
                      </div>
                    </div>
                    {evaluation.readiness_score >= 80 && (
                      <div className="absolute -top-2 -right-2">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-700/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {questions.length}
                    </p>
                    <p className="text-xs text-zinc-400">Questions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {formatTime(timer)}
                    </p>
                    <p className="text-xs text-zinc-400">Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white capitalize">
                      {interviewType}
                    </p>
                    <p className="text-xs text-zinc-400">Type</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-800/30">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg"
                      >
                        <Star className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-200">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.weaknesses.map((weakness, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-200">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-white" />
                  Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="evaluation-results">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {evaluation.evaluation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                data-testid="new-interview-btn"
                onClick={resetInterview}
                className="flex-1 h-14 rounded-xl font-semibold bg-white text-black hover:bg-zinc-200"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Start New Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Review saved to your history");
                }}
                className="flex-1 h-14 rounded-xl font-semibold border-zinc-700 text-white hover:bg-zinc-800"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Review Answers
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MockInterview;
