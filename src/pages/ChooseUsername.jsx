import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUsernameAvailability, submitUsername } from "../firebase";
import "../styles/ChooseUsername.scss";

const ChooseUsername = () => {
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const navigate = useNavigate();

  const handleUsernameInput = async (event) => {
    const newUsername = event.target.value;
    setUsername(newUsername);

    const isAvailable = await checkUsernameAvailability(newUsername);
    setUsernameAvailable(isAvailable);
  };

  const determineText = () => {
    //if username < 3 - nothing
    //if username available - username avilable
    //if not - username is taken

    if (username.length < 3) return null;
    else if (usernameAvailable) return "Username is available";
    else return "Username is taken";
  };

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    submitUsername(username);
    navigate("/");
  };

  return (
    <div className="username-picker-cont">
      <h2>Choose a Username</h2>
      <form onSubmit={handleUsernameSubmit}>
        <input type="text" onChange={handleUsernameInput} />
        {determineText()}
        <button>Submit</button>
      </form>
    </div>
  );
};

export default ChooseUsername;
