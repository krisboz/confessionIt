import React from "react";
import "../styles/ErrorComponent.scss";
import { Link } from "react-router-dom";
import useErrorStore from "./../zustand/errorStore";

const ErrorComponent = () => {
  const { errorMessage, clearError } = useErrorStore();

  return (
    <div className="error-component">
      <div className="error-content">{errorMessage}</div>

      <div className="btn-container">
        <Link to="/sign-in" onClick={clearError}>
          Sign in
        </Link>

        <button onClick={clearError}>Got it</button>
      </div>
    </div>
  );
};

export default ErrorComponent;
