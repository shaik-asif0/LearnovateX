import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LayoutDashboard,
  Bot,
  Code,
  FileSearch,
  MessageSquare,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
  Palette,
  Bell,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { getUser, clearAuth } from "../lib/utils";
import axiosInstance from "../lib/axios";
import { useI18n } from "../i18n/I18nProvider";
import SearchBar from "./SearchBar";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [accentColor, setAccentColor] = useState("#ff7a00"); // default orange

  const isStudent = user?.role === "student";

  const settingsKey =
    user?.id || user?._id || user?.email
      ? `userSettings:${user.id || user._id || user.email}`
      : "userSettings:anonymous";

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifContextId, setNotifContextId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const notifLongPressTimerRef = useRef(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      const key = `readNotifications:${
        user?.id || user?._id || user?.email || "anonymous"
      }`;
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const key = `deletedNotifications:${
        user?.id || user?._id || user?.email || "anonymous"
      }`;
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const persistReadIds = (nextSet) => {
    try {
      const key = `readNotifications:${
        user?.id || user?._id || user?.email || "anonymous"
      }`;
      localStorage.setItem(key, JSON.stringify(Array.from(nextSet)));
    } catch {
      // ignore
    }
  };

  const persistDeletedIds = (nextSet) => {
    try {
      const key = `deletedNotifications:${
        user?.id || user?._id || user?.email || "anonymous"
      }`;
      localStorage.setItem(key, JSON.stringify(Array.from(nextSet)));
    } catch {
      // ignore
    }
  };

  const getPushEnabledFromSettings = () => {
    try {
      const raw = localStorage.getItem(settingsKey);
      if (!raw) return true;
      const parsed = JSON.parse(raw);
      const n = parsed?.notifications;
      if (!n || typeof n !== "object") return true;
      return n.push !== false;
    } catch {
      return true;
    }
  };

  const fetchNotifications = async () => {
    if (!isStudent) return;

    try {
      const res = await axiosInstance.get("/student/notifications");
      const list = Array.isArray(res.data) ? res.data : [];
      const pushEnabled = getPushEnabledFromSettings();
      const filtered = pushEnabled ? list : [];
      const withoutDeleted = filtered.filter((n) => !deletedIds.has(n?.id));
      setNotifications(withoutDeleted);
    } catch {
      setNotifications([]);
    }
  };

  const startNotifLongPress = (id) => {
    if (!id) return;
    if (notifLongPressTimerRef.current) {
      clearTimeout(notifLongPressTimerRef.current);
    }
    notifLongPressTimerRef.current = setTimeout(() => {
      setNotifContextId(id);
    }, 500);
  };

  const cancelNotifLongPress = () => {
    if (notifLongPressTimerRef.current) {
      clearTimeout(notifLongPressTimerRef.current);
      notifLongPressTimerRef.current = null;
    }
  };

  const hexToRgb = (hex) => {
    const h = (hex || "").replace("#", "").trim();
    const expanded =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const bigint = parseInt(expanded, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  const rgbToHslString = ({ r, g, b }) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === rn) h = ((gn - bn) / delta) % 6;
      else if (max === gn) h = (bn - rn) / delta + 2;
      else h = (rn - gn) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);
    return `${h} ${sPct}% ${lPct}%`;
  };

  const applyAccentTheme = (color) => {
    document.documentElement.style.setProperty("--accent-color", color);

    const { r, g, b } = hexToRgb(color);
    document.documentElement.style.setProperty(
      "--accent-rgb",
      `${r}, ${g}, ${b}`
    );

    // Also update Tailwind/shadcn theme variables so bg-primary/text-primary follow the selected accent.
    const hsl = rgbToHslString({ r, g, b });
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--accent", hsl);
    document.documentElement.style.setProperty("--ring", hsl);
    document.documentElement.style.setProperty("--warning", hsl);
    document.documentElement.style.setProperty("--info", hsl);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsNavVisible(false);
      } else {
        // Scrolling up or at top
        setIsNavVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isStudent) return;
    if (!notifOpen) return;
    fetchNotifications();
  }, [notifOpen, isStudent]);

  const unreadCount = notifications.filter((n) => !readIds.has(n?.id)).length;

  const markAsRead = (id) => {
    if (!id) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  };

  const deleteNotification = (id) => {
    if (!id) return;

    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDeletedIds(next);
      return next;
    });

    setNotifications((prev) => prev.filter((n) => n?.id !== id));
    setNotifContextId(null);
  };

  useEffect(() => {
    const navItems = document.querySelectorAll(".hoverable");
    navItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add("bounce");
    });
  }, []);

  // load saved accent color on mount
  useEffect(() => {
    const saved = localStorage.getItem("accentColor");
    const color = saved || accentColor;
    setAccentColor(color);
    applyAccentTheme(color);
  }, []);

  // On route changes, ensure nav is visible and close mobile menu
  useEffect(() => {
    setIsNavVisible(true);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    applyAccentTheme(color);
    localStorage.setItem("accentColor", color);
  };

  if (!user) {
    return null;
  }

  // Main navigation items with uniform color
  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: t("nav.dashboard", "Dashboard"),
      path: "/dashboard",
      roles: ["student", "job_seeker"],
    },
    {
      icon: Bot,
      label: t("nav.aiTutor", "AI Tutor"),
      path: "/tutor",
      roles: ["student", "job_seeker"],
    },
    {
      icon: Code,
      label: t("nav.codingArena", "Coding Arena"),
      path: "/coding",
      roles: ["student", "job_seeker"],
    },
    {
      icon: BookOpen,
      label: t("nav.resources", "Resources"),
      path: "/resources",
      roles: ["student", "job_seeker"],
    },
    {
      icon: Trophy,
      label: t("nav.careerReadiness", "Career Readiness"),
      path: "/career-readiness",
      roles: ["student", "job_seeker"],
    },
    {
      icon: Sparkles,
      label: t("nav.premium", "Premium"),
      path: "/premium",
      roles: ["student", "job_seeker", "company", "college_admin"],
    },
    {
      icon: FileSearch,
      label: t("nav.resumeAnalyzer", "Resume Analyzer"),
      path: "/resume",
      roles: ["job_seeker"],
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
    },
    {
      icon: MessageSquare,
      label: t("nav.mockInterview", "Mock Interview"),
      path: "/interview",
      roles: ["job_seeker"],
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
    },
    {
      icon: Building2,
      label: t("nav.companyPortal", "Company Portal"),
      path: "/company",
      roles: ["company"],
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
    },
    {
      icon: GraduationCap,
      label: t("nav.collegeAdmin", "College Admin"),
      path: "/college",
      roles: ["college_admin"],
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
    },
  ];

  const filteredMainNav = mainNavItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event("authChange"));
    navigate("/auth");
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full bg-black border-b border-zinc-800 transition-transform duration-300 ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="w-10 h-10 rounded-full"
              />
            </div>
            {/* <div className="hidden sm:block">
              <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase">
                AI Learning Platform
              </p>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                LearnovateX
              </p>
            </div> */}
          </div>

          {/* Search Bar - always visible */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-2 sm:mx-4">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredMainNav.map((item) => {
              const active = isActive(item.path);
              const isPremium = item.label === "Premium";
              const Icon = item.icon;
              const iconOnlyPaths = [
                "/dashboard",
                "/tutor",
                "/coding",
                "/resources",
                "/career-readiness",
              ];
              const showIconOnly = iconOnlyPaths.includes(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  className={`relative flex items-center ${
                    showIconOnly ? "justify-center" : "gap-2"
                  } px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 hoverable mx-1
                    ${
                      isPremium
                        ? `text-black shadow-md border hover:opacity-95`
                        : active
                        ? `text-white glow`
                        : `text-zinc-400 hover:text-white`
                    }
                    ${active && isPremium ? "ring-2" : ""}`}
                  style={
                    isPremium
                      ? {
                          minWidth: 110,
                          backgroundColor: "var(--accent-color)",
                          borderColor: "var(--accent-color)",
                        }
                      : {}
                  }
                >
                  {showIconOnly ? (
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-white" : "text-zinc-400"
                      }`}
                      style={{
                        color: active ? "var(--accent-color)" : undefined,
                      }}
                    />
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {active && !isPremium && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side - Profile + Accent Toggle */}
          <div className="flex items-center gap-2">
            {isStudent && (
              <DropdownMenu
                open={notifOpen}
                onOpenChange={(open) => {
                  setNotifOpen(open);
                  if (!open) setNotifContextId(null);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Notifications"
                    className="relative p-2 rounded-lg"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <Bell className="w-5 h-5 text-zinc-200" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-zinc-900 border-zinc-800"
                >
                  <DropdownMenuLabel className="text-zinc-300">
                    {t("nav.notifications", "Notifications")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <div className="max-h-80 overflow-auto p-1">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-sm text-zinc-500 text-center">
                        {t("notifications.none", "No notifications")}
                      </div>
                    ) : (
                      notifications.slice(0, 25).map((n) => {
                        const isUnread = !readIds.has(n?.id);
                        return (
                          <DropdownMenuItem
                            key={n?.id}
                            onClick={() => {
                              if (notifContextId === n?.id) {
                                setNotifContextId(null);
                                return;
                              }
                              markAsRead(n?.id);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setNotifContextId(n?.id);
                            }}
                            onTouchStart={() => startNotifLongPress(n?.id)}
                            onTouchEnd={cancelNotifLongPress}
                            onTouchCancel={cancelNotifLongPress}
                            className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800 ${
                              isUnread ? "bg-white/5" : ""
                            }`}
                          >
                            <div className="w-full flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-white">
                                {n?.title ||
                                  t("common.notification", "Notification")}
                              </span>
                              <div className="flex items-center gap-2">
                                {notifContextId === n?.id && (
                                  <button
                                    type="button"
                                    aria-label="Delete notification"
                                    title="Delete"
                                    className="p-1 rounded hover:bg-zinc-700"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      deleteNotification(n?.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                                  </button>
                                )}
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-zinc-400 line-clamp-2">
                              {n?.message || ""}
                            </span>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Accent Palette Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Accent color"
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
                  Accent Color
                </DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Orange", color: "#E66A00" },
                    { name: "Hot Pink", color: "#C81E6E" }, // pink (bold, clear)
                    { name: "Aqua Blue", color: "#007C91" }, // aqua (fresh, tech)
                    { name: "Royal Purple", color: "#5B21B6" }, // purple (AI/innovation)
                    { name: "Emerald Green", color: "#047857" }, // green (growth)
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
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all duration-200">
                  <Avatar className="w-8 h-8 border-2 border-zinc-700">
                    <AvatarFallback className="bg-white text-black text-sm font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white leading-tight">
                      {user?.name?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-zinc-900 border-zinc-800"
              >
                <DropdownMenuLabel className="p-4 bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-zinc-700">
                      <AvatarFallback className="bg-white text-black text-lg font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-zinc-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-white/10 text-zinc-300 rounded-full capitalize">
                        {user?.role?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>{t("nav.myProfile", "My Profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t("nav.settings", "Settings")}</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => navigate("/leaderboard")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>{t("nav.leaderboard", "Leaderboard")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/achievements")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{t("nav.achievements", "Achievements")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/resources")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t("nav.resources", "Resources")}</span>
                  </DropdownMenuItem>
                </div>
                {(user?.role === "company" ||
                  user?.role === "college_admin") && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <div className="p-1">
                      {user?.role === "company" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/company")}
                          className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>
                            {t("nav.companyPortal", "Company Portal")}
                          </span>
                        </DropdownMenuItem>
                      )}
                      {user?.role === "college_admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/college")}
                          className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-orange-500 rounded-lg cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>{t("nav.collegeAdmin", "College Admin")}</span>
                        </DropdownMenuItem>
                      )}
                    </div>
                  </>
                )}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav.logout", "Sign Out")}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-zinc-950 border-zinc-800 text-white p-4"
              >
                <SheetHeader className="text-left">
                  <SheetTitle className="text-white">
                    {t("nav.menu", "Menu")}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-1 overflow-auto max-h-[calc(100vh-6rem)] pr-1">
                  {filteredMainNav.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    const isPremium = item.label === "Premium";
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-colors " +
                          (active
                            ? "bg-white/10 text-white"
                            : "text-zinc-300 hover:text-white hover:bg-white/5")
                        }
                        style={
                          isPremium
                            ? {
                                backgroundColor:
                                  "rgba(var(--accent-rgb), 0.14)",
                                border:
                                  "1px solid rgba(var(--accent-rgb), 0.28)",
                              }
                            : {}
                        }
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: active ? "var(--accent-color)" : undefined,
                          }}
                        />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="pt-3 mt-3 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">
                        {t("nav.myProfile", "My Profile")}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">
                        {t("nav.settings", "Settings")}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">
                        {t("nav.logout", "Sign Out")}
                      </span>
                    </button>
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

export default NavigationBar;
