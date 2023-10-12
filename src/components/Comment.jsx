import { useState, useEffect } from "react";
import useUserStore from "../zustand/userStore";
import useErrorStore from "../zustand/errorStore";
import { addReply, fetchReplies } from "../firebase";
import { Link } from "react-router-dom";
import calcPostTime from "../helpers/calcPostTime";
import CommentCTA from "./CommentCTA";
import { FaReply } from "react-icons/fa";
import "../styles/Comment.scss";

const Comment = ({ comment }) => {
  const user = useUserStore((state) => state.user);
  const { setError } = useErrorStore();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [tempReply, setTempReply] = useState(null);
  const [showReplies, setShowReplies] = useState(false);

  //update tempUpvote and tempDownvote
  // whenever the comment prop changes.
  useEffect(() => {
    const getReplies = async () => {
      const parentId = comment.id;
      try {
        const replies = await fetchReplies(parentId);
        setReplies(replies);
      } catch (error) {
        console.log(error);
      }
    };
    getReplies();
  }, []);

  const toggleShowReplies = (event) => {
    const parentId = event.target.closest(".comment").id;
    setShowReplies(!showReplies);
    setTempReply(null);
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleReplyText = (event) => {
    setReplyText(event.target.value);
  };

  const handleSubmitReply = async (event) => {
    event.preventDefault();
    const parentId = comment.id;

    if (user) {
      const reply = {
        author: user.username,
        text: replyText,
      };

      try {
        const replyId = await addReply(parentId, reply); // Assuming addReplyToComment is imported

        const optimisticReply = {
          ...reply,
          id: replyId,
          upvotes: 0,
          downvotes: 0,
          voteScore: 0,
        };
        setTempReply(optimisticReply);
        setShowReplyForm(false);
        setShowReplies(true);
      } catch (error) {
        console.log(error.message);
      }
    } else setError("You need to be logged in to comment");
  };

  const getDataForCTA = () => {
    //commObj ->  score, id, uid
    if (comment) {
      const score = comment.voteScore;
      const id = comment.id;
      const parentId = comment.parentId;

      return { score, id, parentId };
    }
  };

  return (
    <div className="comment" id={comment.id}>
      <div className="info">
        <p>{comment.date ? calcPostTime(comment.date) : "now"}</p>
        <Link to={`/user/${comment.author}`} className="author">
          {comment.author}
        </Link>
      </div>
      <div className="text">
        <p>{comment.text}</p>
      </div>
      <div className="vote">
        <CommentCTA commentObject={getDataForCTA()} />
        <button onClick={toggleReplyForm}>
          <FaReply />
          Reply
        </button>
      </div>
      <div className="replies">
        {replies && replies.length > 0 && (
          <button className="show-reply-btn" onClick={toggleShowReplies}>
            {`${showReplies ? "Hide" : "Show"}`} replies
          </button>
        )}
      </div>
      {showReplyForm && (
        <div className="reply-form-container">
          <form onSubmit={handleSubmitReply}>
            <textarea onChange={handleReplyText} required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      <div className="rendered-replies">
        {showReplies && (
          <ul style={{ listStyleType: "none", marginLeft: "0rem" }}>
            {tempReply && showReplies ? <Comment comment={tempReply} /> : null}
            {replies &&
              replies.map((reply, index) => (
                <li key={index} style={{ margin: "0 0 0.3rem 0" }}>
                  <Comment comment={reply} />
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Comment;
