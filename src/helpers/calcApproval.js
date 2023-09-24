const calcApproval = (approved, condemned) => {
  const approvalPercent = Math.round((approved / (approved + condemned)) * 100);

  return approvalPercent;
};

export default calcApproval;
