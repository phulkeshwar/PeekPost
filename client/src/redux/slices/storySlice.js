import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../services/api";

export const fetchStories = createAsyncThunk("story/fetch", async () => {
  const { data } = await api.get("/stories/feed");
  return Array.isArray(data) ? data : [];
});

export const createStory = createAsyncThunk("story/create", async (payload) => {
  const formData = new FormData();
  formData.append("media", payload.file);
  formData.append("text", payload.text || "");
  formData.append("audience", payload.audience || "public");

  const { data } = await api.post("/stories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
});

const storySlice = createSlice({
  name: "story",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    setStories: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items.filter((item) => item._id !== action.payload._id)];
      });
  },
});

export const { setStories } = storySlice.actions;
export default storySlice.reducer;
