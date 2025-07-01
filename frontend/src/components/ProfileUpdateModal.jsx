import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../apis";

export default function ProfileUpdateModal({ profile, onClose }) {
  const [formData, setFormData] = useState({
    userName: profile.userName,
    photoUrl: profile.photoUrl,
    age: profile.age,
    phone: profile.phone,
    skills: profile.skills?.join(", "),
    gender: profile.gender,
    about: profile.about,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // TODO: Update API logic
    // e.preventDefault();
    try {
      const response = await api.patch("/profile-update", formData);
      console.log(response);
      console.log("Submitting", formData);
      toast.success("Profile updated!");
      onClose();
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || "Updates failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>

        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Username"
        />

        <input
          type="text"
          name="photoUrl"
          value={formData.photoUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Photo URL"
        />

        <input
          type="text"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="age"
        />

        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Phone"
        />

        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Skills (comma-separated)"
        />

        <input
          type="text"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Gender"
        />

        <input
          type="text"
          name="about"
          value={formData.about}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="About"
        />

        <div className="flex justify-end gap-2">
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
