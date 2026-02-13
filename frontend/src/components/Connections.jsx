import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const Connections = () => {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("recommended");
  const [radiusKm, setRadiusKm] = useState(5);

  const fetchFeedData = async (pageNum, currentMode = mode, currentRadius = radiusKm) => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const url =
        currentMode === "nearby"
          ? `${baseUrl}/connections/nearby?radiusKm=${currentRadius}&page=${pageNum}&limit=1`
          : `${baseUrl}/connections/connection-requests/connection-feed?page=${pageNum}&limit=1`;

      const res = await fetch(url, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success && data.data?.length > 0) {
        setFeed(data.data);
        setHasMore(data.meta?.hasMore ?? true);
      } else {
        setFeed([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData(page);
  }, [page, mode, radiusKm]);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchFeedData(1);
  };

  const sendConnectionAction = async (userId, action) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(
        `${baseUrl}/connections/connection-request/send/${action}/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        if (data.alreadyReceived) {
          toast.success("They already want to connect — accept in Pending requests");
        } else {
          toast.success(
            action === "interested"
              ? "You liked this profile"
              : "Skipped"
          );
        }
        handleNext();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch (err) {
      console.error("Error sending connection action:", err);
      toast.error("Something went wrong");
    }
  };

  const handleLike = () => {
    if (!feed.length) return;
    sendConnectionAction(feed[0]._id, "interested");
  };

  const handleSkip = () => {
    if (!feed.length) return;
    sendConnectionAction(feed[0]._id, "ignored");
  };

  const primaryPhoto = (user) => {
    const url = Array.isArray(user?.photoUrl)
      ? user.photoUrl[0]
      : user?.photoUrl;
    return url || DEFAULT_AVATAR;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-pink-100/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Discover
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Swipe through profiles and connect with people who match your vibe.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="inline-flex rounded-full bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setMode("recommended");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  mode === "recommended"
                    ? "bg-white text-pink-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For you
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("nearby");
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  mode === "nearby"
                    ? "bg-white text-pink-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Near you
              </button>
            </div>
            {mode === "nearby" && (
              <select
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                value={radiusKm}
                onChange={(e) => {
                  setRadiusKm(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Finding people for you...</p>
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No one new right now
            </h2>
            <p className="text-gray-500 max-w-sm mb-6">
              Check back later or update your preferences in your profile to see more matches.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 font-medium transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link
                to="/my-connections"
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-medium transition"
              >
                My connections
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {feed.map((user, index) => {
              const profile = user.profile || {};
              const photo = primaryPhoto(user);

              return (
                <article
                  key={user._id ?? index}
                  className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-pink-100/50 border border-pink-100/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                  <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                      <div className="shrink-0">
                        <div className="relative">
                          <img
                            src={photo}
                            alt={user.userName}
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover ring-2 ring-pink-100"
                            onError={(e) => {
                              e.target.src = DEFAULT_AVATAR;
                            }}
                          />
                          {user.age && (
                            <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-0.5 text-sm font-medium text-gray-700 shadow-sm">
                              {user.age}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {user.userName}
                        </h2>
                        {user.location && (
                          <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-500 mt-1">
                            <span className="text-pink-500">📍</span>
                            {user.location}
                          </p>
                        )}
                        {profile.tagline && (
                          <p className="mt-3 text-pink-600 font-medium">
                            &ldquo;{profile.tagline}&rdquo;
                          </p>
                        )}
                        {profile.bio && (
                          <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {profile.bio}
                          </p>
                        )}
                        {profile.interests?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                            {profile.interests.slice(0, 5).map((interest, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 font-semibold transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={handleLike}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3.5 font-semibold shadow-lg shadow-pink-500/30 transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Connect
                      </button>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={page === 1}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!hasMore}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Connections;
