import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { removeUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../apis";

export default function Threedot() {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState();
  // handle profile update
  // useEffect(() => {
  const handleProfileView = async () => {
    try {
      const response = await api.get("/v1/profile-view");
      const data = await response.data.data;
      console.log(data);
      navigate("/profile-view");
      setProfile(data);
    } catch (err) {
      console.log(err);
    }
  };
  handleProfileView;
  // }, []);
  function handleLogout() {
    dispatch(removeUser());

    if (localStorage.getItem("user")) {
      localStorage.removeItem("user");
    }

    if (sessionStorage.getItem("user")) {
      sessionStorage.removeItem("user");
    }
    navigate("/");
    toast.success("Logout successful");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex justify-center rounded-full p-2 text-gray-700 hover:bg-gray-200"
          aria-label="More options"
          aria-haspopup="true"
        >
          ⋮
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div className="py-1">
            <Link
              to="/profile-view"
              // onClick={handleProfileView}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </Link>
            <Link
              to="/connections"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Connections
            </Link>
            <Link
              to="/change-password"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
