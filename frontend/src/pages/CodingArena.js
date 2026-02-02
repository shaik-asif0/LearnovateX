import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Code,
  Play,
  Loader2,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Sparkles,
  AlertCircle,
  Star,
  Bot,
  MessageSquare,
  Send,
  User,
  Lightbulb,
  ChevronRight,
  Flame,
  Award,
  BarChart3,
  History,
  ThumbsUp,
  ArrowRight,
  CircleDot,
  Timer,
  Pause,
  RotateCcw,
  Terminal,
  Crosshair,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import { getUser } from "../lib/utils";

const CodingArena = () => {
  const user = getUser();
  const codingStreakKey =
    user?.id || user?._id || user?.email
      ? `codingStreak:${user.id || user._id || user.email}`
      : "codingStreak:anonymous";
  const codingSubmissionsKey =
    user?.id || user?._id || user?.email
      ? `codingSubmissions:${user.id || user._id || user.email}`
      : "codingSubmissions:anonymous";

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [problemId, setProblemId] = useState("fibonacci");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("problem");

  // AI Chatbot states
  const [aiStatus, setAiStatus] = useState("online"); // online, thinking, analyzing, responding, error
  const [displayedEvaluation, setDisplayedEvaluation] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [streak, setStreak] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, displayedEvaluation]);

  // Typing simulation effect for evaluation
  useEffect(() => {
    if (evaluation?.evaluation && !isTyping) {
      setIsTyping(true);
      setDisplayedEvaluation("");
      let index = 0;
      const text = evaluation.evaluation;

      const typeChar = () => {
        if (index < text.length) {
          setDisplayedEvaluation(text.substring(0, index + 1));
          index++;
          typingTimeoutRef.current = setTimeout(typeChar, 10);
        } else {
          setIsTyping(false);
          setAiStatus("online");
        }
      };

      typeChar();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [evaluation]);

  // Load streak from localStorage
  useEffect(() => {
    try {
      const savedStreak = localStorage.getItem(codingStreakKey);
      if (savedStreak) {
        setStreak(parseInt(savedStreak));
      } else {
        const legacy = localStorage.getItem("codingStreak");
        if (legacy) {
          localStorage.setItem(codingStreakKey, legacy);
          localStorage.removeItem("codingStreak");
          setStreak(parseInt(legacy));
        }
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, []);

  const problems = [
    {
      id: "fibonacci",
      title: "Fibonacci Series",
      difficulty: "Easy",
      description:
        "Write a function to return the nth Fibonacci number. The Fibonacci sequence is 0, 1, 1, 2, 3, 5, 8, 13...",
      examples: "Input: n=5\nOutput: 5\n\nInput: n=10\nOutput: 55",
      starterCode: {
        python:
          "def fibonacci(n):\n    # Write your code here\n    pass\n\n# Test your function\nprint(fibonacci(10))",
        javascript:
          "function fibonacci(n) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(fibonacci(10));",
        java: "public class Solution {\n    public static int fibonacci(int n) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(fibonacci(10));\n    }\n}",
      },
      tags: ["Recursion", "Dynamic Programming"],
    },
    {
      id: "reverse-string",
      title: "Reverse String",
      difficulty: "Easy",
      description:
        "Write a function that reverses a string. The input string is given as an array of characters.",
      examples:
        "Input: 'hello'\nOutput: 'olleh'\n\nInput: 'world'\nOutput: 'dlrow'",
      starterCode: {
        python:
          "def reverse_string(s):\n    # Write your code here\n    pass\n\n# Test your function\nprint(reverse_string('hello'))",
        javascript:
          "function reverseString(s) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(reverseString('hello'));",
        java: 'public class Solution {\n    public static String reverseString(String s) {\n        // Write your code here\n        return "";\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(reverseString("hello"));\n    }\n}',
      },
      tags: ["String", "Two Pointers"],
    },
    {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Medium",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples:
        "Input: nums=[2,7,11,15], target=9\nOutput: [0,1]\n\nInput: nums=[3,2,4], target=6\nOutput: [1,2]",
      starterCode: {
        python:
          "def two_sum(nums, target):\n    # Write your code here\n    pass\n\n# Test your function\nprint(two_sum([2,7,11,15], 9))",
        javascript:
          "function twoSum(nums, target) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(twoSum([2,7,11,15], 9));",
        java: "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        int[] result = twoSum(new int[]{2,7,11,15}, 9);\n        System.out.println(Arrays.toString(result));\n    }\n}",
      },
      tags: ["Array", "Hash Table"],
    },
    {
      id: "palindrome",
      title: "Palindrome Check",
      difficulty: "Easy",
      description:
        "Write a function that checks if a given string is a palindrome. Consider only alphanumeric characters and ignore cases.",
      examples:
        "Input: 'A man a plan a canal Panama'\nOutput: true\n\nInput: 'race a car'\nOutput: false",
      starterCode: {
        python:
          "def is_palindrome(s):\n    # Write your code here\n    pass\n\n# Test your function\nprint(is_palindrome('A man a plan a canal Panama'))",
        javascript:
          "function isPalindrome(s) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(isPalindrome('A man a plan a canal Panama'));",
        java: 'public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(isPalindrome("A man a plan a canal Panama"));\n    }\n}',
      },
      tags: ["String", "Two Pointers"],
    },
    {
      id: "binary-search",
      title: "Binary Search",
      difficulty: "Medium",
      description:
        "Implement binary search to find the target in a sorted array. Return the index if found, otherwise return -1.",
      examples:
        "Input: nums=[-1,0,3,5,9,12], target=9\nOutput: 4\n\nInput: nums=[-1,0,3,5,9,12], target=2\nOutput: -1",
      starterCode: {
        python:
          "def binary_search(nums, target):\n    # Write your code here\n    pass\n\n# Test your function\nprint(binary_search([-1,0,3,5,9,12], 9))",
        javascript:
          "function binarySearch(nums, target) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(binarySearch([-1,0,3,5,9,12], 9));",
        java: "public class Solution {\n    public static int binarySearch(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(binarySearch(new int[]{-1,0,3,5,9,12}, 9));\n    }\n}",
      },
      tags: ["Binary Search", "Array"],
    },
    {
      id: "merge-sorted",
      title: "Merge Sorted Arrays",
      difficulty: "Hard",
      description:
        "Merge two sorted arrays into one sorted array. Do not use built-in sorting functions.",
      examples: "Input: arr1=[1,3,5], arr2=[2,4,6]\nOutput: [1,2,3,4,5,6]",
      starterCode: {
        python:
          "def merge_sorted(arr1, arr2):\n    # Write your code here\n    pass\n\n# Test your function\nprint(merge_sorted([1,3,5], [2,4,6]))",
        javascript:
          "function mergeSorted(arr1, arr2) {\n    // Write your code here\n}\n\n// Test your function\nconsole.log(mergeSorted([1,3,5], [2,4,6]));",
        java: "import java.util.*;\n\npublic class Solution {\n    public static int[] mergeSorted(int[] arr1, int[] arr2) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        int[] result = mergeSorted(new int[]{1,3,5}, new int[]{2,4,6});\n        System.out.println(Arrays.toString(result));\n    }\n}",
      },
      tags: ["Array", "Two Pointers", "Sorting"],
    },
  ];

  const currentProblem =
    problems.find((p) => p.id === problemId) || problems[0];

  useEffect(() => {
    // Load starter code when problem or language changes
    if (currentProblem.starterCode[language]) {
      setCode(currentProblem.starterCode[language]);
    }
  }, [problemId, language]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    // Load submissions from localStorage
    try {
      const savedSubmissions = localStorage.getItem(codingSubmissionsKey);
      if (savedSubmissions) {
        setSubmissions(JSON.parse(savedSubmissions));
      } else {
        const legacy = localStorage.getItem("codingSubmissions");
        if (legacy) {
          localStorage.setItem(codingSubmissionsKey, legacy);
          localStorage.removeItem("codingSubmissions");
          setSubmissions(JSON.parse(legacy));
        }
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-[rgb(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.10)]";
      case "Medium":
        return "text-[rgb(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.10)]";
      case "Hard":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-zinc-400 bg-zinc-500/10";
    }
  };

  const handleEvaluate = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setLoading(true);
    setEvaluation(null);
    setDisplayedEvaluation("");
    setIsTimerRunning(false);
    setAiStatus("analyzing");

    // Add user submission message
    const userMsg = {
      role: "user",
      content: `Submitted ${language} solution for "${currentProblem.title}"`,
      timestamp: new Date(),
      code: code,
    };
    setAiMessages((prev) => [...prev, userMsg]);

    // Simulate AI thinking phases
    setTimeout(() => setAiStatus("thinking"), 500);

    try {
      const response = await axiosInstance.post("/code/evaluate", {
        code,
        language,
        problem_id: problemId,
        user_id: "current",
      });

      setAiStatus("responding");
      setEvaluation(response.data);

      // Add AI response message
      const aiMsg = {
        role: "assistant",
        content: response.data.passed
          ? `🎉 Excellent work! Your solution passed all test cases with a score of ${response.data.score}/100!`
          : `📝 Good attempt! Your solution scored ${response.data.score}/100. Let me explain what can be improved...`,
        timestamp: new Date(),
        evaluation: response.data,
      };
      setAiMessages((prev) => [...prev, aiMsg]);

      // Save submission
      const newSubmission = {
        problemId,
        problemTitle: currentProblem.title,
        language,
        score: response.data.score,
        passed: response.data.passed,
        time: timer,
        timestamp: new Date().toISOString(),
      };
      const updatedSubmissions = [newSubmission, ...submissions.slice(0, 9)];
      setSubmissions(updatedSubmissions);
      localStorage.setItem(
        codingSubmissionsKey,
        JSON.stringify(updatedSubmissions)
      );

      // Update streak
      if (response.data.passed) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem(codingStreakKey, newStreak.toString());
        toast.success("Excellent! Your code passed all test cases! 🎉");
      } else {
        toast.warning("Code needs improvement. Check the AI feedback.");
      }
    } catch (error) {
      setAiStatus("error");
      toast.error("Failed to evaluate code. Please try again.");

      const errorMsg = {
        role: "assistant",
        content:
          "❌ Sorry, I encountered an error while evaluating your code. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Ask AI for help
  const askAiHelp = async () => {
    if (!userQuestion.trim()) return;

    const userMsg = {
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setUserQuestion("");
    setAiStatus("thinking");

    try {
      const response = await axiosInstance.post("/tutor/chat", {
        message: `Regarding the "${currentProblem.title}" coding problem: ${userQuestion}`,
        topic: "coding",
        user_id: "current",
      });

      setAiStatus("responding");
      const aiMsg = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => setAiStatus("online"), 1000);
    } catch (error) {
      setAiStatus("error");
      const errorMsg = {
        role: "assistant",
        content: "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Get AI status display
  const getAiStatusDisplay = () => {
    switch (aiStatus) {
      case "online":
        return {
          text: "AI Online",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "thinking":
        return {
          text: "Thinking...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "analyzing":
        return {
          text: "Analyzing Code...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "responding":
        return {
          text: "Responding...",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
      case "error":
        return { text: "Error", color: "text-red-400", bg: "bg-red-400" };
      default:
        return {
          text: "AI Online",
          color: "text-[rgb(var(--accent-rgb))]",
          bg: "bg-[rgb(var(--accent-rgb))]",
        };
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied to clipboard!");
  };

  const resetCode = () => {
    setCode(currentProblem.starterCode[language] || "");
    setEvaluation(null);
    setDisplayedEvaluation("");
    setTimer(0);
    setIsTimerRunning(false);
    toast.info("Code reset to starter template");
  };

  const aiStatusInfo = getAiStatusDisplay();

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded-2xl relative shadow-lg">
              <Code className="w-8 h-8 text-white" />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                  aiStatusInfo.bg
                } rounded-full border-2 border-black ${
                  aiStatus !== "online" ? "animate-pulse" : ""
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Coding Arena
                <Sparkles className="w-5 h-5 text-white" />
              </h1>
              <p
                className={`text-sm flex items-center gap-2 ${aiStatusInfo.color}`}
              >
                <Bot className="w-4 h-4" />
                {aiStatusInfo.text} • AI-powered evaluation
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hidden md:flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Flame className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-semibold">
                {streak} streak
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Timer className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white font-mono">
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg">
              <div className="w-4 h-4 bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgba(var(--accent-rgb),0.85)] rounded flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-white">
                {submissions.filter((s) => s.passed).length} solved
              </span>
            </div>
            <Button
              variant={isTimerRunning ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={
                isTimerRunning
                  ? "bg-red-500 hover:bg-red-600"
                  : "border-zinc-700 text-white hover:bg-zinc-800"
              }
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              {isTimerRunning ? "Pause" : "Start"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem & Editor */}
          <div className="space-y-4">
            {/* Problem Selection */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Select value={problemId} onValueChange={setProblemId}>
                    <SelectTrigger
                      data-testid="problem-select"
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {problems.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(
                                p.difficulty
                              )}`}
                            >
                              {p.difficulty}
                            </span>
                            {p.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger
                      data-testid="language-select"
                      className="w-40 bg-zinc-800 border-zinc-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="python">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Python
                        </span>
                      </SelectItem>
                      <SelectItem value="javascript">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          JavaScript
                        </span>
                      </SelectItem>
                      <SelectItem value="java">
                        <span className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Java
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Problem Description Tabs */}
            <Card className="bg-zinc-900 border-zinc-800">
              <div className="flex border-b border-zinc-800">
                {["problem", "examples", "hints"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <CardContent className="p-4">
                {activeTab === "problem" && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {currentProblem.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                          currentProblem.difficulty
                        )}`}
                      >
                        {currentProblem.difficulty}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                      {currentProblem.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentProblem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "examples" && (
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800 p-3 rounded-lg">
                    {currentProblem.examples}
                  </pre>
                )}
                {activeTab === "hints" && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-zinc-400">
                      <Zap className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5" />
                      <span>Think about edge cases like empty inputs</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-zinc-400">
                      <Zap className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5" />
                      <span>Consider time and space complexity</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Code Editor</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={resetCode}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div data-testid="code-editor" className="h-[400px]">
                <Editor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              data-testid="evaluate-btn"
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-12"
              size="lg"
            >
              {loading ? (
                <>
                  <Bot className="w-5 h-5 mr-2 animate-pulse" />
                  AI is Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run & Get AI Evaluation
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - AI Results */}
          <div className="space-y-4">
            {/* AI Chat Header */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-black" />
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${
                          aiStatusInfo.bg
                        } rounded-full border-2 border-zinc-900 ${
                          aiStatus !== "online" ? "animate-pulse" : ""
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        Code Evaluator AI
                        <Badge className="bg-[rgba(var(--accent-rgb),0.20)] text-[rgb(var(--accent-rgb))] text-xs">
                          Gemini
                        </Badge>
                      </h3>
                      <p className={`text-sm ${aiStatusInfo.color}`}>
                        {aiStatusInfo.text}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiChat(!showAiChat)}
                    className="border-[rgba(var(--accent-rgb),0.30)] text-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.10)]"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {showAiChat ? "Hide" : "Ask AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Panel */}
            {showAiChat && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="border-b border-zinc-800 pb-3">
                  <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ask AI for Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-48 overflow-y-auto mb-4 space-y-3">
                    {aiMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[rgba(var(--accent-rgb),0.50)]" />
                        <p className="text-sm text-zinc-500">
                          Ask me anything about this problem!
                        </p>
                      </div>
                    ) : (
                      aiMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-2 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-black" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${
                              msg.role === "user"
                                ? "bg-zinc-700 text-white"
                                : msg.isError
                                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {msg.content}
                          </div>
                          {msg.role === "user" && (
                            <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-zinc-300" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ask for hints or explanations..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                      onKeyPress={(e) => e.key === "Enter" && askAiHelp()}
                    />
                    <Button
                      onClick={askAiHelp}
                      disabled={!userQuestion.trim() || aiStatus === "thinking"}
                      className="bg-[rgb(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.90)]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Results */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crosshair className="w-5 h-5" />
                  AI Evaluation
                  {loading && (
                    <Badge className="bg-[rgba(var(--accent-rgb),0.20)] text-[rgb(var(--accent-rgb))] ml-2">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Analyzing
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Real-time code analysis powered by Gemini AI
                </CardDescription>
              </CardHeader>
              <CardContent data-testid="evaluation-results" className="p-4">
                {!evaluation && !loading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                      <Code className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-500 mb-2">
                      Submit your code to see AI evaluation
                    </p>
                    <p className="text-xs text-zinc-600">
                      Gemini AI will analyze your code for correctness,
                      efficiency, and style
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="py-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-black animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">
                        {aiStatusInfo.text}
                      </p>
                      <div className="flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-[rgb(var(--accent-rgb))] rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                    <Progress value={45} className="mt-4 h-1" />
                  </div>
                )}

                {evaluation && (
                  <div className="space-y-4">
                    {/* Status */}
                    <div
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        evaluation.passed
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-[rgba(var(--accent-rgb),0.10)] border border-[rgba(var(--accent-rgb),0.30)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {evaluation.passed ? (
                          <div className="relative">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                            <Sparkles className="w-4 h-4 text-[rgb(var(--accent-rgb))] absolute -top-1 -right-1" />
                          </div>
                        ) : (
                          <AlertCircle className="w-10 h-10 text-[rgb(var(--accent-rgb))]" />
                        )}
                        <div>
                          <p
                            className={`font-semibold text-lg ${
                              evaluation.passed
                                ? "text-green-400"
                                : "text-[rgb(var(--accent-rgb))]"
                            }`}
                          >
                            {evaluation.passed
                              ? "🎉 All Tests Passed!"
                              : "💡 Needs Improvement"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Completed in {formatTime(timer)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-white">
                          {evaluation.score}
                        </p>
                        <p className="text-xs text-zinc-400">/ 100 points</p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <Star className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">
                          Correctness
                        </p>
                        <span className="font-bold text-white">
                          {Math.min(evaluation.score, 100)}%
                        </span>
                      </div>
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <TrendingUp className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">Quality</p>
                        <span className="font-bold text-white">
                          {evaluation.passed ? "Good" : "Fair"}
                        </span>
                      </div>
                      <div className="p-3 bg-zinc-800 rounded-lg text-center">
                        <Zap className="w-5 h-5 text-[rgb(var(--accent-rgb))] mx-auto mb-1" />
                        <p className="text-xs text-zinc-400 mb-1">Efficiency</p>
                        <span className="font-bold text-white">
                          {evaluation.score >= 80 ? "Optimal" : "Moderate"}
                        </span>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {evaluation.suggestions && (
                      <div className="p-4 bg-[rgba(var(--accent-rgb),0.08)] rounded-xl border border-[rgba(var(--accent-rgb),0.20)]">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                          <Lightbulb className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                          AI Suggestions
                        </h4>
                        <p className="text-sm text-zinc-300">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {/* Detailed Analysis with Typing Effect */}
                    <div className="p-4 bg-zinc-800 rounded-xl">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                        <Bot className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                        AI Analysis
                        {isTyping && (
                          <span className="text-xs text-[rgb(var(--accent-rgb))] animate-pulse">
                            typing...
                          </span>
                        )}
                      </h4>
                      <div className="max-h-48 overflow-y-auto">
                        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {displayedEvaluation}
                          {isTyping && (
                            <span className="inline-block w-2 h-4 bg-[rgb(var(--accent-rgb))] animate-pulse ml-0.5" />
                          )}
                        </pre>
                      </div>
                    </div>

                    {/* Feedback Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-[rgb(var(--accent-rgb))]"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-[rgb(var(--accent-rgb))]"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Ask Follow-up
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetCode}
                        className="border-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="border-b border-zinc-800 pb-3">
                <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Submission History
                  <Badge className="bg-zinc-800 text-zinc-400 text-xs ml-auto">
                    {submissions.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-6">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No submissions yet</p>
                    <p className="text-xs text-zinc-600">
                      Your coding history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.slice(0, 5).map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {sub.passed ? (
                            <div className="w-8 h-8 bg-[rgba(var(--accent-rgb),0.20)] rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-[rgb(var(--accent-rgb))] transition-colors">
                              {sub.problemTitle}
                            </p>
                            <p className="text-xs text-zinc-500 flex items-center gap-2">
                              <FileCode className="w-3 h-3" />
                              {sub.language}
                              <span className="text-zinc-600">•</span>
                              <Timer className="w-3 h-3" />
                              {formatTime(sub.time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              sub.passed
                                ? "text-[rgb(var(--accent-rgb))]"
                                : "text-red-400"
                            }`}
                          >
                            {sub.score}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-[rgba(var(--accent-rgb),0.10)] border-[rgba(var(--accent-rgb),0.20)]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[rgb(var(--accent-rgb))]" />
                  AI Tips
                </h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>
                      Use the "Ask AI" button for hints without revealing the
                      solution
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>
                      AI analyzes time complexity and suggests optimizations
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--accent-rgb))] mt-0.5 flex-shrink-0" />
                    <span>Build your streak by solving problems daily!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingArena;
