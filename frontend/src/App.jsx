import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import LogIn from "./components/LogIn";
import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Feed from "./components/Connections";
import Home from "./components/Home";
import { setUser } from "./redux/slices/authSlice";
import Connections from "./components/Connections";
import ChangePassword from "./components/ChangePassword";


function App() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const location = useLocation();

  useEffect(() => {
    const storedInfo = localStorage.getItem("user");
    if (storedInfo) {
      dispatch(setUser(JSON.parse(storedInfo)));
    }
  }, [dispatch]);

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  const GuestRoute = ({ children }) => {
    return user ? <Navigate to="/feed" replace /> : children;
  };

  return (
    <React.Fragment>
      {/* Show Navbar on all pages except Home */}
      {location.pathname !== "/" && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LogIn />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <PrivateRoute>
              <Connections />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile-view"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
      </Routes>
    </React.Fragment>
  );
}

export default function AppWrapper() {
  // Needed because useLocation only works inside Router
  return (
    <Router>
      <App />
    </Router>
  );
}
