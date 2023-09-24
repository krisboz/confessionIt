import React from "react";
import Logo from "../assets/icon.png";
import "../styles/LoadingAnim.scss";

const LoadingAnim = () => {
  return (
    <div className="loading-container">
      <div className="loading">
        <img className="img-el" src={Logo}></img>
      </div>
    </div>
  );
};

export default LoadingAnim;
