import useUserStore from "../zustand/userStore";
import useErrorStore from "../zustand/errorStore";
import { useParams, Link } from "react-router-dom";
import {
  fetchPost,
  auth,
  updateUserData,
  addComment,
  fetchComments,
} from "../firebase";
import PostJudgment from "../components/PostJudgment";
import LoadingAnim from "../components/LoadingAnim";
import Comment from "../components/Comment";
import { FaReply } from "react-icons/fa";
import "../styles/ExpandedConfession.scss";

import { useEffect, useState } from "react";
import calcPostTime from "../helpers/calcPostTime";

const ExpandedConfession = () => {
  const { user, getUser } = useUserStore();
  const { setError } = useErrorStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await getUser(user.uid);
      } else {
        getUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  let { id } = useParams();

  const currentUser = auth.currentUser;

  const [data, setData] = useState({});
  const [replyText, setReplyText] = useState("");
  const [postTime, setPostTime] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState(null);
  //Optimistically rendered elements
  const [tempComment, setTempComment] = useState(false);

  useEffect(() => {
    const fetchPostById = async () => {
      try {
        const confession = await fetchPost(id);
        const comments = await fetchComments(id);
        setData(confession);
        const postTime = calcPostTime(confession.date);
        setPostTime(postTime);
        setComments(comments);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPostById();
  }, [id]);

  const checkComments = () => {
    if (comments) {
      return (
        <div className="comments-container">
          {comments.map((comment) => (
            <Comment comment={comment} key={Math.random() * 100000} />
          ))}
        </div>
      );
    } else return <div>Loading</div>;
  };

  const handleReplyText = (event) => {
    setReplyText(event.target.value);
  };

  const handleShowForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  const handleCommentPost = async (event) => {
    event.preventDefault();
    if (user) {
      if (replyText) {
        const comment = {
          author: user.username,
          text: replyText,
          upvotes: 0,
          downvotes: 0,
          voteScore: 0,
        };
        try {
          const newCommentId = await addComment(id, comment);
          updateUserData(currentUser.uid, newCommentId, "comments", null);
          const optimisticComment = {
            ...comment,
            id: newCommentId,
            parentId: id,
          };
          setTempComment(optimisticComment);
          setShowCommentForm(false);
        } catch (error) {
          console.log(error);
        }
      } else setError("Don't leave the comment empty :)");
    } else setError("You need to sign in to comment");
  };

  const getJudgeData = () => {
    if (data) {
      return {
        approved: data.approved,
        condemned: data.condemned,
        id,
      };
    }
  };

  const renderPage = () => {
    return (
      <div className="post-container">
        <div className="expanded-container">
          <div className="confession section">
            <div className="info-container">
              <p className="info">
                {postTime}
                <Link to={`/user/${data.author}`} className="author">
                  {data.author}
                </Link>
              </p>
            </div>

            <div className="confession-content">
              <p className="title">{data.title}</p>
              <p className="content">{data.text}</p>
            </div>
          </div>

          <div className="expanded-calls-to-action">
            {data && (
              <PostJudgment judgeData={getJudgeData()} type={"expanded"} />
            )}
            <div className="reply-container comments">
              <button id="reply-btn" onClick={handleShowForm}>
                <FaReply /> Reply
              </button>
            </div>
          </div>
        </div>
        {showCommentForm && (
          <div className="post-reply-form">
            <form onSubmit={handleCommentPost}>
              <textarea
                cols={65}
                rows={5}
                placeholder="Share your opinion..."
                onChange={handleReplyText}
                required
              ></textarea>
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
        Comments
        {tempComment && <Comment comment={tempComment} />}
        {checkComments()}
      </div>
    );
  };

  return <>{!data ? <LoadingAnim /> : renderPage()}</>;
};

export default ExpandedConfession;
