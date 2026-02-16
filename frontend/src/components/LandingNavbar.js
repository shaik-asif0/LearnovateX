import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  BookOpen,
  Info,
  LogIn,
  Menu,
  X,
  Phone,
  Newspaper,
  Code,
  Trophy,
  TrendingUp,
  Gamepad2,
  Brain,
  BarChart3,
  Users,
  Target,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Building2,
  Shield,
  FileText,
  MessageSquare,
  HelpCircle,
  Palette,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useI18n } from "../i18n/I18nProvider";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [accentColor, setAccentColor] = useState("#ff7a00"); // default orange

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const applyAccentTheme = (color) => {
    document.documentElement.style.setProperty("--accent-color", color);
    // Convert hex to HSL for Tailwind/shadcn compatibility
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const hsl = `hsl(${
      Math.round(
        (Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI +
          360
      ) % 360
    }, ${
      Math.round(
        (Math.max(r, g, b) - Math.min(r, g, b)) /
          (255 - Math.min(r, g, b) + Math.max(r, g, b))
      ) * 100
    }%, ${Math.round(((r + g + b) / 3 / 255) * 100)}%)`;
    // Also update Tailwind/shadcn theme variables so bg-primary/text-primary follow the selected accent.
    document.documentElement.style.setProperty("--accent", hsl);
  };

  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    applyAccentTheme(color);
    localStorage.setItem("accentColor", color);
  };

  // load saved accent color on mount
  useEffect(() => {
    const saved = localStorage.getItem("accentColor");
    const color = saved || accentColor;
    setAccentColor(color);
    applyAccentTheme(color);
  }, []);

  const navItems = [
    { label: t("nav.about", "About"), path: "/about", icon: Info },
    { label: t("nav.blog", "Blog"), path: "/blog", icon: Newspaper },
  ];

  const learningItems = [
    {
      label: t("nav.codingArena", "Coding Arena"),
      path: "/coding-arena",
      icon: Gamepad2,
      description: "Interactive coding challenges",
    },
    {
      label: t("nav.aiTutor", "AI Tutor"),
      path: "/ai-tutor",
      icon: Brain,
      description: "Personalized AI learning",
    },
    {
      label: t("nav.roadmaps", "Learning Roadmaps"),
      path: "/roadmaps",
      icon: Target,
      description: "Career path guides",
    },
    {
      label: t("nav.resources", "Resources Hub"),
      path: "/resources",
      icon: BarChart3,
      description: "Learning materials",
    },
  ];

  const careerItems = [
    {
      label: t("nav.careerDashboard", "Career Dashboard"),
      path: "/career-dashboard",
      icon: TrendingUp,
      description: "Track your progress",
    },
    {
      label: t("nav.mockInterviews", "Mock Interviews"),
      path: "/mock-interviews",
      icon: MessageSquare,
      description: "Practice interviews",
    },
    {
      label: t("nav.resume", "Resume Intelligence"),
      path: "/resume",
      icon: FileText,
      description: "AI resume analysis",
    },
    {
      label: t("nav.leaderboard", "Leaderboard"),
      path: "/leaderboard",
      icon: Trophy,
      description: "Compete & achieve",
    },
  ];

  const companyItems = [
    {
      label: t("nav.companyPortal", "Company Portal"),
      path: "/company-portal",
      icon: Building2,
      description: "Hiring tools",
    },
    {
      label: t("nav.careerReadiness", "Career Readiness"),
      path: "/career-readiness",
      icon: Shield,
      description: "Job preparation",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigateTo = (anchor) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } else {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-zinc-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="LearnovateX Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent hidden sm:block">
              LearnovateX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Learning Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setDropdownOpen("learning")}
                onMouseLeave={() => setDropdownOpen(null)}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-orange-400 text-zinc-300"
              >
                <GraduationCap className="w-4 h-4" />
                {t("nav.learning", "Learning")}
                <ChevronDown className="w-3 h-3" />
              </button>
              {dropdownOpen === "learning" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
                  {learningItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-orange-300">
                            {item.label}
                          </div>
                          <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Career Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setDropdownOpen("career")}
                onMouseLeave={() => setDropdownOpen(null)}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-orange-400 text-zinc-300"
              >
                <TrendingUp className="w-4 h-4" />
                {t("nav.career", "Career")}
                <ChevronDown className="w-3 h-3" />
              </button>
              {dropdownOpen === "career" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
                  {careerItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-orange-300">
                            {item.label}
                          </div>
                          <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Company Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setDropdownOpen("company")}
                onMouseLeave={() => setDropdownOpen(null)}
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-orange-400 text-zinc-300"
              >
                <Building2 className="w-4 h-4" />
                {t("nav.company", "For Companies")}
                <ChevronDown className="w-3 h-3" />
              </button>
              {dropdownOpen === "company" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
                  {companyItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-orange-300">
                            {item.label}
                          </div>
                          <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Regular nav items */}
            <button
              onClick={() => handleNavigateTo("features")}
              className="text-sm font-medium transition-colors hover:text-[var(--accent-color)] text-zinc-300"
            >
              {t("nav.features", "Features")}
            </button>
            <button
              onClick={() => handleNavigateTo("faq")}
              className="text-sm font-medium transition-colors hover:text-[var(--accent-color)] text-zinc-300"
            >
              {t("nav.faq", "FAQ")}
            </button>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                  isActive(item.path) ? "text-orange-500" : "text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Accent Palette Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t("nav.accentColor", "Accent color")}
                  className="p-2 rounded-lg"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <Palette
                    className="w-5 h-5"
                    style={{ color: "var(--accent-color)" }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-zinc-900 border-zinc-800 p-3"
              >
                <DropdownMenuLabel className="text-zinc-400 text-xs mb-2">
                  {t("nav.accentColorLabel", "Accent Color")}
                </DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      name: t("nav.colors.orange", "Orange"),
                      color: "#E66A00",
                    },
                    {
                      name: t("nav.colors.hotPink", "Hot Pink"),
                      color: "#C81E6E",
                    }, // pink (bold, clear)
                    {
                      name: t("nav.colors.aquaBlue", "Aqua Blue"),
                      color: "#007C91",
                    },
                    {
                      name: t("nav.colors.royalPurple", "Royal Purple"),
                      color: "#9808a9",
                    }, // aqua (fresh, tech)
                    {
                      name: t("nav.colors.royalPurple", "Royal Purple"),
                      color: "#5B21B6",
                    }, // purple (AI/innovation)
                    {
                      name: t("nav.colors.emeraldGreen", "Emerald Green"),
                      color: "#047857",
                    }, // green (growth)
                  ].map((opt) => (
                    <button
                      key={opt.color}
                      onClick={() => handleAccentColorChange(opt.color)}
                      title={opt.name}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        accentColor === opt.color
                          ? "scale-110 border-white"
                          : "border-zinc-700 hover:border-zinc-500"
                      }`}
                      style={{ backgroundColor: opt.color }}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t("nav.login", "Login")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-zinc-900 border-zinc-800 p-0"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-bold text-white">Menu</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Learning Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider px-3">
                        {t("nav.learning", "Learning")}
                      </div>
                      {learningItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                            isActive(item.path)
                              ? "bg-orange-500/10 text-orange-500"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-zinc-400">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Career Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider px-3">
                        {t("nav.career", "Career")}
                      </div>
                      {careerItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                            isActive(item.path)
                              ? "bg-orange-500/10 text-orange-500"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-zinc-400">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Company Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider px-3">
                        {t("nav.company", "For Companies")}
                      </div>
                      {companyItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                            isActive(item.path)
                              ? "bg-orange-500/10 text-orange-500"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-zinc-400">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Regular nav items */}
                    <div className="border-t border-zinc-800 pt-4 space-y-2">
                      <button
                        onClick={() => {
                          handleNavigateTo("features");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors text-zinc-300 hover:bg-zinc-800`}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-medium">
                          {t("nav.features", "Features")}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          handleNavigateTo("faq");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors text-zinc-300 hover:bg-zinc-800`}
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {t("nav.faq", "FAQ")}
                        </span>
                      </button>
                      {navItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                            isActive(item.path)
                              ? "bg-orange-500/10 text-orange-500"
                              : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      {/* Accent Palette Toggle */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-3">
                          {t("nav.accentColorLabel", "Accent Color")}
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-3">
                          {[
                            {
                              name: t("nav.colors.orange", "Orange"),
                              color: "#E66A00",
                            },
                            {
                              name: t("nav.colors.hotPink", "Hot Pink"),
                              color: "#C81E6E",
                            },
                            {
                              name: t("nav.colors.aquaBlue", "Aqua Blue"),
                              color: "#007C91",
                            },
                            {
                              name: t("nav.colors.royalPurple", "Royal Purple"),
                              color: "#9808a9",
                            },
                            {
                              name: t("nav.colors.royalPurple", "Royal Purple"),
                              color: "#5B21B6",
                            },
                            {
                              name: t(
                                "nav.colors.emeraldGreen",
                                "Emerald Green"
                              ),
                              color: "#047857",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.color}
                              onClick={() => handleAccentColorChange(opt.color)}
                              title={opt.name}
                              className={`w-10 h-10 rounded-full border-2 transition-transform ${
                                accentColor === opt.color
                                  ? "scale-110 border-white"
                                  : "border-zinc-700 hover:border-zinc-500"
                              }`}
                              style={{ backgroundColor: opt.color }}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full justify-start rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="w-5 h-5 mr-3" />
                        {t("nav.login", "Login")}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
