import React from "react";
import "../styles/ErrorComponent.scss";
import { Link } from "react-router-dom";
import useErrorStore from "./../zustand/errorStore";
import { MdOpenInNew } from "react-icons/md";

const ErrorComponent = () => {
  const { errorMessage, clearError } = useErrorStore();

  return (
    <div className="error-component">
      <div className="error-content">{errorMessage}</div>

      <div className="btn-container">
        <button onClick={clearError}>Got it</button>
      </div>
    </div>
  );
};

export default ErrorComponent;
