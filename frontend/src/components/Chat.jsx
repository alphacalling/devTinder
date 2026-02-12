import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../apis";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

export default function Chat() {
  const currentUser = useSelector((state) => state.user);
  const myId = currentUser?._id;
  const [searchParams, setSearchParams] = useSearchParams();
  const withUserId = searchParams.get("with");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] || null;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: token ? { token } : {},
    });

    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("connect_error", () => {
      console.warn("Socket connect error - chat may not be real-time");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/chat/conversations");
        setConversations(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [messages.length]);

  useEffect(() => {
    if (!withUserId) {
      setSelectedUser(null);
      setMessages([]);
      return;
    }
    const conv = conversations.find((c) => c.user._id === withUserId);
    if (conv) setSelectedUser(conv.user);
  }, [withUserId, conversations]);

  useEffect(() => {
    if (!selectedUser?._id) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/chat/messages/${selectedUser._id}`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !selectedUser?._id || !socketRef.current?.connected) return;

    socketRef.current.emit(
      "send_message",
      { toUserId: selectedUser._id, text },
      (ack) => {
        if (ack?.success && ack?.data) {
          setMessages((prev) => [...prev, ack.data]);
          setInputText("");
        } else {
          console.error(ack?.message || "Send failed");
        }
      }
    );
  };

  const primaryPhoto = Array.isArray(selectedUser?.photoUrl)
    ? selectedUser.photoUrl[0]
    : selectedUser?.photoUrl;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50">
      <div className="w-80 shrink-0 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
          <p className="text-xs text-gray-500">Accepted connections only</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">
              No conversations yet. Accept someone from My Connections to chat.
            </div>
          ) : (
            conversations.map((conv) => {
              const u = conv.user;
              const photo = Array.isArray(u.photoUrl) ? u.photoUrl[0] : u.photoUrl;
              const isActive = selectedUser?._id === u._id;
              return (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(u);
                    setSearchParams({ with: u._id });
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left border-b border-gray-100 hover:bg-gray-50 ${
                    isActive ? "bg-pink-50" : ""
                  }`}
                >
                  <img
                    src={photo}
                    alt={u.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {u.userName}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage.sentByMe ? "You: " : ""}
                        {conv.lastMessage.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedUser ? (
          <>
            <div className="p-3 border-b flex items-center gap-3">
              <img
                src={primaryPhoto}
                alt={selectedUser.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedUser.userName}
                </p>
                {selectedUser.age && (
                  <p className="text-xs text-gray-500">{selectedUser.age}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {loadingMessages ? (
                <div className="text-gray-500 text-sm">Loading messages...</div>
              ) : (
                messages.map((msg) => {
                  const senderIdRaw = msg.senderId;
                  const senderIdStr =
                    typeof senderIdRaw === "object" && senderIdRaw !== null && "_id" in senderIdRaw
                      ? senderIdRaw._id
                      : senderIdRaw;
                  const isMe = String(senderIdStr) === String(myId);
                  const label = isMe ? "You" : (selectedUser?.userName ?? "Them");
                  return (
                    <div
                      key={msg._id}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex flex-col max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-pink-500 text-white items-end"
                            : "bg-gray-200 text-gray-900 items-start"
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                          {label}
                        </span>
                        <p className="text-sm break-words w-full">{msg.text}</p>
                        <span
                          className={`text-xs mt-1 ${isMe ? "text-pink-100" : "text-gray-500"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or open one from My Connections
          </div>
        )}
      </div>
    </div>
  );
}

