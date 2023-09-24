import useUserStore from "../zustand/userStore";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOutFirebase } from "../firebase/authentication";
import Logo from "../assets/logo.png";
import { MdLogout } from "react-icons/md";
import "../styles/Navbar.scss";

const Navbar = () => {
  const user = auth.currentUser;
  const location = useLocation();

  const userData = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser); // Get the setUser function

  const handleSignOut = () => {
    signOutFirebase();
    setUser(null);
  };

  const determineSigninButton = () => {
    if (userData) {
      return (
        <button className="sign-out-btn" onClick={handleSignOut}>
          <MdLogout />
        </button>
      );
    } else if (userData === null) {
      return (
        <Link className="sign-in-btn" to={"/sign-in"}>
          Sign in
        </Link>
      );
    }
  };

  const handleRefresh = () => {
    if (location.pathname === "/") {
      window.location.reload();
    }
  };

  return (
    <nav className="navbar">
      <li>
        <Link to={"/"} onClick={handleRefresh}>
          <img src={Logo} alt="confessIt"></img>
        </Link>
      </li>
      <div>
        <li className="user-display">
          {userData && (
            <Link to={`/user/${userData.username}`}>{userData.username}</Link>
          )}
        </li>
        <li>{determineSigninButton()}</li>
      </div>
    </nav>
  );
};

export default Navbar;
