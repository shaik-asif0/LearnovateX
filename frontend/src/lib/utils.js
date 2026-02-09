import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const getApiBaseUrl = () => {
  const envBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const trimmed = envBaseUrl.replace(/\/+$/, "");

  // If the app is served over HTTPS, browsers will block HTTP API calls (mixed content).
  // Auto-upgrade to HTTPS for non-localhost URLs as a safety net.
  if (
    typeof window !== "undefined" &&
    window.location?.protocol === "https:" &&
    trimmed.startsWith("http://") &&
    !trimmed.includes("localhost") &&
    !trimmed.includes("127.0.0.1")
  ) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  return trimmed;
};

// Prefer a relative API path when the app is not running on localhost and
// the configured REACT_APP_API_BASE_URL points to localhost (common when
// the app was built with a local dev .env). This avoids mixed-content
// errors in production and lets the browser call the same origin `/api`.
const getApiBaseUrlSafe = () => {
  const raw = process.env.REACT_APP_API_BASE_URL;
  // If no env var, default behavior uses trimmed from getApiBaseUrl()
  if (!raw) return getApiBaseUrl();

  const isLocalhostConfig =
    raw.includes("localhost") || raw.includes("127.0.0.1");
  const runningOnLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // If the config points to localhost but the app is NOT served from localhost,
  // return empty so API becomes a relative `/api` path.
  if (isLocalhostConfig && !runningOnLocalhost) return "";

  return getApiBaseUrl();
};

export const API = `${getApiBaseUrlSafe()}/api`.replace(/\/+$/, "");

export const toAbsoluteUploadsUrl = (maybeUrl) => {
  if (!maybeUrl) return "";
  const value = String(maybeUrl);

  // Already absolute or a browser-managed URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Normalize /uploads paths coming from the backend
  if (value.startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${value}`;
  }
  if (value.startsWith("uploads/")) {
    return `${getApiBaseUrl()}/${value}`;
  }

  return value;
};

// Enhanced storage functions for mobile compatibility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem("token", token);
      // Also store in sessionStorage as backup for mobile
      if (isMobile()) {
        sessionStorage.setItem("token", token);
      }
    } else {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }
  } catch (error) {
    console.warn("Storage not available:", error);
  }
};

export const getAuthToken = () => {
  try {
    // Try localStorage first, then sessionStorage for mobile
    let token = localStorage.getItem("token");
    if (!token && isMobile()) {
      token = sessionStorage.getItem("token");
    }
    return token;
  } catch (error) {
    console.warn("Storage not available:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const clearAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch (error) {
    console.warn("Storage not available:", error);
  }
};

export const setUser = (user) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
    if (isMobile()) {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.warn("Storage not available:", error);
  }
};

export const getUser = () => {
  try {
    let user = localStorage.getItem("user");
    if (!user && isMobile()) {
      user = sessionStorage.getItem("user");
    }
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.warn("Storage not available:", error);
    return null;
  }
};
