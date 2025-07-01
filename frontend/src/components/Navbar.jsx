import {  useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Threedot from "./Threedot";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  // console.log(user);

  // const dispatch = useDispatch();
  // localStorage.setItem("user", JSON.stringify(user));
  // if (user) {
  //   localStorage.getItem("user", JSON.stringify(user));
  // }

  // useEffect(() => {
  //   if (user) {
  //     localStorage.setItem("user", JSON.stringify(user));
  //   } else {
  //     localStorage.removeItem("user");
  //   }
  // }, [user]);

  return (
    <nav className="bg-gradient-to-r from-pink-100 via-pink-50 to-purple-100 shadow-lg px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <div className="text-3xl font-extrabold text-pink-600 tracking-tight">
          <Link to="/">Connect</Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-4 text-gray-800 font-medium">
          {!user && (
            <li>
              <Link
                to="/paid-service"
                className="hover:text-pink-600 transition duration-200"
              >
                Subscription
              </Link>
            </li>
          )}

          {user ? (
            <li className="flex items-center space-x-2">
              <img
                src={user.photoUrl}
                alt="User"
                className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-pink-400"
              />
              <span className="text-pink-700 font-semibold">
                Hi, {user.userName}
              </span>
            </li>
          ) : (
            <>
              <li>
                <Link to="/register">
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow transition duration-300 cursor-pointer">
                    Join Now
                  </button>
                </Link>
              </li>
              <li>
                <Link to="/logIn">
                  <button className="bg-white border border-pink-600 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition duration-300 cursor-pointer">
                    Login
                  </button>
                </Link>
              </li>
            </>
          )}

          {user && (
            <li>
              <Threedot />
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
