import "../styles/ApprovalBar.scss";
import calcApproval from "../helpers/calcApproval";

const ApprovalBar = ({ approved, condemned }) => {
  const approval = calcApproval(approved, condemned);

  const calcPercentage = () => {
    if (approved === 0 && condemned === 0) {
      return "undecided";
    } else {
      if (approval > 50) {
        return `Approved ${approval}%`;
      } else if (approval < 50) {
        return `Condemned ${approval}%`;
      }
    }
  };

  return (
    <div className="approval">
      <div
        style={{
          background: `linear-gradient(90deg, rgb(87, 205, 87) ${
            approval - 10
          }%, rgb(237, 82, 82) ${approval + 10}%)`,
          width: `${approved > 0 || condemned > 0 ? "8rem" : "0rem"}`,
        }}
      >
        <span className="tooltip-text"> {calcPercentage()}</span>
      </div>
    </div>
  );
};

export default ApprovalBar;
