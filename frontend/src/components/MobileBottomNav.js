import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Code,
  BookOpen,
  Target,
  User,
} from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";
import { getUser, toAbsoluteUploadsUrl } from "../lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const navItems = [
    { label: t("nav.home", "Home"), path: "/dashboard", icon: LayoutDashboard },
    { label: t("nav.aiTutor", "AI Tutor"), path: "/tutor", icon: Bot },
    { label: t("nav.coding", "Coding"), path: "/coding", icon: Code },
    {
      label: t("nav.resources", "Resources"),
      path: "/resources",
      icon: BookOpen,
    },
    {
      label: t("nav.readiness", "Readiness"),
      path: "/career-readiness",
      icon: Target,
    },
    { label: t("nav.profile", "Profile"), path: "/profile", icon: User },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const onAuthChange = () => setUser(getUser());
    window.addEventListener("authChange", onAuthChange);
    return () => window.removeEventListener("authChange", onAuthChange);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-2">
        <div className="grid grid-cols-6 gap-1 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`min-h-12 rounded-md px-1 py-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? "bg-zinc-900/60 text-[var(--accent-color)]"
                    : "text-zinc-400 hover:bg-zinc-900/40"
                }`}
                aria-label={item.label}
              >
                {item.path === "/profile" ? (
                  <Avatar className="w-5 h-5">
                    {user?.avatar_url && (
                      <AvatarImage
                        src={toAbsoluteUploadsUrl(user?.avatar_url)}
                      />
                    )}
                    <AvatarFallback className="bg-white text-black text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className="text-[10px] leading-none truncate max-w-[4.25rem]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
