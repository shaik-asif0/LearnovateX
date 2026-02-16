import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Bot,
  Code,
  FileText,
  MessageSquare,
  TrendingUp,
  Building2,
  GraduationCap,
  Users,
  Sparkles,
  Target,
  Trophy,
  BookOpen,
  Gamepad2,
  Award,
  Zap,
  Brain,
  BarChart3,
  Shield,
  Globe,
  Github,
  Rocket,
  ArrowRight,
  Play,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Moon,
  Sun,
  Languages,
  CheckCircle,
  Clock,
  DollarSign,
  Crown,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

import LandingNavbar from "../components/LandingNavbar";

// Typing Animation Component
const TypingAnimation = ({ texts, speed = 100, delay = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(text.substring(0, currentText.length + 1));
        if (currentText === text) {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        setCurrentText(text.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, texts, speed, delay]);

  return (
    <span className="border-r-2 border-[var(--accent-color)] animate-pulse">
      {currentText}
    </span>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

// Scroll Animation Hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

// Floating Action Button Component
const FloatingActionButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={scrollToTop}
            className="group relative p-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)]/90 hover:to-[var(--accent-color)]/90 text-white rounded-full shadow-lg shadow-[var(--accent-color)]/25 hover:shadow-xl hover:shadow-[var(--accent-color)]/40 transform hover:scale-110 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowRight className="w-6 h-6 transform rotate-[-90deg]" />
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-zinc-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Back to Top
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900"></div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-[var(--accent-color)]/20 animate-pulse"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// FAQ Accordion Component
const FAQAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card
          key={index}
          className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-[var(--accent-color)]/30 transition-all duration-300"
        >
          <CardContent className="p-6">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-white hover:text-[var(--accent-color)] transition-colors duration-300">
                {faq.question}
              </h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-[var(--accent-color)] flex-shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--accent-color)] flex-shrink-0 ml-4" />
              )}
            </button>
            {openIndex === index && (
              <div className="mt-4 pt-4 border-t border-zinc-700/50">
                <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Newsletter Signup Component
// Search Component
const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`flex items-center bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-full transition-all duration-300 ${
          isExpanded ? "w-80" : "w-12"
        } overflow-hidden`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 text-zinc-400 hover:text-[var(--accent-color)] transition-colors duration-300"
        >
          <Search className="w-5 h-5" />
        </button>
        {isExpanded && (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, courses..."
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder-zinc-400 focus:outline-none"
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

// Language Selector Component
const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all duration-300"
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm">EN</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors duration-200 flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              <span>{lang.flag}</span>
              <span className="text-zinc-300 hover:text-white">
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Dark Mode Toggle Component
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-lg bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 text-zinc-400 hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all duration-300"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Stats Dashboard Component
const StatsDashboard = () => {
  const stats = [
    {
      label: "Active Learners",
      value: 1250,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Problems Solved",
      value: 50000,
      icon: Code,
      color: "text-green-400",
    },
    {
      label: "Mock Interviews",
      value: 3200,
      icon: MessageSquare,
      color: "text-purple-400",
    },
    {
      label: "Success Rate",
      value: 94,
      icon: Trophy,
      color: "text-yellow-400",
      suffix: "%",
    },
    { label: "Companies", value: 150, icon: Building2, color: "text-red-400" },
    { label: "Courses", value: 85, icon: BookOpen, color: "text-indigo-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-zinc-600/70 transition-all duration-300"
        >
          <CardContent className="p-6 text-center">
            <div
              className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-700/50 flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} />
            </div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useI18n();
  const [heroRef, heroVisible] = useScrollAnimation();
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();

  // Smooth scroll function
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // FAQ Data
  const faqs = [
    {
      question: "How does LearnovateX's AI tutor work?",
      answer:
        "Our AI tutor uses advanced machine learning algorithms powered by Azure OpenAI to provide personalized explanations, adaptive difficulty, and real-time feedback. It analyzes your learning patterns and adjusts content to match your pace and style.",
    },
    {
      question: "What programming languages and technologies are supported?",
      answer:
        "We support Python, Java, JavaScript, C++, SQL, DSA, System Design, and many more. Our platform continuously adds new languages and frameworks based on industry demand and user feedback.",
    },
    {
      question: "How do mock interviews work?",
      answer:
        "Our AI-powered mock interviews simulate real technical interviews with behavioral and technical questions. You get detailed feedback, tips for improvement, and a performance score to track your progress.",
    },
    {
      question: "Is LearnovateX suitable for beginners?",
      answer:
        "Absolutely! Our platform is designed for all skill levels. Beginners get structured learning paths, while advanced users can challenge themselves with complex problems and real-world scenarios.",
    },
    {
      question: "What makes LearnovateX different from other coding platforms?",
      answer:
        "Unlike traditional platforms, LearnovateX combines AI-powered tutoring, real-time code evaluation, career guidance, and company recruitment tools in one comprehensive platform.",
    },
    {
      question: "How does the resume intelligence feature work?",
      answer:
        "Our AI analyzes your resume for ATS compatibility, keyword optimization, and content quality. It provides actionable suggestions to improve your chances of getting noticed by recruiters.",
    },
  ];

  const features = [
    {
      icon: <Bot className="w-12 h-12 text-white" />,
      title: t("landing.feature.aiTutor.title", "AI Personal Tutor"),
      // ... (rest of features array remains same)
      description: t(
        "landing.feature.aiTutor.description",
        "Get personalized explanations for Python, Java, DSA, SQL, and more with adaptive learning powered by Azure OpenAI."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.aiTutor.detail.1", "24/7 AI assistance"),
        t("landing.feature.aiTutor.detail.2", "Adaptive difficulty"),
        t("landing.feature.aiTutor.detail.3", "Real-time feedback"),
      ],
    },
    {
      icon: <Code className="w-12 h-12 text-white" />,
      title: t("landing.feature.codeEval.title", "Code Evaluation"),
      description: t(
        "landing.feature.codeEval.description",
        "Real-time code analysis with complexity checks, optimization suggestions, and plagiarism detection."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.codeEval.detail.1", "Syntax validation"),
        t("landing.feature.codeEval.detail.2", "Performance metrics"),
        t("landing.feature.codeEval.detail.3", "Best practices"),
      ],
    },
    {
      icon: <Gamepad2 className="w-12 h-12 text-white" />,
      title: t("landing.feature.codingArena.title", "Coding Arena"),
      description: t(
        "landing.feature.codingArena.description",
        "Challenge yourself with interactive coding problems, compete with peers, and improve your problem-solving skills."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.codingArena.detail.1", "Daily challenges"),
        t("landing.feature.codingArena.detail.2", "Competitive coding"),
        t("landing.feature.codingArena.detail.3", "Skill assessment"),
      ],
    },
    {
      icon: <FileText className="w-12 h-12 text-white" />,
      title: t("landing.feature.resume.title", "Resume Intelligence"),
      description: t(
        "landing.feature.resume.description",
        "AI-powered resume analysis with credibility scoring, skill verification, and ATS optimization."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.resume.detail.1", "ATS compatibility"),
        t("landing.feature.resume.detail.2", "Keyword optimization"),
        t("landing.feature.resume.detail.3", "Impact scoring"),
      ],
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-white" />,
      title: t("landing.feature.mock.title", "Mock Interviews"),
      description: t(
        "landing.feature.mock.description",
        "Practice with AI-powered interview simulations, get detailed feedback, and improve your communication skills."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.mock.detail.1", "Technical interviews"),
        t("landing.feature.mock.detail.2", "Behavioral questions"),
        t("landing.feature.mock.detail.3", "Feedback analysis"),
      ],
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-white" />,
      title: t("landing.feature.careerDashboard.title", "Career Dashboard"),
      description: t(
        "landing.feature.careerDashboard.description",
        "Track your progress, skill mastery, interview readiness, and career milestones in one comprehensive dashboard."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.careerDashboard.detail.1", "Progress tracking"),
        t("landing.feature.careerDashboard.detail.2", "Skill analytics"),
        t("landing.feature.careerDashboard.detail.3", "Career insights"),
      ],
    },
    {
      icon: <Trophy className="w-12 h-12 text-white" />,
      title: t(
        "landing.feature.leaderboard.title",
        "Leaderboard & Achievements"
      ),
      description: t(
        "landing.feature.leaderboard.description",
        "Compete with fellow learners, earn badges, and showcase your achievements in our gamified learning environment."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.leaderboard.detail.1", "Global rankings"),
        t("landing.feature.leaderboard.detail.2", "Achievement badges"),
        t("landing.feature.leaderboard.detail.3", "Progress rewards"),
      ],
    },
    {
      icon: <BookOpen className="w-12 h-12 text-white" />,
      title: t("landing.feature.roadmaps.title", "Learning Roadmaps"),
      description: t(
        "landing.feature.roadmaps.description",
        "Follow structured career paths for Backend, Mobile, DevOps, Data Science, UI/UX, Cybersecurity, and QA engineering."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.roadmaps.detail.1", "Career paths"),
        t("landing.feature.roadmaps.detail.2", "Skill progression"),
        t("landing.feature.roadmaps.detail.3", "Industry standards"),
      ],
    },
    {
      icon: <Building2 className="w-12 h-12 text-white" />,
      title: t("landing.feature.company.title", "Company Portal"),
      description: t(
        "landing.feature.company.description",
        "Create assessments, evaluate candidates, and streamline hiring with AI-powered recruitment tools."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.company.detail.1", "Candidate screening"),
        t("landing.feature.company.detail.2", "Assessment creation"),
        t("landing.feature.company.detail.3", "Hiring analytics"),
      ],
    },
    {
      icon: <Brain className="w-12 h-12 text-white" />,
      title: t("landing.feature.tutorSessions.title", "AI Tutor Sessions"),
      description: t(
        "landing.feature.tutorSessions.description",
        "One-on-one AI tutoring sessions tailored to your learning pace and style with interactive problem-solving."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.tutorSessions.detail.1", "Personalized learning"),
        t("landing.feature.tutorSessions.detail.2", "Interactive sessions"),
        t("landing.feature.tutorSessions.detail.3", "Concept mastery"),
      ],
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-white" />,
      title: t("landing.feature.resources.title", "Resources Hub"),
      description: t(
        "landing.feature.resources.description",
        "Access comprehensive learning resources, documentation, and tools to accelerate your development journey."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.resources.detail.1", "Documentation"),
        t("landing.feature.resources.detail.2", "Code examples"),
        t("landing.feature.resources.detail.3", "Learning materials"),
      ],
    },
    {
      icon: <Shield className="w-12 h-12 text-white" />,
      title: t("landing.feature.careerReadiness.title", "Career Readiness"),
      description: t(
        "landing.feature.careerReadiness.description",
        "Comprehensive career preparation with interview tips, salary negotiation, and job search strategies."
      ),
      gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
      details: [
        t("landing.feature.careerReadiness.detail.1", "Interview prep"),
        t("landing.feature.careerReadiness.detail.2", "Salary negotiation"),
        t("landing.feature.careerReadiness.detail.3", "Job search tips"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNavbar />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden min-h-[100dvh] md:min-h-screen flex items-center transition-opacity duration-1000 ${
          heroVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Enhanced liquid background effects with animation */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-color)]/5 to-transparent animate-pulse opacity-50"></div>
          {/* Floating particles with enhanced animation */}
          <div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce opacity-60"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-[var(--accent-color)] rounded-full animate-bounce opacity-40"
            style={{ animationDelay: "3s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-bounce opacity-50"
            style={{ animationDelay: "5s", animationDuration: "2.5s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-[var(--accent-color)] rounded-full animate-ping opacity-30"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-[var(--accent-color)] rounded-full animate-pulse opacity-70"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Additional floating particles */}
        <FloatingParticles />

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <BookOpen
            className="absolute top-20 left-20 w-8 h-8 text-[var(--accent-color)] opacity-20 animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          />
          <Code
            className="absolute top-32 right-32 w-6 h-6 text-[var(--accent-color)] opacity-25 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <GraduationCap
            className="absolute bottom-32 left-24 w-7 h-7 text-[var(--accent-color)] opacity-20 animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          />
          <Target
            className="absolute bottom-20 right-20 w-5 h-5 text-[var(--accent-color)] opacity-30 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <TrendingUp
            className="absolute top-1/2 left-10 w-6 h-6 text-[var(--accent-color)] opacity-25 animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "3.5s" }}
          />
          <Users
            className="absolute top-1/3 right-10 w-7 h-7 text-[var(--accent-color)] opacity-20 animate-pulse"
            style={{ animationDelay: "2.5s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
            <div className="col-span-full md:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-sm font-medium animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {t("landing.hero.small", "AI-Powered Learning Platform")}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                  <span className="block bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    {t("landing.hero.title.line1", "Master Skills.")}
                  </span>
                  <span className="block bg-gradient-to-r from-[var(--accent-color)] to-red-500 bg-clip-text text-transparent">
                    {t("landing.hero.title.line2", "Ace Interviews.")}
                  </span>
                  <span className="block text-white">
                    <TypingAnimation
                      texts={[
                        "Build Your Career.",
                        "Level Up Fast.",
                        "Learn Smarter.",
                        "Code Confidently.",
                      ]}
                      speed={80}
                      delay={2500}
                    />
                  </span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl animate-fade-in">
                {t(
                  "landing.hero.subtitle",
                  "The only AI-powered platform you need to learn, practice, and land your dream job. Replace coaching institutes with intelligent tutoring, automated assessments, and career readiness tracking powered by Azure OpenAI."
                )}
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <Tooltip
                  content="Start your learning journey for free"
                  position="bottom"
                >
                  <Button
                    data-testid="get-started-btn"
                    size="lg"
                    className="w-full sm:w-auto rounded-full font-semibold bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)]/90 hover:to-[var(--accent-color)]/90 text-white shadow-lg shadow-[var(--accent-color)]/25 md:hover:shadow-xl md:hover:shadow-[var(--accent-color)]/40 md:transform md:hover:scale-105 transition-all duration-300 md:hover:shadow-[0_0_30px_var(--accent-color)]/50 relative overflow-hidden group"
                    onClick={() => navigate("/auth")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Zap className="w-5 h-5 mr-2 animate-pulse group-hover:animate-spin" />
                    {t("landing.cta.start", "Start Learning Free")}
                  </Button>
                </Tooltip>
                <Tooltip
                  content="Already have an account? Sign in here"
                  position="bottom"
                >
                  <Button
                    data-testid="learn-more-btn"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-semibold border-zinc-700 text-white hover:bg-zinc-800 md:hover:border-[var(--accent-color)]/50 md:transform md:hover:scale-105 transition-all duration-300 md:hover:shadow-[0_0_20px_var(--accent-color)]/30 relative overflow-hidden group"
                    onClick={() => navigate("/auth")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-color)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <BookOpen className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    {t("landing.cta.explore", "Login")}
                  </Button>
                </Tooltip>
              </div>

              {/* Stats */}
              {/* <div className="flex flex-wrap gap-6 sm:gap-8 pt-8 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-sm text-zinc-400">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter end={200} suffix="+" />
                  </div>
                  <div className="text-sm text-zinc-400">Coding Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter end={5} suffix="+" />
                  </div>
                  <div className="text-sm text-zinc-400">Companies</div>
                </div>
              </div> */}
            </div>
            <div className="col-span-full md:col-span-5 relative max-w-md mx-auto md:max-w-none">
              <div className="relative">
                {/* Liquid border effect */}
                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-2xl blur-xl animate-pulse"></div>
                <img
                  src="https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg"
                  alt="Student learning with AI"
                  className="relative w-full h-auto rounded-xl shadow-2xl border border-zinc-800/50 md:hover:border-[var(--accent-color)]/30 transition-all duration-500 md:hover:scale-105"
                />
                {/* Floating elements */}
                <div className="hidden sm:flex absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full items-center justify-center shadow-lg animate-bounce">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div
                  className="hidden sm:flex absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard Section */}
      <section
        id="stats"
        className=" bg-gradient-to-b from-black via-zinc-900 to-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-300 to-white bg-clip-text text-transparent">
              {t("landing.stats.title", "Platform Statistics")}
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t(
                "landing.stats.subtitle",
                "Join thousands of learners and companies already using LearnovateX"
              )}
            </p>
          </div>
          <StatsDashboard />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-zinc-900 to-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("landing.howItWorks.title", "How LearnovateX Works")}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t(
                "landing.howItWorks.subtitle",
                "Your journey to career success in 3 simple steps"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t("landing.step1.title", "Learn with AI Tutor")}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t(
                  "landing.step1.description",
                  "Get personalized explanations and interactive learning powered by Azure OpenAI. Master concepts at your own pace."
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t("landing.step2.title", "Practice in Coding Arena")}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t(
                  "landing.step2.description",
                  "Challenge yourself with interactive coding problems, get real-time feedback, and improve your problem-solving skills."
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t("landing.step3.title", "Get Interview-Ready & Hired")}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t(
                  "landing.step3.description",
                  "Practice mock interviews, optimize your resume, and track your career readiness to land your dream job."
                )}
              </p>
            </div>
          </div>

          {/* Connecting arrows for desktop */}
          <div className="hidden md:block">
            <div className="flex justify-center items-center mt-8 space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]"></div>
              <ArrowRight className="w-6 h-6 text-[var(--accent-color)]" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        ref={featuresRef}
        className={`py-20 bg-zinc-900 relative overflow-hidden transition-all duration-1000 ${
          featuresVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {/* Liquid background effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("landing.features.title", "Everything You Need to Succeed")}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t(
                "landing.features.subtitle",
                "One platform, unlimited possibilities - powered by AI"
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                data-testid={`feature-card-${index}`}
                className="group bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 md:hover:border-zinc-500/70 transition-all duration-500 md:hover:-translate-y-2 md:hover:scale-105 md:hover:shadow-2xl md:hover:shadow-[var(--accent-color)]/10 liquid-card"
                style={{
                  animationDelay: `${index * 100}ms`,
                  background: `linear-gradient(135deg, rgba(39, 39, 42, 0.8), rgba(24, 24, 27, 0.6))`,
                }}
              >
                <CardContent className="p-5 sm:p-6 space-y-4 relative overflow-hidden">
                  {/* Liquid blob animation */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-current to-transparent rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 liquid-blob"></div>

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg md:group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-[var(--accent-color)] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Additional details */}
                  <div className="space-y-2 pt-2 border-t border-zinc-700/50">
                    {feature.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]"></div>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Sectio n */}
      <section class N ame="py-16 bg-black relative overflow-hid den">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("landing.demo.title", "See LearnovateX in Action")}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t(
                "landing.demo.subtitle",
                "Watch how our AI-powered platform transforms learning and career preparation"
              )}
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 md:hover:border-[var(--accent-color)]/30 transition-all duration-500 md:hover:shadow-2xl md:hover:shadow-[var(--accent-color)]/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {/* Local MP4 Video with Native Controls */}
                  <video
                    id="learnovatex-demo-video"
                    className="w-full h-full rounded-lg"
                    controls={true}
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source
                      src={`${process.env.PUBLIC_URL}/LearnovateX.mp4`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>

                  {/* Floating elements */}
                  <div className="hidden sm:flex absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full items-center justify-center shadow-lg animate-bounce opacity-70">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div
                    className="hidden sm:flex absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-full items-center justify-center shadow-lg animate-bounce opacity-70"
                    style={{ animationDelay: "1s" }}
                  >
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                {t(
                  "landing.demo.note",
                  "Use the video controls to watch our AI-powered learning platform in action"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For All Users Sectio n */}
      <section class N ame="py-24 bg-black relative overflow-hid den">
        {/* Liquid background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[var(--accent-color)]/30 to-[var(--accent-color)]/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-[var(--accent-color)]/30 to-[var(--accent-color)]/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("landing.forAll.title", "Built for Everyone")}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t(
                "landing.forAll.subtitle",
                "From students to enterprises - comprehensive career development"
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <GraduationCap className="w-6 h-6" />,
                label: "Students",
                desc: "Learn & Practice with AI",
                details: [
                  "Interactive coding",
                  "Personalized learning",
                  "Progress tracking",
                ],
                gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
              },
              {
                icon: <Target className="w-6 h-6" />,
                label: "Job Seekers",
                desc: "Interview Prep & Career Growth",
                details: [
                  "Mock interviews",
                  "Resume optimization",
                  "Skill assessment",
                ],
                gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                label: "Companies",
                desc: "Hire Faster with AI",
                details: [
                  "Candidate screening",
                  "Assessment tools",
                  "Analytics dashboard",
                ],
                gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
              },
              {
                icon: <Users className="w-6 h-6" />,
                label: "Colleges & Educators",
                desc: "Track Progress & Teach Better",
                details: [
                  "Student analytics",
                  "Curriculum integration",
                  "Performance insights",
                ],
                gradient: "from-[var(--accent-color)] to-[var(--accent-color)]",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group text-center p-5 sm:p-6 bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 md:hover:border-zinc-600/70 transition-all duration-500 md:hover:-translate-y-2 md:hover:scale-105 md:hover:shadow-2xl md:hover:shadow-[var(--accent-color)]/10 liquid-card relative overflow-hidden"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Liquid blob animation */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-current to-transparent rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 liquid-blob"></div>

                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white shadow-lg md:group-hover:scale-110 transition-transform duration-300 relative z-10`}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-[var(--accent-color)] transition-colors duration-300">
                  {item.label}
                </h3>
                <p className="text-sm text-zinc-400 mb-3 group-hover:text-zinc-300 transition-colors duration-300">
                  {item.desc}
                </p>

                {/* Additional details */}
                <div className="space-y-1">
                  {item.details.map((detail, j) => (
                    <div
                      key={j}
                      className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"
                    >
                      • {detail}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className={`py-20 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 relative overflow-hidden transition-all duration-1000 ${
          testimonialsVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-sm font-medium mb-4">
              <Star className="w-4 h-4 animate-pulse" />
              {t("landing.testimonials.title", "Success Stories")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-white bg-clip-text text-transparent">
              {t("landing.testimonials.subtitle", "What Our Users Say")}
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              {t(
                "landing.testimonials.description",
                "Join thousands of learners who have transformed their careers with LearnovateX"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                avatar:
                  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                content:
                  "LearnovateX's AI tutor helped me master complex algorithms in weeks. The personalized learning path and instant feedback were game-changers for my interview prep.",
                rating: 5,
                achievement: "Landed FAANG role",
              },
              {
                name: "Marcus Rodriguez",
                role: "Full Stack Developer",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                content:
                  "The coding arena challenges are addictive! I've improved my problem-solving skills dramatically. The leaderboard keeps me motivated to keep learning.",
                rating: 5,
                achievement: "200+ problems solved",
              },
              {
                name: "Priya Patel",
                role: "Data Scientist",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                content:
                  "The resume intelligence feature completely transformed my job applications. I went from rejections to multiple offers in just 2 months.",
                rating: 5,
                achievement: "3 job offers",
              },
              {
                name: "David Kim",
                role: "DevOps Engineer",
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                content:
                  "The learning roadmaps are incredibly detailed. Following the DevOps path helped me transition careers smoothly with clear milestones and resources.",
                rating: 5,
                achievement: "Career transition",
              },
              {
                name: "Emma Thompson",
                role: "Product Manager",
                avatar:
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                content:
                  "Mock interviews with AI were incredibly realistic. The feedback helped me improve my communication skills and boosted my confidence tremendously.",
                rating: 5,
                achievement: "Interview mastery",
              },
              {
                name: "Alex Johnson",
                role: "Startup Founder",
                avatar:
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                content:
                  "Using LearnovateX for our hiring process cut our time-to-hire by 60%. The assessment tools are comprehensive and the analytics are invaluable.",
                rating: 5,
                achievement: "60% faster hiring",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="group bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 hover:border-[var(--accent-color)]/30 transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-[var(--accent-color)]/10 p-6 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full animate-pulse opacity-50"></div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[var(--accent-color)] text-[var(--accent-color)]"
                    />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-zinc-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-[var(--accent-color)]/30 group-hover:border-[var(--accent-color)]/50 transition-colors duration-300"
                  />
                  <div>
                    <div className="font-semibold text-white group-hover:text-[var(--accent-color)] transition-colors duration-300">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-[var(--accent-color)] font-medium mt-1">
                      {testimonial.achievement}
                    </div>
                  </div>
                </div>

                {/* Quote mark */}
                <div className="absolute top-4 left-4 text-4xl text-[var(--accent-color)]/20 font-serif leading-none">
                  "
                </div>
              </Card>
            ))}
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <p className="text-zinc-400 mb-6">
              {t(
                "landing.testimonials.cta",
                "Ready to join these success stories?"
              )}
            </p>
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)] hover:to-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/25 hover:shadow-xl hover:shadow-[var(--accent-color)]/40 transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              {t("landing.testimonials.join", "Start Your Journey")}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-20 bg-gradient-to-b from-zinc-900 via-black to-zinc-900 relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4 animate-pulse" />
              {t("landing.faq.title", "Frequently Asked Questions")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-white bg-clip-text text-transparent">
              {t("landing.faq.subtitle", "Got Questions? We've Got Answers")}
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t(
                "landing.faq.description",
                "Find answers to common questions about LearnovateX and how it can help your learning journey."
              )}
            </p>
          </div>

          <FAQAccordion faqs={faqs} />

          <div className="text-center mt-12">
            <p className="text-zinc-400 mb-4">
              {t("landing.faq.more", "Still have questions?")}
            </p>
            <Button
              variant="outline"
              className="rounded-full border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => navigate("/contact")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t("landing.faq.contact", "Contact Support")}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-white via-zinc-50 to-white text-black relative overflow-hidden">
        {/* Liquid background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              {t("landing.joinBanner", "Join the AI Learning Revolution")}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-[var(--accent-color)] to-gray-900 bg-clip-text text-transparent">
            {t("landing.cta.title", "Ready to Transform Your Career?")}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            {t(
              "landing.hero.subtitle",
              "Join thousands of learners and professionals using AI to accelerate their growth. From coding challenges to interview prep, we've got everything you need to succeed in tech."
            )}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <Bot className="w-6 h-6 text-[var(--accent-color)]" />
              <span className="font-semibold text-gray-800">
                {t("landing.feature.aiPowered", "AI-Powered")}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <Trophy className="w-6 h-6 text-[var(--accent-color)]" />
              <span className="font-semibold text-gray-800">
                {t("landing.feature.gamified", "Gamified Learning")}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-zinc-200/50 shadow-lg">
              <TrendingUp className="w-6 h-6 text-[var(--accent-color)]" />
              <span className="font-semibold text-gray-800">
                {t("landing.feature.career", "Career Focused")}
              </span>
            </div>
          </div>

          <Button
            data-testid="cta-start-btn"
            size="lg"
            className="w-full sm:w-auto rounded-full font-semibold bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg shadow-black/25 md:hover:shadow-xl md:hover:shadow-black/40 md:transform md:hover:scale-105 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-4"
            onClick={() => navigate("/auth")}
          >
            <Rocket className="w-6 h-6 mr-3" />
            {t("landing.cta", "Start Learning Now - It's Free")}
          </Button>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)] hover:to-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/25 hover:shadow-xl hover:shadow-[var(--accent-color)]/40 transform hover:scale-110 transition-all duration-300 group"
          onClick={() => navigate("/auth")}
        >
          <Rocket className="w-6 h-6 group-hover:animate-bounce" />
        </Button>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-zinc-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Get Started
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-zinc-400">
          <p>
            {t(
              "landing.footer",
              "© 2026 AI Learning Platform. All rights reserved."
            )}
          </p>
        </div>
      </footer>
      <FloatingActionButton />
    </div>
  );
};

// Tooltip Component
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-zinc-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-zinc-900",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-900",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} px-3 py-1 bg-zinc-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap`}
        >
          {content}
          <div className={`absolute ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

// Add liquid animation styles
const styles = `
  .liquid-card {
    position: relative;
    overflow: hidden;
  }

  .liquid-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s;
  }

  .liquid-card:hover::before {
    left: 100%;
  }

  .liquid-blob {
    animation: liquid-float 6s ease-in-out infinite;
  }

  .liquid-blob:nth-child(2) {
    animation-delay: -2s;
  }

  .liquid-blob:nth-child(3) {
    animation-delay: -4s;
  }

  @keyframes liquid-float {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
      border-radius: 50%;
    }
    25% {
      transform: translate(10px, -10px) rotate(90deg);
      border-radius: 40% 60% 70% 30%;
    }
    50% {
      transform: translate(-5px, 10px) rotate(180deg);
      border-radius: 60% 40% 30% 70%;
    }
    75% {
      transform: translate(-10px, -5px) rotate(270deg);
      border-radius: 30% 70% 60% 40%;
    }
  }

  .liquid-card:hover .liquid-blob {
        animation - duration: 3s;
  }
      `;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
