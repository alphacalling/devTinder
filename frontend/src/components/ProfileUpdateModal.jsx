import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../apis";

export default function ProfileUpdateModal({ user, profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    photoUrl: Array.isArray(user?.photoUrl)
      ? user.photoUrl.join(", ")
      : user?.photoUrl || "",
    age: user?.age || "",
    phone: user?.phone || "",
    skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
    gender: user?.gender || "",
    about: user?.about || "",
    location: user?.location || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    interests: Array.isArray(profile?.interests)
      ? profile.interests.join(", ")
      : "",
    relationshipGoal: profile?.relationshipGoal || "",
    jobTitle: profile?.jobTitle || "",
    company: profile?.company || "",
    education: profile?.education || "",
    hometown: profile?.hometown || "",
    prefGender: profile?.preferences?.gender || "everyone",
    prefMinAge: profile?.preferences?.minAge || 18,
    prefMaxAge: profile?.preferences?.maxAge || 60,
    latitude:
      profile?.geoLocation?.coordinates &&
      profile.geoLocation.coordinates.length === 2
        ? profile.geoLocation.coordinates[1]
        : "",
    longitude:
      profile?.geoLocation?.coordinates &&
      profile.geoLocation.coordinates.length === 2
        ? profile.geoLocation.coordinates[0]
        : "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const interestsArray = formData.interests
        ? formData.interests.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const photoUrlsArray = formData.photoUrl
        ? formData.photoUrl.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const payload = {
        userName: formData.userName,
        photoUrl: photoUrlsArray,
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone,
        skills: skillsArray,
        gender: formData.gender,
        about: formData.about,
        location: formData.location,
        tagline: formData.tagline,
        bio: formData.bio,
        interests: interestsArray,
        relationshipGoal: formData.relationshipGoal || undefined,
        jobTitle: formData.jobTitle || undefined,
        company: formData.company || undefined,
        education: formData.education || undefined,
        hometown: formData.hometown || undefined,
        preferences: {
          gender: formData.prefGender,
          minAge: formData.prefMinAge ? Number(formData.prefMinAge) : undefined,
          maxAge: formData.prefMaxAge ? Number(formData.prefMaxAge) : undefined,
        },
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      };

      const response = await api.patch("/profile-update", payload);

      toast.success("Profile updated!");

      if (onUpdated && response.data) {
        onUpdated(response.data.user, response.data.profile);
      }

      onClose();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Updates failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Username"
          />
          <input
            type="text"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Photo URLs (comma-separated)"
          />
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Age"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Phone"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Location"
          />
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Gender"
          />
        </div>

        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          placeholder="About you"
          rows={2}
        />

        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          placeholder="Skills (comma-separated)"
        />

        <hr className="my-4" />

        <h3 className="text-lg font-semibold mb-2">Dating Profile</h3>

        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          placeholder="Short tagline (e.g. 'Coffee lover, dog person')"
        />

        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          placeholder="Tell people more about yourself"
          rows={3}
        />

        <input
          type="text"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
          placeholder="Interests (comma-separated, e.g. travelling, music, gyms)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            name="relationshipGoal"
            value={formData.relationshipGoal}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Relationship goal (e.g. long_term)"
          />
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Job title"
          />
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Company"
          />
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Education"
          />
          <input
            type="text"
            name="hometown"
            value={formData.hometown}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Hometown"
          />
        </div>

        <h3 className="text-md font-semibold mb-2">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            name="prefGender"
            value={formData.prefGender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Preferred gender"
          />
          <input
            type="number"
            name="prefMinAge"
            value={formData.prefMinAge}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Min age"
          />
          <input
            type="number"
            name="prefMaxAge"
            value={formData.prefMaxAge}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Max age"
          />
        </div>

        <h3 className="text-md font-semibold mb-2">Location (for nearby matches)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Latitude (e.g. 28.6139)"
          />
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Longitude (e.g. 77.2090)"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { toast } from "react-hot-toast";

// export default function UpdateProfileModal({ profile, onClose }) {
//   const [formData, setFormData] = useState({
//     userName: profile.userName || "",
//     photoUrl: profile.photoUrl || "",
//     skills: profile.skills?.join(", ") || "",
//     about: profile.about || "",
//     phone: profile.phone || "",
//     gender: profile.gender || "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     // TODO: Call API to update profile
//     console.log("Submitting:", formData);
//     toast.success("Profile updated!");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
//         <h2 className="text-xl font-bold mb-4">Update Profile</h2>

//         <input
//           type="text"
//           name="userName"
//           value={formData.userName}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="Username"
//         />

//         <input
//           type="text"
//           name="photoUrl"
//           value={formData.photoUrl}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="Photo URL"
//         />

//         <input
//           type="text"
//           name="skills"
//           value={formData.skills}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="Skills (comma-separated)"
//         />

//         <input
//           type="text"
//           name="about"
//           value={formData.about}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="About"
//         />

//         <input
//           type="text"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="Phone"
//         />

//         <input
//           type="text"
//           name="gender"
//           value={formData.gender}
//           onChange={handleChange}
//           className="w-full p-2 border rounded mb-4"
//           placeholder="Gender"
//         />

//         <div className="flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
