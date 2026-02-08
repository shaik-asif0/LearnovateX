import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  Send,
  Bot,
  Loader2,
  Sparkles,
  BookOpen,
  Code,
  Database,
  Calculator,
  Lightbulb,
  Trash2,
  Copy,
  Plus,
  Image as ImageIcon,
  FileText,
  Youtube,
  Check,
  MessageCircle,
  Zap,
  Target,
  Clock,
  Star,
  RefreshCw,
  User,
  Mic,
  MicOff,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Share,
  X,
  Bookmark,
  MoreHorizontal,
  ChevronDown,
  History,
  Flame,
  Trophy,
  GraduationCap,
  ArrowRight,
  CircleDot,
  Library,
  Crosshair,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import axiosInstance from "../lib/axios";
import { getUser } from "../lib/utils";
import { toast } from "sonner";
import { useI18n } from "../i18n/I18nProvider";

const TutorPage = () => {
  const { t } = useI18n();
  const user = getUser();
  const tutorHistoryKey =
    user?.id || user?._id || user?.email
      ? `tutorChatHistory:${user.id || user._id || user.email}`
      : "tutorChatHistory:anonymous";
  const tutorStatsKey =
    user?.id || user?._id || user?.email
      ? `tutorStats:${user.id || user._id || user.email}`
      : "tutorStats:anonymous";

  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("python");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    topicsExplored: [],
    sessionTime: 0,
  });
  const [loginDisplayStreak, setLoginDisplayStreak] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(null);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("online");
  const [contextIds, setContextIds] = useState([]);
  const [attachedContexts, setAttachedContexts] = useState([]);
  const [contextUploading, setContextUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const autoScrollRef = useRef(true);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const docInputRef = useRef(null);

  const extractYouTubeUrl = (text) => {
    if (!text) return null;
    const s = String(text);
    const match = s.match(
      /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^\s&]+|youtu\.be\/[^\s?&]+)[^\s]*)/i
    );
    return match ? match[1] : null;
  };

  const uploadTutorContext = async (file) => {
    if (!file) return null;
    const maxMb = 20;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(
        t("tutor.upload.too_large", `File too large. Max ${maxMb}MB`)
      );
      return null;
    }

    setContextUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axiosInstance.post("/tutor/context/upload", form);

      const newId = res?.data?.context_id;
      if (!newId) throw new Error("No context_id returned");

      setContextIds((prev) => Array.from(new Set([...(prev || []), newId])));

      const filename = res?.data?.filename || file.name;
      const kind = res?.data?.kind || "file";
      setAttachedContexts((prev) => {
        const next = [...(prev || [])];
        if (!next.some((c) => c.id === newId)) {
          next.push({ id: newId, kind, label: filename });
        }
        return next;
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t(
            "tutor.attached_file",
            `Attached: ${filename}. Ask me anything based on this file.`
          ),
          timestamp: new Date().toISOString(),
        },
      ]);

      const warning = res?.data?.warning;
      if (warning) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Note: ${warning}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      return newId;
    } catch (e) {
      const detail =
        e?.response?.data?.detail ||
        e?.message ||
        t("tutor.upload.failed", "Failed to upload file");
      toast.error(detail);
      return null;
    } finally {
      setContextUploading(false);
    }
  };

  const ingestYouTubeContext = async (url) => {
    if (!url) return null;
    setContextUploading(true);
    try {
      const res = await axiosInstance.post("/tutor/context/youtube", { url });
      const newId = res?.data?.context_id;
      if (!newId) throw new Error("No context_id returned");
      setContextIds((prev) => Array.from(new Set([...(prev || []), newId])));
      const videoId = res?.data?.video_id;
      setAttachedContexts((prev) => {
        const next = [...(prev || [])];
        if (!next.some((c) => c.id === newId)) {
          next.push({
            id: newId,
            kind: "youtube",
            label: videoId ? `YouTube (${videoId})` : "YouTube",
          });
        }
        return next;
      });
      return newId;
    } catch (e) {
      const detail =
        e?.response?.data?.detail ||
        e?.message ||
        t("tutor.upload.youtube_failed", "Failed to read YouTube link");
      toast.error(detail);
      return null;
    } finally {
      setContextUploading(false);
    }
  };

  const removeAttachedContext = (id) => {
    if (!id) return;
    setContextIds((prev) => (prev || []).filter((x) => x !== id));
    setAttachedContexts((prev) => (prev || []).filter((c) => c.id !== id));
  };

  const topics = [
    {
      value: "python",
      label: t("tutor.topic.python", "Python"),
      icon: Code,
      color: "white",
    },
    {
      value: "java",
      label: t("tutor.topic.java", "Java"),
      icon: Code,
      color: "white",
    },
    {
      value: "javascript",
      label: t("tutor.topic.javascript", "JavaScript"),
      icon: Code,
      color: "white",
    },
    {
      value: "dsa",
      label: t("tutor.topic.dsa", "Data Structures"),
      icon: Database,
      color: "white",
    },
    {
      value: "sql",
      label: t("tutor.topic.sql", "SQL"),
      icon: Database,
      color: "white",
    },
    {
      value: "aptitude",
      label: t("tutor.topic.aptitude", "Aptitude"),
      icon: Calculator,
      color: "white",
    },
    {
      value: "system-design",
      label: t("tutor.topic.system_design", "System Design"),
      icon: Target,
      color: "white",
    },
    {
      value: "web-dev",
      label: t("tutor.topic.web_dev", "Web Development"),
      icon: Code,
      color: "white",
    },
  ];

  const quickPrompts = [
    t("tutor.quick.explain_example", "Explain with an example"),
    t("tutor.quick.key_concepts", "What are the key concepts?"),
    t("tutor.quick.common_questions", "Common interview questions"),
    t("tutor.quick.best_practices", "Best practices"),
    t("tutor.quick.real_world", "Real-world applications"),
  ];

  useEffect(() => {
    const urlTopic = searchParams.get("topic");
    if (urlTopic) {
      setInput(`Teach me about ${urlTopic}`);
    }

    const normalizeStats = (stats) => {
      const safe = stats && typeof stats === "object" ? stats : {};
      return {
        questionsAsked: Number(safe.questionsAsked) || 0,
        topicsExplored: Array.isArray(safe.topicsExplored)
          ? safe.topicsExplored
          : [],
        sessionTime: Number(safe.sessionTime) || 0,
      };
    };

    const loadStreaks = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/stats");
        const value = Number(res?.data?.login_display_current_streak);
        setLoginDisplayStreak(Number.isFinite(value) ? value : 0);
      } catch (e) {
        setLoginDisplayStreak(0);
      }
    };
    loadStreaks();

    try {
      const savedMessages = localStorage.getItem(tutorHistoryKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        const legacyMessages = localStorage.getItem("tutorChatHistory");
        if (legacyMessages) {
          localStorage.setItem(tutorHistoryKey, legacyMessages);
          localStorage.removeItem("tutorChatHistory");
          setMessages(JSON.parse(legacyMessages));
        }
      }

      const savedStats = localStorage.getItem(tutorStatsKey);
      if (savedStats) {
        setSessionStats(normalizeStats(JSON.parse(savedStats)));
      } else {
        const legacyStats = localStorage.getItem("tutorStats");
        if (legacyStats) {
          localStorage.setItem(tutorStatsKey, legacyStats);
          localStorage.removeItem("tutorStats");
          setSessionStats(normalizeStats(JSON.parse(legacyStats)));
        }
      }
    } catch (e) {
      // ignore malformed storage
    }

    timerRef.current = setInterval(() => {
      setSessionStats((prev) => {
        const newStats = { ...prev, sessionTime: prev.sessionTime + 1 };
        localStorage.setItem(tutorStatsKey, JSON.stringify(newStats));
        return newStats;
      });
    }, 1000);

    generateSuggestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
    if (messages.length > 0) {
      localStorage.setItem(
        tutorHistoryKey,
        JSON.stringify(messages.slice(-50))
      );
    }
  }, [messages]);

  useEffect(() => {
    generateSuggestions();
  }, [topic]);

  const updateAutoScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom < 120;
  };

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (!autoScrollRef.current) return;
    if (behavior === "smooth") {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isTyping) return;
    scrollToBottom("auto");
  }, [typingText, isTyping]);

  const generateSuggestions = () => {
    const topicSuggestions = {
      python: [
        "What are Python decorators?",
        "Explain list comprehensions",
        "How does Python memory management work?",
      ],
      java: [
        "What is OOP in Java?",
        "Explain Java collections",
        "What are Java streams?",
      ],
      javascript: [
        "What is closure in JS?",
        "Explain async/await",
        "What is the event loop?",
      ],
      dsa: [
        "Explain binary search",
        "What is dynamic programming?",
        "How do hash tables work?",
      ],
      sql: [
        "What are SQL joins?",
        "Explain indexing",
        "What is normalization?",
      ],
      aptitude: [
        "Solve percentage problems",
        "Time and work concepts",
        "Probability basics",
      ],
      "system-design": [
        "Design a URL shortener",
        "How does load balancing work?",
        "Explain microservices",
      ],
      "web-dev": [
        "What is REST API?",
        "Explain React hooks",
        "CSS flexbox vs grid",
      ],
    };
    setSuggestions(topicSuggestions[topic] || []);
  };

  const simulateTyping = async (fullText) => {
    setIsTyping(true);
    setTypingText("");

    // Simulate typing effect
    const words = fullText.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setTypingText(currentText);
      await new Promise((resolve) =>
        setTimeout(resolve, 30 + Math.random() * 20)
      );
    }

    setIsTyping(false);
    return fullText;
  };

  const handleSend = async (customMessage) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    // If the user pasted a YouTube link, ingest transcript as context before asking.
    const ytUrl = extractYouTubeUrl(messageToSend);
    let ytContextId = null;
    if (ytUrl) {
      ytContextId = await ingestYouTubeContext(ytUrl);
    }

    const userMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setAiStatus("thinking");

    setSessionStats((prev) => {
      const newStats = {
        ...prev,
        questionsAsked: prev.questionsAsked + 1,
        topicsExplored: prev.topicsExplored.includes(topic)
          ? prev.topicsExplored
          : [...prev.topicsExplored, topic],
      };
      localStorage.setItem(tutorStatsKey, JSON.stringify(newStats));
      return newStats;
    });

    try {
      const response = await axiosInstance.post("/tutor/chat", {
        message: messageToSend,
        topic,
        difficulty,
        context_ids: Array.from(
          new Set([
            ...(contextIds || []),
            ...(ytContextId ? [ytContextId] : []),
          ])
        ),
      });

      setAiStatus("responding");

      // Simulate typing effect for response
      const fullResponse = response.data.response;
      await simulateTyping(fullResponse);

      const aiMessage = {
        role: "assistant",
        content: fullResponse,
        timestamp: new Date().toISOString(),
        topic: topic,
        helpful: null,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setAiStatus("online");
    } catch (error) {
      setAiStatus("error");
      toast.error("Failed to get response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again or rephrase your question.",
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
      setTimeout(() => setAiStatus("online"), 2000);
    } finally {
      setLoading(false);
      setIsTyping(false);
      setTypingText("");
    }
  };

  const handleFeedback = (index, isHelpful) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], helpful: isHelpful };
      return updated;
    });
    toast.success(
      isHelpful
        ? t("tutor.toasts.feedback_thanks", "Thanks for the feedback! 👍")
        : t("tutor.toasts.feedback_improve", "We'll improve! 📝")
    );
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
    toast.success(t("tutor.toasts.copied", "Copied to clipboard!"));
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(tutorHistoryKey);
    toast.success(t("tutor.toasts.history_cleared", "Chat history cleared"));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = () => {
    switch (aiStatus) {
      case "online":
        return "bg-[var(--accent-color)]";
      case "thinking":
        return "bg-[var(--accent-color)] animate-pulse";
      case "responding":
        return "bg-[var(--accent-color)] animate-pulse";
      case "error":
        return "bg-[var(--accent-color)]";
      default:
        return "bg-[var(--accent-color)]";
    }
  };

  const currentTopic = topics.find((t) => t.value === topic);

  const OptionsPanel = ({ onClose }) => (
    <div className="space-y-3">
      {/* Topic Selection */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400 flex items-center gap-2">
            <Library className="w-3 h-3" />
            {t("tutor.options.topic", "Topic")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-1">
            {topics.slice(0, 4).map((topicItem) => {
              const Icon = topicItem.icon;
              return (
                <button
                  aria-label={t("tutor.aria.open_options", "Open options")}
                  onClick={() => {
                    setTopic(topicItem.value);
                    onClose?.();
                  }}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    topic === topicItem.value
                      ? "border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(var(--accent-rgb),0.1)]"
                      : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 mb-1 ${
                      topic === topicItem.value
                        ? "text-[var(--accent-color)]"
                        : "text-zinc-500"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      topic === topicItem.value ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {topicItem.label}
                  </p>
                </button>
              );
            })}
          </div>
          <Select
            value={topic}
            onValueChange={(value) => {
              setTopic(value);
              onClose?.();
            }}
          >
            <SelectTrigger className="mt-3 bg-zinc-800 border-zinc-700 text-white text-sm">
              <SelectValue
                placeholder={t("tutor.options.more_topics", "More topics...")}
              />
            </SelectTrigger>
            <SelectContent
              portalled={false}
              className="bg-zinc-900 border-zinc-800"
            >
              {topics.map((topicItem) => {
                const Icon = topicItem.icon;
                return (
                  <SelectItem key={topicItem.value} value={topicItem.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {topicItem.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Difficulty */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400 flex items-center gap-2">
            <Crosshair className="w-3 h-3" />
            {t("tutor.difficulty", "Difficulty")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-1">
            {[
              {
                value: "beginner",
                label: t("tutor.level.beginner", "Beginner"),
              },
              {
                value: "intermediate",
                label: t("tutor.level.intermediate", "Medium"),
              },
              { value: "advanced", label: t("tutor.level.advanced", "Expert") },
            ].map((d) => (
              <button
                key={d.value}
                onClick={() => {
                  setDifficulty(d.value);
                  onClose?.();
                }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  difficulty === d.value
                    ? "bg-[rgba(var(--accent-rgb),0.2)] text-[var(--accent-color)] border border-[rgba(var(--accent-rgb),0.3)]"
                    : "bg-zinc-800 text-zinc-400 border border-transparent hover:border-zinc-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-zinc-400 flex items-center gap-2">
            <History className="w-3 h-3" />
            {t("tutor.history.title", "History")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
            {messages.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">
                {t("tutor.history.empty", "No history yet")}
              </p>
            ) : (
              messages.slice(-30).map((m, idx) => {
                const baseIndex = Math.max(0, messages.length - 30);
                const absoluteIndex = baseIndex + idx;
                const preview = String(m?.content || "").slice(0, 60);
                return (
                  <button
                    key={`${absoluteIndex}-${m?.timestamp || idx}`}
                    onClick={() => {
                      const el = document.getElementById(
                        `tutor-msg-${absoluteIndex}`
                      );
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      onClose?.();
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-400 capitalize">
                        {m?.role === "user"
                          ? t("tutor.you", "You")
                          : t("tutor.ai", "AI")}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {m?.timestamp
                          ? new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="text-xs text-white/90 truncate">
                      {preview || "(empty)"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => {
              clearHistory();
              onClose?.();
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => {
              setSessionStats({
                questionsAsked: 0,
                topicsExplored: [],
                sessionTime: 0,
              });
              localStorage.removeItem(tutorStatsKey);
              toast.success("Session reset!");
              onClose?.();
            }}
          >
            <RefreshCw className="w-4 h-4" />
            New Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="bg-black overflow-hidden h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-4rem)]">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-6 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="hidden md:flex md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded-2xl shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-black`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex flex-wrap items-center gap-2">
                {t("tutor.title", "AI Personal Tutor")}
                <Badge className="bg-white text-black border-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t("tutor.badge.gemini", "Gemini Powered")}
                </Badge>
              </h1>
              <p className="text-zinc-400 text-sm flex items-center gap-2">
                <CircleDot className="w-3 h-3 text-[var(--accent-color)]" />
                {aiStatus === "online"
                  ? t("tutor.status.ready", "Ready to help")
                  : aiStatus === "thinking"
                  ? t("tutor.status.processing", "Processing...")
                  : aiStatus === "responding"
                  ? t("tutor.status.generating", "Generating response...")
                  : t("tutor.status.reconnecting", "Reconnecting...")}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Flame className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-medium">
                {loginDisplayStreak}
              </span>
              <span className="text-xs text-zinc-500">
                {t("tutor.loginStreak", "login streak")}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-mono">
                {formatTime(sessionStats.sessionTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
              <MessageCircle className="w-4 h-4 text-[var(--accent-color)]" />
              <span className="text-sm text-white">
                {sessionStats.questionsAsked}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1 min-h-0">
            <div className="h-full overflow-y-auto">
              <OptionsPanel />
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 min-h-0">
            <Card className="h-full min-h-0 flex flex-col bg-zinc-900 border-zinc-800">
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative hidden sm:block">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-zinc-900`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {t("nav.aiTutor", "AI Tutor")}
                    </p>
                    <p className="hidden sm:block text-xs text-zinc-500 truncate">
                      {currentTopic?.label} • {difficulty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Mobile: full-screen options like ChatGPT */}
                  <Sheet
                    open={mobileOptionsOpen}
                    onOpenChange={setMobileOptionsOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="lg:hidden border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        aria-label="Open options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[60vw] sm:max-w-sm bg-zinc-900 border-zinc-800 overflow-y-auto"
                    >
                      <SheetHeader className="pr-8">
                        <SheetTitle className="text-white">
                          {t("tutor.options.title", "Options")}
                        </SheetTitle>
                        <p className="text-sm text-zinc-400">
                          {currentTopic?.label} • {difficulty}
                        </p>
                      </SheetHeader>
                      <div className="mt-4">
                        <OptionsPanel
                          onClose={() => setMobileOptionsOpen(false)}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Badge
                    variant="outline"
                    className="hidden sm:inline-flex border-zinc-700 text-zinc-400 text-xs"
                  >
                    <History className="w-3 h-3 mr-1" />
                    {messages.length} {t("tutor.messages", "messages")}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 p-4 overflow-y-auto space-y-4"
                data-testid="chat-messages"
                ref={messagesContainerRef}
                onScroll={updateAutoScroll}
              >
                {messages.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                      <Bot className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {t("tutor.welcomeTitle", "Welcome to AI Tutor!")}
                    </h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                      {t(
                        "tutor.welcomeDescription",
                        `I'm your personal learning assistant powered by Gemini AI. Ask me anything about ${currentTopic?.label}!`
                      )}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                      {quickPrompts.map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          onClick={() => handleSend(`${prompt} about ${topic}`)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    id={`tutor-msg-${index}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)]"
                            : "bg-gradient-to-br from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)]"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message */}
                      <div className="group">
                        <div
                          className={`relative p-4 ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] text-white rounded-2xl rounded-tr-sm"
                              : msg.error
                              ? "bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--accent-rgb),0.9)] rounded-2xl rounded-tl-sm border border-[rgba(var(--accent-rgb),0.3)]"
                              : "bg-zinc-800 text-white rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>

                        {/* Actions for AI messages */}
                        {msg.role === "assistant" && !msg.error && (
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                copyToClipboard(msg.content, index)
                              }
                              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              {copied === index ? (
                                <Check className="w-4 h-4 text-[var(--accent-color)]" />
                              ) : (
                                <Copy className="w-4 h-4 text-zinc-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleFeedback(index, true)}
                              className={`p-1.5 hover:bg-zinc-800 rounded-lg transition-colors ${
                                msg.helpful === true
                                  ? "text-[var(--accent-color)]"
                                  : "text-zinc-500"
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleFeedback(index, false)}
                              className={`p-1.5 hover:bg-zinc-800 rounded-lg transition-colors ${
                                msg.helpful === false
                                  ? "text-[var(--accent-color)]"
                                  : "text-zinc-500"
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {(loading || isTyping) && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-2xl rounded-tl-sm">
                        {isTyping && typingText ? (
                          <p className="text-sm text-white whitespace-pre-wrap">
                            {typingText}
                            <span className="animate-pulse">▊</span>
                          </p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span
                                className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                            <span className="text-sm text-zinc-400">
                              {t(
                                "tutor.status.ai_thinking",
                                "AI is thinking..."
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur">
                {attachedContexts?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedContexts.map((ctx) => (
                      <div
                        key={ctx.id}
                        className="flex items-center gap-2 px-2 py-1 rounded-full border border-zinc-700 bg-zinc-800/60 text-xs text-zinc-200"
                        title={ctx.label}
                      >
                        {ctx.kind === "youtube" ? (
                          <Youtube className="w-3.5 h-3.5" />
                        ) : ctx.kind === "image" ? (
                          <ImageIcon className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span className="max-w-[180px] sm:max-w-[260px] truncate">
                          {ctx.label}
                        </span>
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-zinc-700"
                          aria-label={t(
                            "tutor.aria.remove_attachment",
                            "Remove attachment"
                          )}
                          onClick={() => removeAttachedContext(ctx.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-row gap-2 sm:gap-3 items-end">
                  {/* Hidden file inputs */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) await uploadTutorContext(file);
                    }}
                  />
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) await uploadTutorContext(file);
                    }}
                  />
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) await uploadTutorContext(file);
                    }}
                  />

                  {/* + Attachment menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-12 sm:w-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        aria-label={t("tutor.aria.attach", "Attach")}
                        disabled={contextUploading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    >
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          imageInputRef.current?.click();
                        }}
                        className="focus:bg-zinc-800"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {t("tutor.dropdown.image", "Image")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          pdfInputRef.current?.click();
                        }}
                        className="focus:bg-zinc-800"
                      >
                        <FileText className="w-4 h-4" />
                        {t("tutor.dropdown.pdf", "PDF")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          docInputRef.current?.click();
                        }}
                        className="focus:bg-zinc-800"
                      >
                        <FileText className="w-4 h-4" />
                        {t("tutor.dropdown.doc", "DOC / DOCX")}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="opacity-60">
                        <Youtube className="w-4 h-4" />
                        {t(
                          "tutor.dropdown.paste_youtube",
                          "Paste a YouTube link in chat"
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      data-testid="message-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!loading && input.trim()) handleSend();
                        }
                      }}
                      placeholder={`Ask about ${currentTopic?.label}...`}
                      disabled={false}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[var(--accent-color)] pr-10 sm:pr-12 h-10 sm:h-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                      {input.length > 0 && `${input.length}`}
                    </div>
                  </div>
                  <Button
                    data-testid="send-btn"
                    type="button"
                    onClick={() => handleSend()}
                    disabled={loading || contextUploading || !input.trim()}
                    className="h-10 w-10 sm:h-12 sm:w-auto sm:px-6 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] text-white hover:opacity-90 rounded-full sm:rounded-md"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  AI Tutor uses Gemini API to provide real-time learning
                  assistance
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorPage;
