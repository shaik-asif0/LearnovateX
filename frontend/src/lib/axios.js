import axios from "axios";
import { API, getAuthToken } from "./utils";

const axiosInstance = axios.create({
  baseURL: API,
  timeout: 30000, // 30 second timeout for mobile
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for offline mode
const cache = new Map();

const isOnline = () => navigator.onLine;

// Retry configuration for mobile
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.code === 'NETWORK_ERROR' ||
           error.code === 'TIMEOUT' ||
           (error.response && error.response.status >= 500);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add retry logic for mobile
    config.retry = retryConfig;

    // If offline, try to return cached data
    if (!isOnline()) {
      const cacheKey = `${config.method}-${config.url}`;
      const cached = localStorage.getItem(`api-cache-${cacheKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          // 24 hours
          return Promise.reject({
            response: { data: parsed.data, status: 200 },
            message: "Offline cached response",
            isOfflineCache: true,
          });
        }
      }
      // If no cache, reject with offline error
      return Promise.reject({
        message: "No internet connection and no cached data available",
        isOffline: true,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === "get" && isOnline()) {
      const cacheKey = `${response.config.method}-${response.config.url}`;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(`api-cache-${cacheKey}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Cache storage failed:', error);
      }
    }
    return response;
  },
  (error) => {
    // If it's our offline cache, return it as success
    if (error.isOfflineCache) {
      return Promise.resolve(error.response);
    }

    // Retry logic for mobile
    const config = error.config;
    if (config && config.retry && config.retry.retries > 0 && retryConfig.retryCondition(error)) {
      config.retry.retries -= 1;
      return new Promise(resolve => {
        setTimeout(() => resolve(axiosInstance(config)), config.retry.retryDelay);
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
