import React from "react";
import { useHistory } from "react-router-dom";

function NewTableForm() {
  const history = useHistory();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add logic to handle form submission here
    console.log("Form submitted!");

    // After form submission, navigate to the dashboard
    history.push("/dashboard");
  };

  const handleCancel = () => {
    // When the "Cancel" button is clicked, go back to the previous page
    history.goBack();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="table_name">Table Name:</label>
      <input
        type="text"
        id="table_name"
        name="table_name"
        minLength="2"
        required
      />

      <label htmlFor="capacity">Capacity:</label>
      <input type="number" id="capacity" name="capacity" min="1" required />

      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
}

export default NewTableForm;
