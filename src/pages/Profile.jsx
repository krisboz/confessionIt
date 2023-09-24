import { useState, useEffect } from "react";
import useUserStore from "../zustand/userStore";
import {
  fetchUserByUsername,
  fetchPostsByIds,
  fetchCommentsByIds,
} from "../firebase";
import { useParams } from "react-router-dom";
import Confession from "../components/Confession";
import Comment from "../components/Comment";
import LoadingAnim from "../components/LoadingAnim";
import "../styles/Profile.scss";

const Profile = () => {
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState(null);
  const [approved, setApproved] = useState([]);
  const [condemned, setCondemned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Posts");

  let { username } = useParams();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserByUsername(username);
        console.log(userData);
        setData(userData);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (data) {
      setLoading(true);
      if (tab === "Posts") {
        const postIds = data.posts;
        fetchPostsByIds(postIds).then((postData) => {
          setPosts(postData);
          setLoading(false); // Turn off loading after fetching and setting data
        });
      } else if (tab === "Approved") {
        const approvedIds = data.approved;
        fetchPostsByIds(approvedIds).then((approvedData) => {
          setApproved(approvedData);
          setLoading(false); // Turn off loading after fetching and setting data
        });
      } else if (tab === "Comments") {
        const commentIds = data.comments;
        fetchCommentsByIds(commentIds).then((comments) => {
          setComments(comments);
          setLoading(false);
        });
      } else if (tab === "Condemned") {
        const condemnedIds = data.condemned;
        fetchPostsByIds(condemnedIds).then((condemnedData) => {
          setCondemned(condemnedData);
          setLoading(false); // Turn off loading after fetching and setting data
        });
      }
    }
  }, [tab, data, username]);

  const handleTabChange = (selectedTab) => {
    setTab(selectedTab);
  };

  const showOwnProfile = () => {
    if (user && user.username === username) {
      return (
        <>
          <li
            onClick={() => {
              handleTabChange("Approved");
            }}
            className={tab === "Approved" ? "clicked" : null}
          >
            Approved
          </li>
          <li
            onClick={() => {
              handleTabChange("Condemned");
            }}
            className={tab === "Condemned" ? "clicked" : null}
          >
            Condemned
          </li>
        </>
      );
    } else return null;
  };

  return (
    <div className="profile-container">
      <div className="navigation-menu">
        <li
          onClick={() => handleTabChange("Posts")}
          className={tab === "Posts" ? "clicked" : null}
        >
          Posts
        </li>
        <li
          onClick={() => {
            handleTabChange("Comments");
          }}
          className={tab === "Comments" ? "clicked" : null}
        >
          Comments
        </li>
        {showOwnProfile()}
      </div>
      <main>
        {data && (
          <>
            <div className="rendered-content">
              <h3>{tab}</h3>
              {loading && <LoadingAnim />}
              {tab === "Posts" && posts && posts.length === 0 && (
                <h3>Nothing to show for Posts</h3>
              )}
              {tab === "Posts" &&
                posts &&
                posts.map((post, index) => (
                  <Confession key={index} data={post} />
                ))}

              {tab === "Comments" && comments && comments.length === 0 && (
                <h3>No comments</h3>
              )}

              {tab === "Comments" &&
                comments &&
                comments.map((comment, index) => (
                  <Comment key={index} comment={comment} />
                ))}

              {tab === "Approved" && approved && approved.length === 0 && (
                <h3>No Approved Confessions</h3>
              )}
              {tab === "Approved" &&
                approved &&
                approved.map((post, index) => (
                  <Confession key={index} data={post} />
                ))}

              {tab === "Condemned" && condemned && condemned.length === 0 && (
                <h3>No Condemned Confessions</h3>
              )}
              {tab === "Condemned" &&
                condemned &&
                condemned.map((post, index) => (
                  <Confession key={index} data={post} />
                ))}
            </div>
            <div className="profile-info">
              <div className="profile-card">
                <p className="username">{data.username}</p>
                <table>
                  <tbody>
                    <tr>
                      <td>Total confessions made:</td>
                      <td>{data.posts.length}</td>
                    </tr>
                    <tr>
                      <td>Total comments shared:</td>
                      <td>{data.comments.length}</td>
                    </tr>
                    <tr>
                      <td>Total approved:</td>
                      <td>{data.approved.length}</td>
                    </tr>
                    <tr>
                      <td>Total condemned:</td>
                      <td>{data.condemned.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
