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
import axiosInstance from "../lib/axios";
import { getUser } from "../lib/utils";
import { toast } from "sonner";

const TutorPage = () => {
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
    streak: 0,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(null);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("online");
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const topics = [
    { value: "python", label: "Python", icon: Code, color: "white" },
    { value: "java", label: "Java", icon: Code, color: "white" },
    {
      value: "javascript",
      label: "JavaScript",
      icon: Code,
      color: "white",
    },
    { value: "dsa", label: "Data Structures", icon: Database, color: "white" },
    { value: "sql", label: "SQL", icon: Database, color: "white" },
    { value: "aptitude", label: "Aptitude", icon: Calculator, color: "white" },
    {
      value: "system-design",
      label: "System Design",
      icon: Target,
      color: "white",
    },
    {
      value: "web-dev",
      label: "Web Development",
      icon: Code,
      color: "white",
    },
  ];

  const quickPrompts = [
    "Explain with an example",
    "What are the key concepts?",
    "Common interview questions",
    "Best practices",
    "Real-world applications",
  ];

  useEffect(() => {
    const urlTopic = searchParams.get("topic");
    if (urlTopic) {
      setInput(`Teach me about ${urlTopic}`);
    }

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
        setSessionStats(JSON.parse(savedStats));
      } else {
        const legacyStats = localStorage.getItem("tutorStats");
        if (legacyStats) {
          localStorage.setItem(tutorStatsKey, legacyStats);
          localStorage.removeItem("tutorStats");
          setSessionStats(JSON.parse(legacyStats));
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
    scrollToBottom();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        streak: prev.streak + 1,
      };
      localStorage.setItem(tutorStatsKey, JSON.stringify(newStats));
      return newStats;
    });

    try {
      const response = await axiosInstance.post("/tutor/chat", {
        message: messageToSend,
        topic,
        difficulty,
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
      isHelpful ? "Thanks for the feedback! 👍" : "We'll improve! 📝"
    );
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(tutorHistoryKey);
    toast.success("Chat history cleared");
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
            Topic
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-1">
            {topics.slice(0, 4).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setTopic(t.value);
                    onClose?.();
                  }}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    topic === t.value
                      ? "border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(var(--accent-rgb),0.1)]"
                      : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 mb-1 ${
                      topic === t.value
                        ? "text-[var(--accent-color)]"
                        : "text-zinc-500"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      topic === t.value ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {t.label}
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
              <SelectValue placeholder="More topics..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {topics.map((t) => {
                const Icon = t.icon;
                return (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {t.label}
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
            Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-1">
            {[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Medium" },
              { value: "advanced", label: "Expert" },
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
                streak: 0,
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
                AI Personal Tutor
                <Badge className="bg-white text-black border-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini Powered
                </Badge>
              </h1>
              <p className="text-zinc-400 text-sm flex items-center gap-2">
                <CircleDot className="w-3 h-3 text-[var(--accent-color)]" />
                {aiStatus === "online"
                  ? "Ready to help"
                  : aiStatus === "thinking"
                  ? "Processing..."
                  : aiStatus === "responding"
                  ? "Generating response..."
                  : "Reconnecting..."}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Flame className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-medium">
                {sessionStats.streak}
              </span>
              <span className="text-xs text-zinc-500">streak</span>
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
                      AI Tutor
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
                        <SheetTitle className="text-white">Options</SheetTitle>
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
                    {messages.length} messages
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 p-4 overflow-y-auto space-y-4"
                data-testid="chat-messages"
              >
                {messages.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                      <Bot className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Welcome to AI Tutor!
                    </h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                      I'm your personal learning assistant powered by Gemini AI.
                      Ask me anything about {currentTopic?.label}!
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
                              AI is thinking...
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
                <div className="flex flex-row gap-2 sm:gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      data-testid="message-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSend()
                      }
                      placeholder={`Ask about ${currentTopic?.label}...`}
                      disabled={loading}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[var(--accent-color)] pr-10 sm:pr-12 h-10 sm:h-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                      {input.length > 0 && `${input.length}`}
                    </div>
                  </div>
                  <Button
                    data-testid="send-btn"
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
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
