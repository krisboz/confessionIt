import { useEffect, useState } from "react";
import useUserStore from "../zustand/userStore";
import useErrorStore from "../zustand/errorStore";
import { updateUserData, addPost, fetchAllPosts } from "../firebase";
import { auth } from "../firebase/authentication";
import { useNavigate } from "react-router-dom";
import Confession from "../components/Confession";
import LoadingAnim from "../components/LoadingAnim";
import "../styles/Home.scss";

const Home = ({ location }) => {
  const user = useUserStore((state) => state.user);
  const { setError } = useErrorStore();

  const navigate = useNavigate();
  const [confessions, setConfessions] = useState("loading");
  const [titleInput, setTitleInput] = useState("");
  const [txtArea, setTxtArea] = useState("");
  const [postFormOpen, setPostFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await fetchAllPosts();
        setConfessions(posts);
      } catch (error) {
        console.log(error.message);
        setConfessions([]);
      }
    };
    fetchData();
  }, []);

  const handleAddPost = async (event) => {
    event.preventDefault();

    if (user) {
      console.log("USER IN THE ADD POST FUNC", user);
      const post = {
        author: user.username,
        title: titleInput,
        text: txtArea,
      };
      try {
        console.log("IN HOME.JSX", user);
        const newPostId = await addPost(post);
        const currentUser = auth.currentUser;
        updateUserData(currentUser.uid, newPostId, "posts", null);
        setPostFormOpen(false);
        navigate(`/posts/${newPostId}`);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      setError("You need to be logged in to be able to post!");
    }
  };

  const handleSetTitleInput = (event) => {
    setTitleInput(event.target.value);
  };

  const handleSetTxtArea = (event) => {
    setTxtArea(event.target.value);
  };

  const handleOpenPostForm = (event) => {
    if (user) {
      setPostFormOpen(!postFormOpen);
    } else setError("You need to be logged in to confess!");
  };

  const renderConfessions = () => {
    if (confessions === "loading") {
      return <LoadingAnim />;
    } else if (Array.isArray(confessions)) {
      if (confessions.length > 0) {
        return confessions.map((confession) => (
          <Confession key={confession.id} data={confession} />
        ));
      } else if (confessions.length === 0) {
        return <p>There are no posts, be first to confess!</p>;
      }
    }
  };

  return (
    <div className="home">
      <div className="btn-cont">
        <button className="open-post-form-btn" onClick={handleOpenPostForm}>
          Confess
        </button>
      </div>

      <div className="new-post-form">
        {postFormOpen && (
          <form onSubmit={handleAddPost}>
            <h1>Add a New Confession</h1>
            <input
              type="text"
              placeholder="Title your confession..."
              required
              onChange={handleSetTitleInput}
            />
            <textarea
              rows={10}
              cols={65}
              required
              onChange={handleSetTxtArea}
              placeholder="Tell your story"
            ></textarea>
            <div>
              <button type="submit">Submit</button>
            </div>
          </form>
        )}
      </div>
      <div className="main-content">
        <div className="section confessions">{renderConfessions()}</div>
        <div className="section"> </div>
      </div>
    </div>
  );
};
export default Home;
