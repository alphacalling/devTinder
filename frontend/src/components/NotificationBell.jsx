import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../apis";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

function formatTime(createdAt) {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell() {
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications/");
        setList(res.data.data || []);
        setUnreadCount(res.data.unreadCount ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1] || {},
    });
    socketRef.current.on("notification", (payload) => {
      setList((prev) => [{ ...payload, read: false }, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getLink = (n) => {
    if (n.type === "connection_request" || n.type === "connection_accepted" || n.type === "connection_rejected") {
      return "/my-connections";
    }
    if (n.type === "chat" && n.fromUserId) return `/chat?with=${n.fromUserId}`;
    if (n.type === "new_user") return "/feed";
    return "#";
  };

  return (
    <div ref={panelRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-white/60 transition"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white px-1.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <span className="font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-pink-600 hover:text-pink-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
            ) : (
              list.slice(0, 20).map((n) => (
                <Link
                  key={n._id}
                  to={getLink(n)}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b border-gray-100 hover:bg-pink-50/50 transition ${!n.read ? "bg-pink-50/30" : ""}`}
                >
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatTime(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
