import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { isTuesday } from "../utils/date-time";

function ReservationEdit() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
    // Add more properties as needed for editing
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    readReservation(reservation_id, abortController.signal)
      .then((reservation) => {
        // Format the reservation date for input type date
        const formattedDate = reservation.reservation_date.split("T")[0];

        setFormData({
          first_name: reservation.first_name,
          last_name: reservation.last_name,
          mobile_number: reservation.mobile_number,
          reservation_date: formattedDate,
          reservation_time: reservation.reservation_time,
          people: reservation.people,
          // Set other properties as needed for editing
        });
      })
      .catch(setFormError);

    return () => abortController.abort();
  }, [reservation_id]);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation logic similar to the NewReservationForm component
    // ...

    try {
      await updateReservation(reservation_id, formData);
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
        value={formData.reservation_date || ""}
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

      {/* Add other fields similar to NewReservationForm */}

      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    </form>
  );
}

export default ReservationEdit;
