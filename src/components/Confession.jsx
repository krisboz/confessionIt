import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { judge, updateUserData, auth } from "../firebase";
import { Link } from "react-router-dom";
import useUserStore from "../zustand/userStore";
import calcPostTime from "../helpers/calcPostTime";
import PostJudgment from "./PostJudgment";
import "../styles/Confession.scss";
import { FaComment } from "react-icons/fa";

const Confession = ({ data }) => {
  const [tempApproval, setTempApproval] = useState(false);
  const [tempCondemnation, setTempCondemnation] = useState(false);
  const id = data.id;
  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const currentUser = auth.currentUser;

  const goToPost = (event) => {
    if (
      event.target.closest(".calls-to-action") === null &&
      event.target.tagName !== "A"
    ) {
      navigate(`/posts/${id}`);
    }
  };

  const handleJudge = (event) => {
    //judge = async (postId, judgeType, value)
    if (!user) {
      window.alert("You need to be signed in to judge");
      return;
    }
    //approved or condemned
    const judgeType = event.target.closest("button").id;

    if (judgeType === "approved") {
      if (user.condemned.includes(id)) {
        judge(id, "condemned", -1);
        updateUserData(currentUser.uid, id, "condemned", null);
      }
      if (user.approved.includes(id)) {
        judge(id, "approved", -1);
        updateUserData(currentUser.uid, id, "approved", null);
      } else {
        judge(id, "approved", 1);
        updateUserData(currentUser.uid, id, "approved", null);
        setTempApproval(true);
      }
    } else if (judgeType === "condemned") {
      if (user.approved.includes(id)) {
        judge(id, "approved", -1);
        updateUserData(currentUser.uid, id, "approved", null);
      }

      if (user.condemned.includes(id)) {
        judge(id, "condemned", -1);
        updateUserData(currentUser.uid, id, "condemned", null);
      } else {
        judge(id, "condemned", 1);
        updateUserData(currentUser.uid, id, "condemned", null);
        setTempCondemnation(true);
      }
    }
  };

  const determineApproveBtnClass = () => {
    if (user === null) {
      return "approve-button";
    } else if (tempApproval) {
      return "approve-button clicked";
    } else if (user.approved.includes(id)) {
      return "approve-button clicked";
    } else return "approve-button";
  };

  const determineCondemnBtnClass = () => {
    if (user === null) {
      return "condemn-button";
    } else if (tempCondemnation) {
      return "condemn-button clicked";
    } else if (user.condemned.includes(id)) {
      return "condemn-button clicked";
    } else return "condemn-button";
  };

  const returnTextContent = (str) => {
    if (str.length > 250) {
      return `${str.slice(0, 250)}...`;
    } else return str;
  };

  const getJudgeData = () => {
    return {
      approved: data.approved,
      condemned: data.condemned,
      id,
    };
  };

  return (
    <div className="confession-container" id={data.id} onClick={goToPost}>
      <div className="main">
        <div className="info">
          <p className="post-time">{calcPostTime(data.date)}</p>
          <Link to={`/user/${data.author}`} className="author">
            {data.author}
          </Link>
        </div>
        <div className="content">
          <p className="title">{data.title}</p>
          <p className="text"> {returnTextContent(data.text)}</p>
        </div>
      </div>
      <div className="calls-to-action">
        <PostJudgment judgeData={getJudgeData()} />

        <div className="btn-container comments">
          <div></div>
          <button name="comments-btn">
            <FaComment />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confession;
