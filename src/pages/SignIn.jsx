import { useState } from "react";
import useUserStore from "../zustand/userStore";
import { Link, useNavigate } from "react-router-dom";
import { signIn, signInWithGoogle, auth } from "../firebase/authentication";
import { checkIfUsernameSelected } from "../firebase";
import { AiOutlineGoogle } from "react-icons/ai";
import "../styles/SignIn.scss";

const SignIn = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser); // Get the setUser function

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (event) => {
    event.preventDefault();

    try {
      await signIn(email, password);
      console.log("Login successful");
      const currentUser = auth.currentUser;
      if (currentUser) {
        const uid = currentUser.uid;
        const userData = await checkIfUsernameSelected(uid);
        if (!userData) {
          navigate("/set-username");
        } else {
          setUser(userData);
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const uid = currentUser.uid;
        const userData = await checkIfUsernameSelected(uid);
        if (!userData) {
          navigate("/set-username");
        } else {
          setUser(userData);
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="sign-in-form">
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button type="submit">Sign In</button>
        </div>
      </form>
      <div className="google-signup-cont">
        <p>Or continue with</p>
        <div>
          <button onClick={handleGoogleSignIn}>
            <AiOutlineGoogle />
          </button>
        </div>
      </div>
      <p>
        Don't have an account? <Link to={"/sign-up"}>Sign Up</Link>
      </p>
    </div>
  );
};

export default SignIn;
