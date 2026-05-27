import { createSlice } from "@reduxjs/toolkit";

const getConversationId = (message) =>
  typeof message.conversation === "string" ? message.conversation : message.conversation?._id;

const messageSlice = createSlice({
  name: "message",
  initialState: {
    conversations: [],
    activeConversationId: "",
    messages: [],
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      if (state.messages.some((existingMessage) => existingMessage._id === message._id)) {
        return;
      }

      state.messages.push(message);

      const conversationId = getConversationId(message);
      if (!conversationId) {
        return;
      }

      const targetConversation = state.conversations.find(
        (conversation) => conversation._id === conversationId,
      );

      if (targetConversation) {
        targetConversation.lastMessage = message;
      }
    },
  },
});

export const { setConversations, setActiveConversation, setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
