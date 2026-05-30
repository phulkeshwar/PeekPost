import axios from "axios";

const trimTrailingSlashes = (value) => value.replace(/\/+$/, "");

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed === "/api") {
    return "/api";
  }

  const sanitized = trimTrailingSlashes(trimmed);

  if (sanitized.startsWith("http://") || sanitized.startsWith("https://")) {
    try {
      const parsed = new URL(sanitized);
      const normalizedPath = trimTrailingSlashes(parsed.pathname || "");
      parsed.pathname = normalizedPath && normalizedPath !== "/" ? normalizedPath : "/api";
      return `${parsed.origin}${parsed.pathname}`;
    } catch (_error) {
      return sanitized;
    }
  }

  return sanitized.endsWith("/api") ? sanitized : `${sanitized}/api`;
};

const resolveApiBaseUrl = () => {
  const envBaseUrl = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "",
  );
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // In local development Vite proxy handles /api.
  if (import.meta.env.DEV) {
    return "/api";
  }

  // In production, default to same-origin /api (works if frontend and backend are behind same domain/proxy).
  return `${window.location.origin}/api`;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add interceptor to automatically log out on 401 unauthorized errors (e.g. invalid/expired JWT or mock token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("peekpost_access_token");
      localStorage.removeItem("peekpost_user");
      setAuthToken("");
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
