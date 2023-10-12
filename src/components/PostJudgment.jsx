import { useEffect, useState } from "react";
import useUserStore from "./../zustand/userStore";
import useErrorStore from "../zustand/errorStore";
import { updateUserData, judge, auth } from "../firebase";
import ApprovalBar from "./ApprovalBar";
import { FaAngry, FaSmile } from "react-icons/fa";
import "../styles/PostJudgment.scss";

const PostJudgment = ({ judgeData, type }) => {
  const id = judgeData.id;
  const user = useUserStore((state) => state.user);
  const { setError } = useErrorStore();
  const currentUser = auth.currentUser;

  //id, user, approved, condemned
  const [tempVote, setTempVote] = useState({
    approved: user && user.approved.includes(id) ? [id] : [],
    condemned: user && user.condemned.includes(id) ? [id] : [],
  });
  const [scoreDisplay, setScoreDisplay] = useState({
    approved: 0,
    condemned: 0,
  });

  useEffect(() => {
    setScoreDisplay({
      approved: judgeData.approved,
      condemned: judgeData.condemned,
    });
    setTempVote({
      approved: user && user.approved.includes(id) ? [id] : [],
      condemned: user && user.condemned.includes(id) ? [id] : [],
    });
  }, [judgeData]);

  const updateJudgementArrays = (judgeType) => {
    const oppositeJudgeType =
      judgeType === "approved" ? "condemned" : "approved";

    setTempVote((prev) => {
      const isInArray = prev[judgeType].includes(id);
      const isInOppositeArray = prev[oppositeJudgeType].includes(id);
      if (isInArray) {
        return {
          ...prev,
          [judgeType]: prev[judgeType].filter((c) => c !== id),
        };
      } else {
        if (isInOppositeArray) {
          return {
            ...prev,
            [judgeType]: [...prev[judgeType], id],
            [oppositeJudgeType]: prev[oppositeJudgeType].filter(
              (c) => c !== id
            ),
          };
        } else {
          return {
            ...prev,
            [judgeType]: [...prev[judgeType], id],
          };
        }
      }
    });
  };

  const returnJudgment = () => {
    if (scoreDisplay.approved === 0 && scoreDisplay.condemned === 0) {
      return "";
    } else if (scoreDisplay.approved > scoreDisplay.condemned) {
      return "Approved";
    } else if (scoreDisplay.condemned > scoreDisplay.approved) {
      return "Condemned";
    } else if (scoreDisplay.approved === scoreDisplay.condemned) {
      return "Undecided";
    } else return "";
  };

  const handleJudge = async (judgeType) => {
    const oppositeJudgeType =
      judgeType === "approved" ? "condemned" : "approved";

    if (!user) {
      setError("You need to be logged in to vote");
      return;
    } else {
      updateJudgementArrays(judgeType);
      if (tempVote[judgeType].includes(id)) {
        setScoreDisplay((prev) => ({
          ...prev,
          [judgeType]: prev[judgeType] - 1,
        }));
        updateUserData(currentUser.uid, id, judgeType, null);
        judge(id, judgeType, -1);
      } else if (tempVote[oppositeJudgeType].includes(id)) {
        setScoreDisplay((prev) => ({
          ...prev,
          [oppositeJudgeType]: prev[oppositeJudgeType] - 1,
          [judgeType]: prev[judgeType] + 1,
        }));
        updateUserData(currentUser.uid, id, judgeType, oppositeJudgeType);
        judge(id, judgeType, 1);
        judge(id, oppositeJudgeType, -1);
      } else {
        setScoreDisplay((prev) => ({
          ...prev,
          [judgeType]: prev[judgeType] + 1,
        }));
        updateUserData(currentUser.uid, id, judgeType);
        judge(id, judgeType, 1);
      }
    }
  };

  return (
    <div className="judgment-container">
      <p className="approved-display">{scoreDisplay.approved}</p>

      <button
        id="approved"
        name="approve-btn"
        className={
          tempVote.approved.includes(id)
            ? "approve-button clicked"
            : "approve-button"
        }
        onClick={() => handleJudge("approved")}
      >
        <FaSmile />
      </button>

      {type === "expanded" ? (
        <>
          {" "}
          <p className="judgment">{returnJudgment()}</p>
          <ApprovalBar
            approved={scoreDisplay.approved}
            condemned={scoreDisplay.condemned}
          />
        </>
      ) : null}

      <p className="condemned-display">{scoreDisplay.condemned}</p>

      <button
        id="condemned"
        name="condemn-btn"
        className={
          tempVote.condemned.includes(id)
            ? "condemn-button clicked"
            : "condemn-button"
        }
        onClick={() => handleJudge("condemned")}
      >
        <FaAngry />
      </button>
    </div>
  );
};

export default PostJudgment;
