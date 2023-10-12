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
  const id = data.id;
  const navigate = useNavigate();

  const goToPost = (event) => {
    if (
      event.target.closest(".calls-to-action") === null &&
      event.target.tagName !== "A"
    ) {
      navigate(`/posts/${id}`);
    }
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
