import { useState } from "react";
import { signUp, signInWithGoogle } from "../firebase/authentication";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AiOutlineGoogle } from "react-icons/ai";
import "../styles/SignUp.scss";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      window.alert("Passwords don't match!");
      return;
    }

    try {
      await signUp(email, password);
      navigate("/sign-in");
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

  const determineBorder = () => {
    if (password === confirmPassword) return "none";
    else if (confirmPassword && password !== confirmPassword)
      return "1px solid red";
  };

  return (
    <div className="sign-up-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <label htmlFor="email">E-Mail</label>
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
        <label htmlFor="confirm-password">Confirm Password</label>

        <input
          type="password"
          placeholder="Confirm Password"
          name="confirm-password"
          value={confirmPassword}
          style={{ border: determineBorder() }}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p>
          {confirmPassword && password !== confirmPassword
            ? "Passwords dont match"
            : ""}
        </p>
        <div className="submit-cont">
          <button type="submit">Sign Up</button>
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
        Already have an account?<Link to={"/sign-in"}>Sign in</Link>
      </p>
    </div>
  );
};

export default SignUp;
