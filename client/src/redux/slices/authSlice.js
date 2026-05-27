import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, setAuthToken } from "../../services/api";
import { connectSocket, disconnectSocket } from "../../socket/socket";
import { getStoredUsers, saveStoredUsers } from "../../utils/mockData";

const initialToken = localStorage.getItem("peekpost_access_token") || "";
const initialUser = localStorage.getItem("peekpost_user");
const parsedInitialUser = (() => {
  if (!initialUser || initialUser === "undefined") return null;
  try {
    return JSON.parse(initialUser);
  } catch {
    return null;
  }
})();

const normalizeAuthPayload = (payload, fallbackUsername = "user") => {
  if (!payload || typeof payload !== "object") return null;

  const user = payload.user || payload.profile || payload.account || null;
  const accessToken =
    payload.accessToken || payload.token || payload.jwt || payload.authToken || "";

  if (!user) return null;

  return {
    user,
    accessToken: accessToken || `local-${fallbackUsername}-${Date.now()}`,
  };
};

const safeConnectSocket = (token) => {
  try {
    connectSocket(token);
  } catch {
    // Keep auth flow functional even if realtime connection fails.
  }
};

const safeDisconnectSocket = () => {
  try {
    disconnectSocket();
  } catch {
    // Ignore socket teardown issues during logout.
  }
};

if (initialToken) {
  setAuthToken(initialToken);
  safeConnectSocket(initialToken);
}

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    const normalized = normalizeAuthPayload(data, payload.emailOrUsername || "user");
    if (!normalized) {
      return rejectWithValue("Unexpected login response. Please try again.");
    }
    return normalized;
  } catch (error) {
    const users = getStoredUsers();
    const matcher = payload.emailOrUsername?.trim()?.toLowerCase();
    const matched = users.find(
      (user) =>
        user.username?.toLowerCase() === matcher || user.email?.toLowerCase() === matcher,
    );

    if (!matched) {
      return rejectWithValue("Create your profile first, then log in.");
    }

    return {
      user: matched,
      accessToken: `local-${matched.username}-${Date.now()}`,
    };
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    const normalized = normalizeAuthPayload(data, payload.username || "user");
    if (!normalized) {
      return rejectWithValue("Unexpected signup response. Please log in.");
    }
    return normalized;
  } catch (error) {
    const users = getStoredUsers();
    const exists = users.some(
      (user) =>
        user.username?.toLowerCase() === payload.username?.toLowerCase() ||
        user.email?.toLowerCase() === payload.email?.toLowerCase(),
    );
    if (exists) {
      return rejectWithValue("Username or email already exists.");
    }

    const newUser = {
      id: `u-${Date.now()}`,
      _id: `u-${Date.now()}`,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      avatar: `https://placehold.co/200x200?text=${payload.username?.[0]?.toUpperCase() || "U"}`,
      bio: "",
      followersCount: 0,
      followingCount: 0,
    };
    saveStoredUsers([...users, newUser]);

    return {
      user: newUser,
      accessToken: `local-${newUser.username}-${Date.now()}`,
    };
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: parsedInitialUser,
    accessToken: initialToken,
    loading: false,
    error: null,
  },
  reducers: {
    logoutLocal: (state) => {
      state.user = null;
      state.accessToken = "";
      localStorage.removeItem("peekpost_access_token");
      localStorage.removeItem("peekpost_user");
      setAuthToken("");
      safeDisconnectSocket();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (!action.payload?.user) {
          state.loading = false;
          state.error = "Login response is missing user data.";
          return;
        }
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("peekpost_access_token", action.payload.accessToken);
        localStorage.setItem("peekpost_user", JSON.stringify(action.payload.user));
        setAuthToken(action.payload.accessToken);
        safeConnectSocket(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        if (!action.payload?.user) {
          state.loading = false;
          state.error = "Signup response is missing user data.";
          return;
        }
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("peekpost_access_token", action.payload.accessToken);
        localStorage.setItem("peekpost_user", JSON.stringify(action.payload.user));
        setAuthToken(action.payload.accessToken);
        safeConnectSocket(action.payload.accessToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logoutLocal } = authSlice.actions;
export default authSlice.reducer;
