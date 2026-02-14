import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../apis";

export default function ProfileUpdateModal({
  user,
  profile,
  onClose,
  onUpdated,
}) {
  // from backend
  const [options, setOptions] = useState({
    genderOptions: [],
    preferredGenderOptions: [],
    relationshipGoals: [],
    skillsOptions: [],
    interestsOptions: [],
  });

  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    photoUrl: Array.isArray(user?.photoUrl)
      ? user.photoUrl.join(", ")
      : user?.photoUrl || "",
    age: user?.age || "",
    phone: user?.phone || "",
    skills: Array.isArray(user?.skills) ? user.skills : [],
    gender: user?.gender || "",
    about: user?.about || "",
    location: user?.location || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    interests: Array.isArray(profile?.interests) ? profile.interests : [],
    relationshipGoal: profile?.relationshipGoal || "",
    jobTitle: profile?.jobTitle || "",
    company: profile?.company || "",
    education: profile?.education || "",
    hometown: profile?.hometown || "",
    prefGender: profile?.preferences?.gender || "everyone",
    prefMinAge: profile?.preferences?.minAge || 18,
    prefMaxAge: profile?.preferences?.maxAge || 60,
    latitude:
      profile?.geoLocation?.coordinates?.length === 2
        ? profile.geoLocation.coordinates[1]
        : "",
    longitude:
      profile?.geoLocation?.coordinates?.length === 2
        ? profile.geoLocation.coordinates[0]
        : "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Fetch dropdown options from backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get("/form-options");
        if (res.data?.success) {
          setOptions(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch form options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multi-select toggle for skills
  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Multi-select toggle for interests
  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Geolocation: use browser API
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        toast.success("Location detected successfully!");
        setGeoLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let message = "Unable to retrieve your location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message =
              "Location permission denied. Please allow location access.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            break;
        }
        toast.error(message);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const photoUrlsArray = formData.photoUrl
        ? formData.photoUrl
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const payload = {
        userName: formData.userName || undefined,
        photoUrl: photoUrlsArray,
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        gender: formData.gender || undefined,
        about: formData.about || undefined,
        location: formData.location || undefined,
        tagline: formData.tagline || undefined,
        bio: formData.bio || undefined,
        interests:
          formData.interests.length > 0 ? formData.interests : undefined,
        relationshipGoal: formData.relationshipGoal || undefined,
        jobTitle: formData.jobTitle || undefined,
        company: formData.company || undefined,
        education: formData.education || undefined,
        hometown: formData.hometown || undefined,
        preferences: {
          gender: formData.prefGender || undefined,
          minAge: formData.prefMinAge ? Number(formData.prefMinAge) : undefined,
          maxAge: formData.prefMaxAge ? Number(formData.prefMaxAge) : undefined,
        },
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      };

      const response = await api.patch("/profile-update", payload);

      toast.success("Profile updated!");

      if (onUpdated && response.data) {
        onUpdated(response.data.user, response.data.profile);
      }

      onClose();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Update failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format label from snake_case
  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Basic Info */}
        <h3 className="text-md font-semibold mb-2 text-gray-700">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="120"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
              placeholder="Age (18-120)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
              placeholder="Phone"
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none bg-white"
            >
              <option value="">Select Gender</option>
              {options.genderOptions.map((g) => (
                <option key={g} value={g}>
                  {formatLabel(g)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Photo URLs (comma-separated)
          </label>
          <input
            type="text"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
            placeholder="https://example.com/photo1.jpg, https://..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            About
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
            placeholder="Tell us about yourself"
            rows={2}
          />
        </div>

        {/* Skills Multi-Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Skills{" "}
            <span className="text-xs text-gray-400">(click to toggle)</span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
            {options.skillsOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  formData.skills.includes(skill)
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {formatLabel(skill)}
              </button>
            ))}
          </div>
          {formData.skills.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.skills.map(formatLabel).join(", ")}
            </p>
          )}
        </div>

        <hr className="my-4" />

        {/* Dating Profile */}
        <h3 className="text-lg font-semibold mb-2 text-pink-600">
          Dating Profile
        </h3>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tagline
          </label>
          <input
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
            placeholder="Coffee lover, dog person ☕🐕"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
            placeholder="Tell people more about yourself..."
            rows={3}
          />
        </div>

        {/* Interests Multi-Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Interests{" "}
            <span className="text-xs text-gray-400">(click to toggle)</span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
            {options.interestsOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  formData.interests.includes(interest)
                    ? "bg-pink-500 text-white"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                {formatLabel(interest)}
              </button>
            ))}
          </div>
          {formData.interests.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.interests.map(formatLabel).join(", ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {/* Relationship Goal Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Relationship Goal
            </label>
            <select
              name="relationshipGoal"
              value={formData.relationshipGoal}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none bg-white"
            >
              <option value="">Select Goal</option>
              {options.relationshipGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {formatLabel(goal)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
              placeholder="Google, Meta..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Education
            </label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
              placeholder="B.Tech from IIT..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Hometown
            </label>
            <input
              type="text"
              name="hometown"
              value={formData.hometown}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 outline-none"
              placeholder="Mumbai, India"
            />
          </div>
        </div>

        {/* Preferences */}
        <h3 className="text-md font-semibold mb-2 text-gray-700">
          Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Preferred Gender Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Interested In
            </label>
            <select
              name="prefGender"
              value={formData.prefGender}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none bg-white"
            >
              {options.preferredGenderOptions.map((g) => (
                <option key={g} value={g}>
                  {formatLabel(g)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Min Age
            </label>
            <input
              type="number"
              name="prefMinAge"
              value={formData.prefMinAge}
              onChange={handleChange}
              min="18"
              max="120"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Max Age
            </label>
            <input
              type="number"
              name="prefMaxAge"
              value={formData.prefMaxAge}
              onChange={handleChange}
              min="18"
              max="120"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-300 outline-none"
            />
          </div>
        </div>

        {/* Geolocation */}
        <h3 className="text-md font-semibold mb-2 text-gray-700">
          Location (for nearby matches)
        </h3>
        <div className="mb-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors text-sm cursor-pointer flex items-center gap-2"
          >
            {geoLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Detecting...
              </>
            ) : (
              <>📍 Use My Current Location</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="e.g. 28.6139"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="e.g. 77.2090"
            />
          </div>
        </div>

        {formData.latitude && formData.longitude && (
          <p className="text-xs text-green-600 mb-4">
            📍 Location set: {formData.latitude}, {formData.longitude}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 transition-colors cursor-pointer"
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
