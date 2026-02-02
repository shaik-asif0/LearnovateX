import CourseLearnPage from "./pages/CourseLearnPage";
import React, { useState, useEffect, useCallback } from "react";
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
import NavigationBar from "./components/NavigationBar";
import MobileBottomNav from "./components/MobileBottomNav";
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
        </Routes>
      </div>
      {showMobileBottomNav && <MobileBottomNav />}
    </>
  );
};

function App() {
  return (
    <div className="App">
      {/* <SplashCursor /> */}
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
