import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../apis";
import toast from "react-hot-toast";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const TABS = [
  { id: "find", label: "Find people" },
  { id: "accepted", label: "Accepted" },
  { id: "pending_received", label: "Pending (for you)" },
  { id: "pending_sent", label: "Pending (sent)" },
];

function UserCard({
  user,
  showActions = false,
  showConnectSkip = false,
  onAccept,
  onReject,
  onConnect,
  onSkip,
}) {
  const primaryPhoto = Array.isArray(user.photoUrl)
    ? user.photoUrl?.[0]
    : user.photoUrl;
  const photo = primaryPhoto || DEFAULT_AVATAR;
  const profile = user.profile || {};

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <img
        src={photo}
        alt={user.userName}
        className="w-14 h-14 rounded-full object-cover"
        onError={(e) => {
          e.target.src = DEFAULT_AVATAR;
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">
          {user.userName}
          {user.age && (
            <span className="text-gray-600 text-sm">{`, ${user.age}`}</span>
          )}
        </p>
        {user.location && (
          <p className="text-xs text-gray-500">{user.location}</p>
        )}
        {(profile.tagline || user.about) && (
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {profile.tagline || user.about}
          </p>
        )}
      </div>
      {showActions && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onReject(user._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Reject
          </button>
          <button
            onClick={() => onAccept(user._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white"
          >
            Accept
          </button>
        </div>
      )}
      {showConnectSkip && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onSkip(user._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Skip
          </button>
          <button
            onClick={() => onConnect(user._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white"
          >
            Connect
          </button>
        </div>
      )}
      {!showActions && !showConnectSkip && user._id && (
        <Link
          to={`/chat?with=${user._id}`}
          className="shrink-0 px-3 py-1.5 text-sm rounded-lg bg-pink-500 hover:bg-pink-600 text-white"
        >
          Chat
        </Link>
      )}
    </div>
  );
}

export default function MyMatches() {
  const [tab, setTab] = useState("find");
  const [findPeople, setFindPeople] = useState([]);
  const [findLoading, setFindLoading] = useState(false);
  const [accepted, setAccepted] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFindPeople = async () => {
    setFindLoading(true);
    try {
      const res = await api.get(
        "/connections/connection-requests/connection-feed?page=1&limit=20",
      );
      setFindPeople(res.data.data || []);
    } catch (err) {
      console.error(err);
      setFindPeople([]);
    } finally {
      setFindLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [acceptedRes, receivedRes, sentRes] = await Promise.all([
        api.get("/connections/connection-requests/accepted-requests"),
        api.get("/connections/connection-requests/pending-received"),
        api.get("/connections/connection-requests/pending-sent"),
      ]);
      setAccepted(acceptedRes.data.data || []);
      setPendingReceived(receivedRes.data.data || []);
      setPendingSent(sentRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (tab === "find") fetchFindPeople();
  }, [tab]);

  const handleConnect = async (userId) => {
    try {
      const res = await api.post(
        `/connections/connection-request/send/interested/${userId}`,
      );
      const data = res?.data;
      if (data?.alreadyReceived) {
        setFindPeople((prev) => prev.filter((u) => u._id !== userId));
        await fetchAll();
        setTab("pending_received");
        toast.success("They already want to connect — accept below");
      } else {
        toast.success("Connection request sent");
        setFindPeople((prev) => prev.filter((u) => u._id !== userId));
        fetchAll();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send");
    }
  };

  const handleSkip = async (userId) => {
    try {
      await api.post(`/connections/connection-request/send/ignored/${userId}`);
      setFindPeople((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await api.post(
        `/connections/connection-request/review/accepted/${senderId}`,
      );
      toast.success("Request accepted");
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (senderId) => {
    try {
      await api.post(
        `/connections/connection-request/review/rejected/${senderId}`,
      );
      toast.success("Request rejected");
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const list =
    tab === "find"
      ? findPeople
      : tab === "accepted"
        ? accepted
        : tab === "pending_received"
          ? pendingReceived
          : pendingSent;
  const showActions = tab === "pending_received";
  const showConnectSkip = tab === "find";
  const emptyMessage =
    tab === "find"
      ? "No one new to show right now. Everyone you haven’t connected with has been covered—check back later or try the Discover feed."
      : tab === "accepted"
        ? "You don't have any connections yet. Use the “Find people” tab to send requests."
        : tab === "pending_received"
          ? "No pending requests for you."
          : "You have no pending sent requests.";
  const isLoading = tab === "find" ? findLoading : loading;

  return (
    <div className="min-h-152 bg-gray-50 pt-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">
          Your Connections
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Accepted matches can chat with you. Pending tabs show requests waiting
          for a response.
        </p>

        <div className="flex gap-2 border-b border-gray-200 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                tab === t.id
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-gray-700 py-4">
            {tab === "find"
              ? "Finding people you can connect with..."
              : "Loading..."}
          </div>
        )}

        {error && !isLoading && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}

        {!isLoading && !error && list.length === 0 && (
          <div className="text-gray-600 text-sm py-4">{emptyMessage}</div>
        )}

        {tab === "find" && (
          <div className="flex items-center justify-between gap-3 mb-3">
            {list.length > 0 ? (
              <p className="text-sm text-gray-500">
                People you haven’t connected with yet. Send a request or skip.
              </p>
            ) : null}
            <button
              type="button"
              onClick={fetchFindPeople}
              disabled={findLoading}
              className="shrink-0 text-sm font-medium text-pink-600 hover:text-pink-700 disabled:opacity-50"
            >
              {findLoading ? "Loading…" : "Refresh list"}
            </button>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-1">
          {list.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              showActions={showActions}
              showConnectSkip={showConnectSkip}
              onAccept={handleAccept}
              onReject={handleReject}
              onConnect={handleConnect}
              onSkip={handleSkip}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
