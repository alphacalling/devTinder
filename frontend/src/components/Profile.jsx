// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../apis";
import UpdateProfileModal from "./ProfileUpdateModal";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile-view");
        console.log(response);

        setProfile(response.data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  function handleProfileUpdate() {
    setIsModalOpen(true);
  }

  if (loading) return <div className="p-4 text-gray-700">Loading...</div>;
  if (!profile)
    return <div className="p-4 text-red-600">No profile data found.</div>;

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl shadow-lg bg-white">
        <div className="flex items-center space-x-4">
          <img
            src={profile.photoUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{profile.userName}</h2>
            <p className="text-gray-600">
              <span className="font-semibold">email: </span>
              {profile.email}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">age: </span>
              {profile.age}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Contact Number: </span>
              {profile.phone}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">about: </span>
              {profile.about}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          {profile.skills && profile.skills.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {profile.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No skills listed.</p>
          )}
        </div>
      </div>
      <button
        onClick={handleProfileUpdate}
        type="button"
        className="fixed bottom-10 right-10 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-300"
      >
        Update Profile
      </button>

      {isModalOpen && (
        <UpdateProfileModal
          profile={profile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
