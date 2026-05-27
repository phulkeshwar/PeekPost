import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../services/api";

export const fetchFeed = createAsyncThunk("feed/fetch", async (page = 1) => {
  const { data } = await api.get(`/posts/feed?page=${page}&limit=10`);
  return data;
});

const normalizeFeedPayload = (payload, requestedPage = 1) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: requestedPage,
      hasMore: payload.length >= 10,
    };
  }

  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.posts)
      ? payload.posts
      : [];

  return {
    items,
    page: Number(payload?.page) || requestedPage,
    hasMore:
      typeof payload?.hasMore === "boolean" ? payload.hasMore : items.length >= 10,
  };
};

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,
  },
  reducers: {
    prependPost: (state, action) => {
      state.items.unshift(action.payload);
    },
    resetFeed: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeFeedPayload(action.payload, Number(action.meta.arg) || 1);
        state.items =
          action.meta.arg === 1
            ? normalized.items
            : [...(state.items || []), ...normalized.items];
        state.page = normalized.page;
        state.hasMore = normalized.hasMore;
      })
      .addCase(fetchFeed.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { prependPost, resetFeed } = feedSlice.actions;
export default feedSlice.reducer;