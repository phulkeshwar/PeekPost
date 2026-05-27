import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ChatList from "../components/messages/ChatList";
import ChatWindow from "../components/messages/ChatWindow";
import {
  addMessage,
  setActiveConversation,
  setConversations,
  setMessages,
} from "../redux/slices/messageSlice";
import { api } from "../services/api";
import { useSocket } from "../hooks/useSocket";

const Messages = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const { conversations, activeConversationId, messages } = useSelector((state) => state.message);
  const [draft, setDraft] = useState("");
  const requestedConversationId = searchParams.get("conversation");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        dispatch(setConversations(data));
        const requestedConversation = requestedConversationId
          ? data.find((conversation) => conversation._id === requestedConversationId)
          : null;

        if (requestedConversation) {
          dispatch(setActiveConversation(requestedConversation._id));
        } else if (data[0]) {
          dispatch(setActiveConversation(data[0]._id));
        } else {
          dispatch(setActiveConversation(""));
        }
      } catch {
        dispatch(setConversations([]));
        dispatch(setActiveConversation(""));
      }
    };

    load();
  }, [dispatch, requestedConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;

    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages/conversations/${activeConversationId}`);
        dispatch(setMessages(data));
      } catch {
        dispatch(setMessages([]));
      }
    };

    loadMessages();
  }, [activeConversationId, dispatch]);

  const handlers = useMemo(
    () => ({
      "message:new": (message) => {
        if (
          message.conversation === activeConversationId ||
          message.conversation?._id === activeConversationId
        ) {
          dispatch(addMessage(message));
        }
      },
    }),
    [activeConversationId, dispatch],
  );

  useSocket(token, handlers);

  const activeConversation = conversations.find((conversation) => conversation._id === activeConversationId) || null;

  const send = async () => {
    if (!draft.trim() || !activeConversationId) return;

    try {
      const { data } = await api.post(`/messages/conversations/${activeConversationId}`, {
        text: draft.trim(),
      });
      dispatch(addMessage(data));
    } catch {
      dispatch(addMessage({
        _id: `local-msg-${Date.now()}`,
        text: draft.trim(),
        sender: { _id: user?.id },
      }));
    }
    setDraft("");
  };

  return (
    <div className="ig-messages-shell">
      <ChatList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={(conversationId) => dispatch(setActiveConversation(conversationId))}
        currentUserId={user?.id || user?._id}
      />
      <ChatWindow
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={send}
        currentUserId={user?.id || user?._id}
        activeConversation={activeConversation}
      />
    </div>
  );
};

export default Messages;
