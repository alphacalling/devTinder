import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../apis";

const ChangePassword = () => {
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);

    setPassword((prev) => ({ ...prev, [name]: value }));
  }
  async function handlePassword() {
    try {
      const response = await api.patch("/change-password", password);

      const data = await response.json();
      console.log(data);
      toast.success("Password updated!");
    } catch (error) {
      console.log(error);
      const message =
        error?.response?.data?.message || "Password change failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">ChangePassword</h2>
        <form>
          <label htmlFor="Current Password">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            className="w-full p-2 border rounded mb-4"
            placeholder="Current Password"
            value={password.currentPassword}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="New Password">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="w-full p-2 border rounded mb-4"
            placeholder="New Password"
            value={password.newPassword}
            onChange={handleChange}
          />
          <br />

          <button
            onClick={handlePassword}
            disabled={loading}
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-2 py-2 mt-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <svg
            className="w-5 h-3 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default ChangePassword;
