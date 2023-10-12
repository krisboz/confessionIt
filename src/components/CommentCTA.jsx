import { useState } from "react";
import { addVote, updateUserData, auth } from "../firebase";
import useUserStore from "../zustand/userStore";
import useErrorStore from "../zustand/errorStore";

import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const CommentCTA = ({ commentObject }) => {
  const user = useUserStore((state) => state.user);
  const { setError } = useErrorStore();
  const score = commentObject.score;
  const id = commentObject.id;
  const parentId = commentObject.parentId;

  const [scoreToDisplay, setScoreToDisplay] = useState(score);
  const [tempVotes, setTempVotes] = useState({
    upvotes: user && user.upvotedComments.includes(id) ? [id] : [],
    downvotes: user && user.downvotedComments.includes(id) ? [id] : [],
  });
  const updateCommentArrays = (voteType, commentId) => {
    const oppositeVoteType = voteType === "up" ? "down" : "up";

    //Sets the optimistic state of voted comments
    //if it's already in the array remove it
    //if it's not add it and also if it's in the opposite array remove from opposite

    setTempVotes((prev) => {
      const isInArray = prev[`${voteType}votes`].includes(commentId);
      const isInOppositeArray =
        prev[`${oppositeVoteType}votes`].includes(commentId);

      if (isInArray) {
        return {
          ...prev,
          [`${voteType}votes`]: prev[`${voteType}votes`].filter(
            (c) => c !== commentId
          ),
        };
      } else {
        if (isInOppositeArray) {
          return {
            ...prev,
            [`${voteType}votes`]: [...prev[`${voteType}votes`], commentId],
            [`${oppositeVoteType}votes`]: prev[
              `${oppositeVoteType}votes`
            ].filter((c) => c !== commentId),
          };
        } else {
          return {
            ...prev,
            [`${voteType}votes`]: [...prev[`${voteType}votes`], commentId],
          };
        }
      }
    });
  };

  const handleVote = async (voteType) => {
    const VOTE = `${voteType}votedComments`; //up
    const OPPOSITE_VOTE =
      voteType === "up" ? "downvotedComments" : "upvotedComments"; //down

    const oppositeVoteType = voteType === "up" ? "down" : "up";

    //commObj -> user, score, id, uid
    if (!user) {
      setError("You need to be logged in to vote");
      return;
    } else if (user) {
      updateCommentArrays(voteType, id);

      const uid = auth.currentUser.uid;
      if (tempVotes[`${voteType}votes`].includes(id)) {
        setScoreToDisplay((prev) => (voteType === "up" ? prev - 1 : prev + 1));
        updateUserData(uid, id, VOTE, null);
        addVote(id, parentId, voteType === "up" ? -1 : 1);
      } else if (
        !tempVotes[`${voteType}votes`].includes(id) &&
        tempVotes[`${oppositeVoteType}votes`].includes(id)
      ) {
        setScoreToDisplay((prev) => (voteType === "up" ? prev + 2 : prev - 2));
        updateUserData(uid, id, VOTE, OPPOSITE_VOTE);
        addVote(id, parentId, voteType === "up" ? 2 : -2);
      } else if (!tempVotes[`${voteType}votes`].includes(id)) {
        setScoreToDisplay((prev) => (voteType === "up" ? prev + 1 : prev - 1));
        updateUserData(uid, id, VOTE, null);
        addVote(id, parentId, voteType === "up" ? 1 : -1);
      }
    }
  };

  return (
    <div className="actions-container">
      <button
        className={tempVotes.upvotes.includes(id) ? "clicked-good" : null}
        onClick={() => handleVote("up")}
      >
        <FaArrowUp />
      </button>{" "}
      <p>{scoreToDisplay}</p>
      <button
        className={tempVotes.downvotes.includes(id) ? "clicked-bad" : null}
        onClick={() => handleVote("down")}
      >
        <FaArrowDown />
      </button>
    </div>
  );
};

export default CommentCTA;
