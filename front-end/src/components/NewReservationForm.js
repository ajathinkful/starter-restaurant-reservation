import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { isTuesday } from "../utils/date-time";

function NewReservationForm() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });
  const [formError, setFormError] = useState(null);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  // Add console logs to check the values
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Add a check for Tuesday here using the updated helper function
    const selectedDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00.000Z`
    );
    if (isTuesday(selectedDate)) {
      setFormError(
        "Reservations cannot be made on Tuesdays. Please choose a different date."
      );
      return;
    }

    try {
      await createReservation(formData);
      // Assuming createReservation redirects on success, else you can do it manually
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={formError} />

      <label htmlFor="first_name">First Name:</label>
      <input
        type="text"
        id="first_name"
        name="first_name"
        onChange={handleChange}
        value={formData.first_name}
        required
      />

      <label htmlFor="last_name">Last Name:</label>
      <input
        type="text"
        id="last_name"
        name="last_name"
        onChange={handleChange}
        value={formData.last_name}
        required
      />

      <label htmlFor="mobile_number">Mobile Number:</label>
      <input
        type="text"
        id="mobile_number"
        name="mobile_number"
        onChange={handleChange}
        value={formData.mobile_number}
        required
      />

      <label htmlFor="reservation_date">Reservation Date:</label>
      <input
        type="date"
        id="reservation_date"
        name="reservation_date"
        onChange={handleChange}
        value={formData.reservation_date}
        required
      />

      <label htmlFor="reservation_time">Reservation Time:</label>
      <input
        type="time"
        id="reservation_time"
        name="reservation_time"
        onChange={handleChange}
        value={formData.reservation_time}
        required
      />

      <label htmlFor="people">Number of People:</label>
      <input
        type="number"
        id="people"
        name="people"
        onChange={handleChange}
        value={formData.people}
        required
      />

      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.push("/dashboard")}>
        Cancel
      </button>
    </form>
  );
}

export default NewReservationForm;
