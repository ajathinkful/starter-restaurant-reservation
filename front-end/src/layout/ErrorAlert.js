import React from "react";

/**
 * Defines the alert message to render if the specified error is truthy.
 * @param error
 *  an instance of an object with `.message` property as a string, typically an Error instance.
 * @returns {JSX.Element}
 *  a bootstrap danger alert that contains the message string.
 */

function ErrorAlert({ error }) {
  if (!error) return null;

  return (
    <div className="alert alert-danger" role="alert">
      Error: {error}
    </div>
  );
}

export default ErrorAlert;
