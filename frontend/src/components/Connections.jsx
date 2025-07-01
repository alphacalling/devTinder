// import React, { useEffect, useState } from "react";
// import photo from "../assets/photo.png";

// const Feed = () => {
//   const [feed, setFeed] = useState([]);

//   useEffect(() => {
//     async function fetchFeedData() {
//       const res = await fetch(
//         import.meta.env.VITE_API_URL +
//           "/v1/connection-requests/connection-feed",
//         {
//           credentials: "include",
//         }
//       );
//       const data = await res.json();
//       setFeed(data.data || []);
//     }
//     fetchFeedData();
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-start pt-12 bg-gray-50 h-[610px]">
//       <h2 className="text-2xl font-semibold mb-4">Your Suggestions</h2>

//       {/* Suggestion card container */}
//       <div className="bg-white w-80 sm:w-96 p-6 rounded-xl shadow-2xl flex flex-col items-center">
//         {feed.length === 0 ? (
//           <h1>Loading...</h1>
//         ) : (
//           <>
//             {feed.map((user, index) => {
//               return (
//                 <div key={index}>
//                   <img
//                     className="w-32 h-32 object-cover rounded-full mb-4"
//                     src={user.photoUrl}
//                     alt="photo"
//                   />
//                   <p className="text-lg font-medium mb-6">{user.userName}</p>
//                 </div>
//               );
//             })}
//             {/* <img
//               src={photo}
//               alt="photo"
//               className="w-32 h-32 object-cover rounded-full mb-4"
//             />
//             <p className="text-lg font-medium mb-6">{feed[0].userName}</p> */}
//             {/* <p className="text-lg font-medium mb-6">{feed[0].userName}</p> */}

//             {/* Buttons at the bottom */}
//             <div className="mt-auto w-full flex justify-between">
//               <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold w-[45%]">
//                 Previous
//               </button>
//               <button className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold w-[45%]">
//                 Next
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Feed;

import { useEffect, useState } from "react";

const Connections = () => {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFeedData = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/connection-requests/connection-feed?page=${pageNum}&limit=1`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setFeed(data.data);
        setHasMore(true);
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
  }, [page]);

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

  return (
    <div className="flex flex-col items-center justify-start pt-12 bg-gray-50 h-[610px]">
      <h2 className="text-2xl font-semibold mb-4">Your Suggestions</h2>

      <div className="bg-white w-80 sm:w-96 p-6 rounded-xl shadow-2xl flex flex-col items-center">
        {loading ? (
          <h1>Loading...</h1>
        ) : feed.length === 0 ? (
          <div className="text-center">
            <h1 className="text-lg font-semibold mb-4">No Suggestions Found</h1>
            <button
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold transition hover:bg-blue-600"
              onClick={handleRefresh}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          </div>
        ) : (
          <>
            {feed.map((user, index) => (
              <div
                key={index}
                className="flex flex-col items-center mb-6 text-center"
              >
                <img
                  className="w-32 h-32 object-cover rounded-full mb-4"
                  src={user.photoUrl}
                  alt="photo"
                />
                <p className="text-lg font-medium">{user.userName}</p>
                {user.gender && (
                  <p className="text-md">
                    <span className="font-semibold">Gender: </span>
                    {user.gender}
                  </p>
                )}
                {user.age && (
                  <p className="text-md">
                    <span className="font-semibold">Age: </span>
                    {user.age}
                  </p>
                )}
              </div>
            ))}

            <div className="mt-auto w-full flex justify-between gap-4">
              <button
                onClick={handlePrevious}
                className={`flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold w-[45%] transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={page === 1}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <button
                onClick={handleNext}
                className={`flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold w-[45%] transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!hasMore}
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Connections;
