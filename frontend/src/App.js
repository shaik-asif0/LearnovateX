import CourseLearnPage from "./pages/CourseLearnPage";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster, toast } from "sonner";
import "./App.css";
import { isAuthenticated, getUser } from "./lib/utils";
import axiosInstance from "./lib/axios";
import NavigationBar from "./components/NavigationBar";
import MobileBottomNav from "./components/MobileBottomNav";
import SupportChatWidget from "./components/SupportChatWidget";
import { I18nProvider } from "./i18n/I18nProvider";
// import SplashCursor from "./components/SplashCursor";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import TutorPage from "./pages/TutorPage";
import CodingArena from "./pages/CodingArena";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import CareerReadinessPage from "./pages/CareerReadinessPage";
import CompanyPortal from "./pages/CompanyPortal";
import CollegeAdmin from "./pages/CollegeAdmin";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LearningPathPage from "./pages/LearningPathPage";
import AchievementsPage from "./pages/AchievementsPage";
import ResourcesPage from "./pages/ResourcesPage";
import Roadmap from "./pages/Roadmap";
import PremiumPage from "./pages/PremiumPage";
import PremiumCoursesPage from "./pages/PremiumCoursesPage";
import PremiumInternshipsPage from "./pages/PremiumInternshipsPage";
import CourseEnrollmentPage from "./pages/CourseEnrollmentPage";
import InternshipApplicationPage from "./pages/InternshipApplicationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import InteractiveCodingGamePrompt from "./pages/InteractiveCodingGamePrompt";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" />;
};

// Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = getUser();
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// Wrapper to handle auth state updates on route changes
const AppContent = () => {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const user = getUser();
  const activityRef = useRef({ path: null, startMs: null });

  // Apply SettingsPage preferences globally (real-time)
  useEffect(() => {
    const getUserSettingsKey = (currentUser) => {
      const keyPart =
        currentUser?.id || currentUser?._id || currentUser?.email || "";
      return keyPart ? `userSettings:${keyPart}` : "userSettings:anonymous";
    };

    const applyThemePreference = (themePref) => {
      const root = document.documentElement;
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      )?.matches;

      const resolved =
        themePref === "system" ? (prefersDark ? "dark" : "light") : themePref;

      root.dataset.theme = resolved === "light" ? "light" : "dark";
      root.style.colorScheme = resolved === "light" ? "light" : "dark";
    };

    const syncFromSettingsStorage = () => {
      try {
        const key = getUserSettingsKey(getUser());
        const raw = localStorage.getItem(key);
        if (!raw) {
          applyThemePreference("dark");
          return;
        }
        const parsed = JSON.parse(raw);
        const themePref = parsed?.preferences?.theme || "dark";
        applyThemePreference(themePref);
      } catch (e) {
        applyThemePreference("dark");
      }
    };

    syncFromSettingsStorage();

    const handleThemeMediaChange = () => syncFromSettingsStorage();
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");

    window.addEventListener("storage", syncFromSettingsStorage);
    window.addEventListener("userSettingsChange", syncFromSettingsStorage);
    media?.addEventListener?.("change", handleThemeMediaChange);

    return () => {
      window.removeEventListener("storage", syncFromSettingsStorage);
      window.removeEventListener("userSettingsChange", syncFromSettingsStorage);
      media?.removeEventListener?.("change", handleThemeMediaChange);
    };
  }, []);

  const postActivityEvent = useCallback(async (payload) => {
    if (!isAuthenticated()) return;
    try {
      await axiosInstance.post("/activity/event", payload);
    } catch (e) {
      // ignore tracking failures
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Full AI features available.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline. Using demo mode for AI features.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Re-check auth on every route change
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [location.pathname]);

  // Always reset scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  // Lightweight automatic tracking (page views + time spent per route)
  useEffect(() => {
    const nowMs = Date.now();
    const prev = activityRef.current;

    if (prev.path && prev.startMs && prev.path !== location.pathname) {
      const durationSeconds = Math.max(
        0,
        Math.round((nowMs - prev.startMs) / 1000)
      );
      if (durationSeconds > 0) {
        postActivityEvent({
          event_type: "time_spent",
          path: prev.path,
          duration_seconds: durationSeconds,
        });
      }
    }

    activityRef.current = { path: location.pathname, startMs: nowMs };
    postActivityEvent({ event_type: "page_view", path: location.pathname });
  }, [location.pathname, postActivityEvent]);

  // Flush last route time-spent on unmount
  useEffect(() => {
    return () => {
      const prev = activityRef.current;
      if (!prev?.path || !prev?.startMs) return;
      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - prev.startMs) / 1000)
      );
      if (durationSeconds > 0) {
        postActivityEvent({
          event_type: "time_spent",
          path: prev.path,
          duration_seconds: durationSeconds,
        });
      }
    };
  }, [postActivityEvent]);

  const showMobileBottomNav =
    isAuth && user && ["student", "job_seeker"].includes(user.role);

  // Listen for storage events (for auth changes)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(isAuthenticated());
    };
    window.addEventListener("storage", handleStorageChange);

    // Custom event for same-tab auth updates
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  return (
    <>
      {isAuth && <NavigationBar />}
      <div
        className={`app-content ${isAuth ? "app-content--with-nav" : ""} ${
          showMobileBottomNav ? "pb-20 md:pb-0" : ""
        }`}
      >
        <Routes>
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium/courses"
            element={
              <ProtectedRoute>
                <PremiumCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium/internships"
            element={
              <ProtectedRoute>
                <PremiumInternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium/courses/enroll/:courseId"
            element={
              <ProtectedRoute>
                <CourseEnrollmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium/internships/apply/:internshipId"
            element={
              <ProtectedRoute>
                <InternshipApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={isAuth ? <Navigate to="/dashboard" /> : <LandingPage />}
          />
          <Route
            path="/auth"
            element={isAuth ? <Navigate to="/dashboard" /> : <AuthPage />}
          />
          <Route
            path="/forgot-password"
            element={
              isAuth ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor"
            element={
              <ProtectedRoute>
                <TutorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <CodingArena />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-readiness"
            element={
              <ProtectedRoute>
                <CareerReadinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-path"
            element={
              <ProtectedRoute>
                <LearningPathPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company"
            element={
              <RoleProtectedRoute allowedRoles={["company"]}>
                <CompanyPortal />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/college"
            element={
              <RoleProtectedRoute allowedRoles={["college_admin"]}>
                <CollegeAdmin />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/course-learn"
            element={
              <ProtectedRoute>
                <CourseLearnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding-game-3d"
            element={
              <ProtectedRoute>
                <InteractiveCodingGamePrompt />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <SupportChatWidget />
      {showMobileBottomNav && <MobileBottomNav />}
    </>
  );
};

function App() {
  return (
    <div className="App">
      {/* <SplashCursor /> */}
      <BrowserRouter>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
