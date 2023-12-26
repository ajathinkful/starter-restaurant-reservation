import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { createReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useRouteMatch } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

function ReservationForm() {
  const history = useHistory();
  const location = useLocation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  const [formError, setFormError] = useState(null);

  const { params } = useRouteMatch("/reservations/:reservationId/edit") || {};
  const reservationId = params ? params.reservationId : null;

  useEffect(() => {
    // Check if the URL contains "/edit" to determine if it's an editing mode
    console.log("Location:", location.pathname);
    if (location.pathname.includes("/edit")) {
      console.log("Editing mode");
      const apiUrl = `${API_BASE_URL}/reservations/${reservationId}`;

      console.log("API URL:", apiUrl);

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            console.error("Error response from server:", response);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Update formData with the fetched data
          console.log("Fetched data:", data);

          // Convert the fetched date to the appropriate format
          const formattedDate = new Date(
            data.data.reservation_date
          ).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          console.log("this is formattedDate:", formattedDate);

          setFormData({
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            mobile_number: data.data.mobile_number,
            reservation_date: formattedDate,
            reservation_time: data.data.reservation_time,
            people: data.data.people,
          });
        })
        .catch((error) => {
          console.error("Error fetching reservation data:", error);
        });
    }
  }, [location.pathname]);

  const handleChange = ({ target }) => {
    let updatedValue;

    if (target.name === "reservation_time") {
      updatedValue = target.value.slice(0, 5);
    } else if (target.name === "people") {
      updatedValue = parseInt(target.value, 10);
    } else {
      updatedValue = target.value;
    }

    setFormData({
      ...formData,
      [target.name]: updatedValue,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (location.pathname.includes("/edit")) {
        // In editing mode, call updateDetails function
        const updatedReservation = await updateReservation(
          reservationId,
          formData
        );
        console.log("Reservation details updated:", updatedReservation);
      } else {
        // In create mode, call createReservation function
        const newReservation = await createReservation(formData);
        console.log("Reservation created:", newReservation);
      }

      // Redirect to the reservation details page
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleCancel = () => {
    // Navigate back to the previous page
    history.goBack();
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

      <div className="button-group">
        <button type="submit" className="submit-button">
          Submit
        </button>
        <button type="button" onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReservationForm;
