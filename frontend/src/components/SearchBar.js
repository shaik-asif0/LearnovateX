import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Bot,
  Code,
  FileSearch,
  MessageSquare,
  TrendingUp,
  User,
  Settings,
  Trophy,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Sparkles,
  Map,
  Briefcase,
  Monitor,
  ArrowRight,
  Clock,
  X,
} from "lucide-react";
import { getUser } from "../lib/utils";

// Comprehensive search index — all navigable pages with keywords & tags
const ALL_SEARCH_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: [
      "home",
      "overview",
      "stats",
      "analytics",
      "progress",
      "dashboard",
      "main",
    ],
    category: "Pages",
    description: "View your learning progress and stats",
    roles: ["student", "job_seeker"],
  },
  {
    label: "AI Tutor",
    path: "/tutor",
    icon: Bot,
    keywords: [
      "ai",
      "tutor",
      "chat",
      "ask",
      "learn",
      "help",
      "assistant",
      "chatbot",
      "question",
      "doubt",
    ],
    category: "Pages",
    description: "Chat with your AI-powered tutor",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Coding Arena",
    path: "/coding",
    icon: Code,
    keywords: [
      "coding",
      "arena",
      "code",
      "practice",
      "programming",
      "challenge",
      "problems",
      "dsa",
      "algorithm",
      "leetcode",
    ],
    category: "Pages",
    description: "Practice coding challenges and problems",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Resources",
    path: "/resources",
    icon: BookOpen,
    keywords: [
      "resources",
      "study",
      "material",
      "notes",
      "books",
      "tutorials",
      "articles",
      "reference",
      "documentation",
    ],
    category: "Pages",
    description: "Browse study materials and resources",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Career Readiness",
    path: "/career-readiness",
    icon: TrendingUp,
    keywords: [
      "career",
      "readiness",
      "job",
      "placement",
      "skill",
      "assessment",
      "ready",
      "employability",
    ],
    category: "Pages",
    description: "Check your career readiness score",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Premium",
    path: "/premium",
    icon: Sparkles,
    keywords: [
      "premium",
      "upgrade",
      "pro",
      "subscription",
      "plan",
      "paid",
      "features",
      "unlock",
    ],
    category: "Pages",
    description: "Explore premium features and plans",
    roles: ["student", "job_seeker", "company", "college_admin"],
  },
  {
    label: "Premium Courses",
    path: "/premium/courses",
    icon: BookOpen,
    keywords: [
      "premium",
      "courses",
      "enroll",
      "learn",
      "class",
      "training",
      "certification",
      "skill",
    ],
    category: "Premium",
    description: "Browse and enroll in premium courses",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Premium Internships",
    path: "/premium/internships",
    icon: Briefcase,
    keywords: [
      "premium",
      "internship",
      "apply",
      "job",
      "work",
      "experience",
      "opportunity",
      "company",
    ],
    category: "Premium",
    description: "Find and apply for premium internships",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Resume Analyzer",
    path: "/resume",
    icon: FileSearch,
    keywords: [
      "resume",
      "analyzer",
      "cv",
      "review",
      "feedback",
      "ats",
      "scan",
      "upload",
      "improve",
    ],
    category: "Pages",
    description: "Get AI-powered resume feedback",
    roles: ["job_seeker"],
  },
  {
    label: "Mock Interview",
    path: "/interview",
    icon: MessageSquare,
    keywords: [
      "mock",
      "interview",
      "practice",
      "prepare",
      "question",
      "answer",
      "hr",
      "technical",
      "behavioral",
    ],
    category: "Pages",
    description: "Practice with AI mock interviews",
    roles: ["job_seeker"],
  },
  {
    label: "My Profile",
    path: "/profile",
    icon: User,
    keywords: [
      "profile",
      "account",
      "bio",
      "info",
      "personal",
      "edit",
      "photo",
      "name",
      "email",
    ],
    category: "Account",
    description: "View and edit your profile",
    roles: ["student", "job_seeker", "company", "college_admin"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    keywords: [
      "settings",
      "preferences",
      "theme",
      "notification",
      "language",
      "privacy",
      "configure",
      "dark mode",
    ],
    category: "Account",
    description: "Manage your app settings",
    roles: ["student", "job_seeker", "company", "college_admin"],
  },
  {
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
    keywords: [
      "leaderboard",
      "rank",
      "ranking",
      "score",
      "top",
      "compete",
      "position",
      "points",
    ],
    category: "Pages",
    description: "See where you rank among peers",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Learning Path",
    path: "/learning-path",
    icon: Map,
    keywords: [
      "learning",
      "path",
      "roadmap",
      "plan",
      "journey",
      "track",
      "progress",
      "curriculum",
      "syllabus",
    ],
    category: "Pages",
    description: "Follow your personalized learning path",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Roadmap",
    path: "/roadmap",
    icon: Map,
    keywords: [
      "roadmap",
      "guide",
      "career",
      "path",
      "route",
      "plan",
      "technology",
      "frontend",
      "backend",
      "fullstack",
    ],
    category: "Pages",
    description: "Explore technology roadmaps",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: Award,
    keywords: [
      "achievements",
      "badges",
      "rewards",
      "milestone",
      "certificate",
      "earned",
      "completed",
      "trophy",
    ],
    category: "Pages",
    description: "View your earned achievements & badges",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Company Portal",
    path: "/company",
    icon: Building2,
    keywords: [
      "company",
      "portal",
      "employer",
      "hiring",
      "recruit",
      "post",
      "job",
      "candidates",
    ],
    category: "Pages",
    description: "Manage company hiring and jobs",
    roles: ["company"],
  },
  {
    label: "College Admin",
    path: "/college",
    icon: GraduationCap,
    keywords: [
      "college",
      "admin",
      "university",
      "institution",
      "students",
      "manage",
      "department",
    ],
    category: "Pages",
    description: "Manage college administration",
    roles: ["college_admin"],
  },
  {
    label: "3D Coding Game",
    path: "/coding-game-3d",
    icon: Monitor,
    keywords: [
      "game",
      "3d",
      "interactive",
      "coding",
      "play",
      "fun",
      "gamify",
      "visual",
    ],
    category: "Pages",
    description: "Interactive 3D coding game experience",
    roles: ["student", "job_seeker"],
  },
  {
    label: "Course Learn",
    path: "/course-learn",
    icon: BookOpen,
    keywords: [
      "course",
      "learn",
      "study",
      "video",
      "lesson",
      "lecture",
      "module",
      "content",
    ],
    category: "Pages",
    description: "Continue learning your enrolled courses",
    roles: ["student", "job_seeker"],
  },
];

