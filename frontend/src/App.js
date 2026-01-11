import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { isAuthenticated, getUser } from "./lib/utils";
import NavigationBar from "./components/NavigationBar";

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

  // Re-check auth on every route change
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [location.pathname]);

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
      <div className={`app-content ${isAuth ? "app-content--with-nav" : ""}`}>
        <Routes>
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
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
