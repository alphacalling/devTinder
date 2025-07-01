import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  const user = useSelector((store) => store.user);

  const handleClick = () => {
    if (user) {
      navigate("/feed", { replace: true });
    } else {
      navigate("/register", { replace: true });
    }
  };
  return (
    <div className="bg-[url('./assets/download.jpg')] bg-cover bg-center w-full h-screen">
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-center items-start h-full px-10 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4"
        >
          Welcome to LoveConnect 💖
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-xl mb-6 max-w-lg"
        >
          Find your perfect match and start your beautiful journey today.
          Thousands are waiting to connect with you!
        </motion.p>

        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition"
        >
          {user ? "Go to Feed" : "Get Started"}
        </motion.button>
      </div>
    </div>
  );
};

export default Home;