const RECENT_KEY_PREFIX = "recentSearches:";

const SearchBar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const userId = user?.id || user?._id || user?.email || "anonymous";
  const recentKey = RECENT_KEY_PREFIX + userId;

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentKey);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [recentKey]);

  // Filter search items by role
  const roleFiltered = useMemo(() => {
    return ALL_SEARCH_ITEMS.filter(
      (item) => !item.roles || item.roles.includes(user?.role)
    );
  }, [user?.role]);

  // Real-time fuzzy matching
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    const scored = roleFiltered
      .map((item) => {
        const labelLower = item.label.toLowerCase();
        const descLower = (item.description || "").toLowerCase();
        const allKeywords = item.keywords.join(" ");

        let score = 0;

        // Exact label match
        if (labelLower === q) score += 100;
        // Label starts with query
        else if (labelLower.startsWith(q)) score += 80;
        // Label contains query
        else if (labelLower.includes(q)) score += 60;

        // Keyword matching
        for (const word of words) {
          if (word.length < 1) continue;
          // Exact keyword match (high value)
          if (item.keywords.some((k) => k === word)) score += 50;
          // Keyword starts with word
          else if (item.keywords.some((k) => k.startsWith(word))) score += 35;
          // Keyword contains word
          else if (allKeywords.includes(word)) score += 20;
          // Description match
          else if (descLower.includes(word)) score += 10;
        }

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return scored;
  }, [query, roleFiltered]);

  // Show recent or suggestions
  const displayItems = useMemo(() => {
    if (query.trim()) return suggestions;
    // Show recent searches when input is focused but empty
    if (isOpen && recentSearches.length > 0) {
      return recentSearches
        .map((path) => roleFiltered.find((item) => item.path === path))
        .filter(Boolean)
        .slice(0, 5);
    }
    return [];
  }, [query, suggestions, isOpen, recentSearches, roleFiltered]);

  const showDropdown = isOpen && displayItems.length > 0;

  // Save to recent searches
  const saveRecent = useCallback(
    (path) => {
      try {
        const updated = [
          path,
          ...recentSearches.filter((p) => p !== path),
        ].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(recentKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
    },
    [recentSearches, recentKey]
  );

  // Handle navigation
  const handleSelect = useCallback(
    (item) => {
      saveRecent(item.path);
      setQuery("");
      setIsOpen(false);
      setHighlightIdx(-1);
      navigate(item.path);
    },
    [navigate, saveRecent]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!showDropdown) {
        if (e.key === "Escape") {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIdx((prev) =>
            prev < displayItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIdx((prev) =>
            prev > 0 ? prev - 1 : displayItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < displayItems.length) {
            handleSelect(displayItems[highlightIdx]);
          } else if (displayItems.length > 0) {
            handleSelect(displayItems[0]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightIdx(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [showDropdown, displayItems, highlightIdx, handleSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightIdx(-1);
  }, [query]);

  const clearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(recentKey);
    } catch {
      // ignore
    }
  };

  // Highlight matched text
  const highlightMatch = (text, q) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-white font-semibold">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages, features..."
          className="w-full pl-10 pr-16 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all duration-200"
          autoComplete="off"
          spellCheck="false"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-10 p-0.5 rounded hover:bg-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        ) : null}
        <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Recent header */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Recent
              </span>
              <button
                onClick={clearRecent}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Results */}
          <div className="py-1.5 max-h-80 overflow-y-auto">
            {displayItems.map((item, idx) => {
              const Icon = item.icon;
              const isHighlighted = idx === highlightIdx;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                    isHighlighted ? "bg-zinc-800" : "hover:bg-zinc-800/60"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                      isHighlighted ? "bg-zinc-700" : "bg-zinc-800"
                    }`}
                    style={{
                      borderColor: isHighlighted
                        ? "var(--accent-color)"
                        : undefined,
                      borderWidth: isHighlighted ? "1px" : undefined,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color: isHighlighted
                          ? "var(--accent-color)"
                          : "#a1a1aa",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {highlightMatch(item.label, query)}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                    {isHighlighted && (
                      <ArrowRight
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--accent-color)" }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-zinc-800 flex items-center gap-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">
                ↵
              </kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">
                esc
              </kbd>
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
