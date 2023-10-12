import { useEffect } from "react";
import useUserStore from "./zustand/userStore";
import useErrorStore from "./zustand/errorStore";
import { auth, fetchUserDataFromFirebase } from "./firebase";
import { useLocation, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ExpandedConfession from "./pages/ExpandedConfession";
import ChooseUsername from "./pages/ChooseUsername";
import ErrorComponent from "./components/ErrorComponent";
import "./App.scss";

function App() {
  const { getUser } = useUserStore();
  const { errorMessage } = useErrorStore();

  const setUser = useUserStore((state) => state.setUser); // Get the setUser function
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userData = await fetchUserDataFromFirebase(user.uid);
          setUser(userData);
        } else {
          getUser(null);
        }
      } catch (error) {
        console.log(error.message);
      }
    });

    return () => unsubscribe();
  }, [location]);

  return (
    <div className="app">
      <Navbar />
      <div className="content">
        {errorMessage && <ErrorComponent message={errorMessage} />}

        <Routes>
          <Route exact path="/" element={<Home location={location} />} />
          <Route path="/posts/:id" element={<ExpandedConfession />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/set-username" element={<ChooseUsername />} />
          <Route path="/user/:username" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
