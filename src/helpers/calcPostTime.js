const calcPostTime = (postTime) => {
  const currTime = Date.now();
  const parsedPostTime = postTime.toDate();
  const msSincePost = currTime - parsedPostTime;
  const minsSincePost = Math.floor(msSincePost / 60_000);
  const hrsSincePost = Math.floor(msSincePost / 3_600_000);
  const daysSincePost = Math.floor(msSincePost / 86_400_000);

  //Using approximate values for months and years since complete
  //accuracy is not paramount
  const monthsSincePost = Math.floor(
    msSincePost / (30.44 * 24 * 60 * 60 * 1000)
  );
  const yearsSincePost = Math.floor(
    msSincePost / (365.25 * 24 * 60 * 60 * 1000)
  );

  if (hrsSincePost < 1) {
    return `${minsSincePost} m`;
  } else if (hrsSincePost > 23) {
    return `${daysSincePost} d`;
  } else if (daysSincePost > 30) {
    return `${monthsSincePost} mo`;
  } else if (monthsSincePost > 11) {
    return `${yearsSincePost} y`;
  } else return `${hrsSincePost} h`;
};

export default calcPostTime;
