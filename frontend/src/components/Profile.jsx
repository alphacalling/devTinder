// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../apis";
import UpdateProfileModal from "./ProfileUpdateModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/profile-view");
      const { user: userData, profile: profileData } = response.data;
      setUser(userData);
      setProfile(profileData || null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleProfileUpdate() {
    setIsModalOpen(true);
  }

  if (loading) return <div className="p-4 text-gray-700">Loading...</div>;
  if (!user)
    return <div className="p-4 text-red-600">No profile data found.</div>;

  const photoUrl = Array.isArray(user.photoUrl)
    ? user.photoUrl[0]
    : user.photoUrl;

  return (
    <>
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-xl shadow-lg bg-white">
        <div className="flex items-center space-x-4">
          <img
            src={photoUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {user.userName}
              {user.age && <span className="text-lg text-gray-600">, {user.age}</span>}
            </h2>
            <p className="text-gray-600">
              <span className="font-semibold">Email: </span>
              {user.email}
            </p>
            {user.location && (
              <p className="text-gray-600">
                <span className="font-semibold">Location: </span>
                {user.location}
              </p>
            )}
            {user.phone && (
              <p className="text-gray-600">
                <span className="font-semibold">Contact: </span>
                {user.phone}
              </p>
            )}
          </div>
        </div>

        {profile && (
          <div className="mt-6 border-t pt-4">
            {profile.tagline && (
              <p className="text-lg font-medium text-pink-600">
                “{profile.tagline}”
              </p>
            )}
            {profile.bio && (
              <p className="mt-2 text-gray-700 leading-relaxed">{profile.bio}</p>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {profile.relationshipGoal && (
                <div>
                  <span className="font-semibold">Looking for: </span>
                  {profile.relationshipGoal.replace(/_/g, " ")}
                </div>
              )}
              {profile.jobTitle && (
                <div>
                  <span className="font-semibold">Job: </span>
                  {profile.jobTitle}
                  {profile.company && ` @ ${profile.company}`}
                </div>
              )}
              {profile.education && (
                <div>
                  <span className="font-semibold">Education: </span>
                  {profile.education}
                </div>
              )}
              {profile.hometown && (
                <div>
                  <span className="font-semibold">Hometown: </span>
                  {profile.hometown}
                </div>
              )}
              {profile.preferences && (
                <div className="md:col-span-2">
                  <span className="font-semibold">Preferences: </span>
                  {profile.preferences.gender &&
                    `Interested in ${
                      profile.preferences.gender === "everyone"
                        ? "everyone"
                        : profile.preferences.gender
                    }`}
                  {profile.preferences.minAge &&
                    profile.preferences.maxAge && (
                      <span>
                        {", "}
                        ages {profile.preferences.minAge}-
                        {profile.preferences.maxAge}
                      </span>
                    )}
                </div>
              )}
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
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
          user={user}
          profile={profile}
          onClose={() => setIsModalOpen(false)}
          onUpdated={(updatedUser, updatedProfile) => {
            setUser(updatedUser);
            setProfile(updatedProfile);
          }}
        />
      )}
    </>
  );
}
