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
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

const MockInterview = () => {
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
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadInterviewHistory();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const loadInterviewHistory = () => {
    const saved = localStorage.getItem("interviewHistory");
    if (saved) {
      setInterviewHistory(JSON.parse(saved));
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
    localStorage.setItem("interviewHistory", JSON.stringify(newHistory));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/interview/start?interview_type=${interviewType}`
      );
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(""));
      setStarted(true);
      setTimer(0);
      setIsTimerRunning(true);
      toast.success("Interview started! Good luck! 🎯");
    } catch (error) {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

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

      const response = await axiosInstance.post("/interview/evaluate", {
        interview_type: interviewType,
        questions,
        answers: formattedAnswers,
      });

      setTypingIndicator(false);
      setEvaluation(response.data);
      saveToHistory(response.data);
      toast.success("Interview evaluated! Great job! 🎉");
    } catch (error) {
      toast.error("Failed to evaluate interview");
      setTypingIndicator(false);
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setStarted(false);
    setEvaluation(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setTimer(0);
    setIsTimerRunning(false);
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
            <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg">
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
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-mono text-white">
                  {formatTime(timer)}
                </span>
              </div>
              <Badge
                className={`capitalize ${
                  interviewType === "technical"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : interviewType === "behavioral"
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : "bg-green-500/20 text-green-400 border-green-500/30"
                }`}
              >
                {interviewType}
              </Badge>
            </div>
          )}
        </div>

        {/* Start Interview Screen */}
        {!started && !evaluation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Config Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-400" />
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
                                ? `border-${type.color}-500 bg-${type.color}-500/10`
                                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`p-2 rounded-lg ${
                                  interviewType === type.id
                                    ? `bg-${type.color}-500/20`
                                    : "bg-zinc-700"
                                }`}
                              >
                                <Icon
                                  className={`w-5 h-5 ${
                                    interviewType === type.id
                                      ? `text-${type.color}-400`
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
                              ? `border-${level.color}-500 bg-${level.color}-500/10 text-white`
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
                <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
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
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
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
                    <History className="w-5 h-5 text-purple-400" />
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
                      <span className="text-green-400 font-bold">
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
          <div className="space-y-6">
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
                <div className="flex gap-2 mt-3">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        index === currentQuestion
                          ? "bg-purple-500"
                          : answers[index]?.trim()
                          ? "bg-green-500"
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
                    <CircleDot className="w-5 h-5 text-purple-400" />
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {answers[currentQuestion]?.trim() && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
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
                    <label className="text-sm font-medium text-zinc-300">
                      Your Answer
                    </label>
                    <span className="text-xs text-zinc-500">
                      {answers[currentQuestion]?.length || 0} characters
                    </span>
                  </div>
                  <Textarea
                    data-testid="answer-textarea"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here... Take your time and be thorough."
                    rows={10}
                    className="resize-none bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-base leading-relaxed"
                  />
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
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
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
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
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
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-zinc-400">
                    <span className="text-yellow-400 font-medium">Tip: </span>
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
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
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
                          className={`text-5xl font-bold ${getScoreColor(
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
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-700/50">
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
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg"
                      >
                        <Star className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
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
