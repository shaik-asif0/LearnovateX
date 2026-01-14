import React, { useState, useEffect } from "react";
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
  X,
  ChevronDown,
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  Building2,
  GraduationCap,
} from "lucide-react";
import { getUser, clearAuth } from "../lib/utils";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const navItems = document.querySelectorAll(".hoverable");
    navItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add("bounce");
    });
  }, []);

  if (!user) {
    return null;
  }

  // Main navigation items with uniform color
  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["student", "job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Bot,
      label: "AI Tutor",
      path: "/tutor",
      roles: ["student", "job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Code,
      label: "Coding Arena",
      path: "/coding",
      roles: ["student", "job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: BookOpen,
      label: "Resources",
      path: "/resources",
      roles: ["student", "job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Trophy,
      label: "Career Readiness",
      path: "/career-readiness",
      roles: ["student", "job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: FileSearch,
      label: "Resume Analyzer",
      path: "/resume",
      roles: ["job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: MessageSquare,
      label: "Mock Interview",
      path: "/interview",
      roles: ["job_seeker"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Building2,
      label: "Company Portal",
      path: "/company",
      roles: ["company"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      icon: GraduationCap,
      label: "College Admin",
      path: "/college",
      roles: ["college_admin"],
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
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
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
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
              <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase">
                AI Learning Platform
              </p>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                LearnovateX
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredMainNav.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hoverable ${
                    active
                      ? `text-white glow`
                      : `text-zinc-400 hover:text-white`
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side - Profile */}
          <div className="flex items-center gap-2">
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
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-lg cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 rounded-lg cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => navigate("/leaderboard")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-yellow-600 rounded-lg cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/achievements")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 rounded-lg cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Achievements</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/resources")}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 rounded-lg cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Resources</span>
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
                          className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 rounded-lg cursor-pointer"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Company Portal</span>
                        </DropdownMenuItem>
                      )}
                      {user?.role === "college_admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/college")}
                          className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-cyan-600 rounded-lg cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>College Admin</span>
                        </DropdownMenuItem>
                      )}
                    </div>
                  </>
                )}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {filteredMainNav.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all duration-200 hoverable ${
                    active
                      ? `text-white glow`
                      : `text-zinc-400 hover:text-white`
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
