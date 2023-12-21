import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTableForm() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    table_name: "",
    capacity: "",
  });
  const [formError, setFormError] = useState(null);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.name === "capacity" ? +target.value : target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createTable(formData);
      history.push("/dashboard");
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={formError} />

      <label htmlFor="table_name">Table Name:</label>
      <input
        type="text"
        id="table_name"
        name="table_name"
        minLength="2"
        value={formData.table_name}
        onChange={handleChange}
        required
      />

      <label htmlFor="capacity">Capacity:</label>
      <input
        type="text"
        id="capacity"
        name="capacity"
        pattern="[0-9]*"
        value={formData.capacity}
        onChange={handleChange}
        required
        inputMode="numeric"
      />

      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
}

export default NewTableForm;
