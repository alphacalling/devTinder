import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apis";
import toast from "react-hot-toast";

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const { userName, email, password } = formData;
    if (!userName.trim()) return "Username is required.";
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email.";
    if (!password.trim()) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/register", formData);
      console.log(response.data);
      toast.success("Registration successful");
      navigate("/login");
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[88vh] flex justify-center items-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center text-pink-600">
          Register Form
        </h2>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div>
          <label
            htmlFor="userName"
            className="block text-sm font-semibold text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            name="userName"
            placeholder="Enter your name"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.userName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-600 cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition cursor-pointer"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already registered?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Click here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
