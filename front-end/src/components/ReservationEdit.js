// ReservationEdit.js
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

    const fetchReservation = async () => {
      try {
        const reservation = await readReservation(
          reservation_id,
          abortController.signal
        );

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
      } catch (error) {
        setFormError(error);
      }
    };

    fetchReservation();

    return () => abortController.abort();
  }, [reservation_id]);

  const handleChange = ({ target }) => {
    // Extract hours and minutes from the time input
    const formattedTime =
      target.name === "reservation_time"
        ? target.value.slice(0, 5)
        : target.value;

    console.log("Formatted Time:", formattedTime);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [target.name]: formattedTime,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation logic similar to the NewReservationForm component
    const selectedDateTime = `${formData.reservation_date}T${formData.reservation_time}:00.000Z`;
    const selectedDate = new Date(selectedDateTime);

    // Check if the selected date is a Tuesday
    if (isTuesday(selectedDate)) {
      setFormError(
        "Reservations cannot be made on Tuesdays. Please choose a different date."
      );
      return;
    }

    // Check if the selected date is in the past
    const now = new Date(); // Current date and time
    if (selectedDate < now) {
      setFormError(
        "Past reservations are not allowed. Please choose a future date."
      );
      return;
    }

    // Set opening time to 10:30 AM and closing time to 9:30 PM in the client's local time zone
    const openingTime = new Date(selectedDate);
    openingTime.setHours(10, 30, 0, 0);

    const closingTime = new Date(selectedDate);
    closingTime.setHours(21, 30, 0, 0);

    const selectedTime = new Date(selectedDate);

    // Check if the selected time is outside the allowed range
    const isTimeBeforeOpening = selectedTime < openingTime;
    const isTimeAfterClosing = selectedTime > closingTime;

    if (isTimeBeforeOpening || isTimeAfterClosing) {
      setFormError(
        "Reservations are only allowed between 10:30 AM and 9:30 PM. Please choose a different time."
      );
      return;
    }
    try {
      const reservation = await readReservation(reservation_id);

      // Check if the reservation status is "booked"
      if (reservation.status !== "booked") {
        setFormError(
          "Reservations with a status other than 'booked' cannot be edited."
        );
        return;
      }

      // Check if the reservation time is being changed
      // Check if the reservation time is being changed
      // Check if the reservation time is being changed
      const isTimeChanged =
        reservation.reservation_time !== formData.reservation_time;

      // Proceed with the update only if the status is "booked" and the time is changed
      if (isTimeChanged) {
        // Combine the selected date and time for accurate comparison
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(formData.reservation_time.split(":")[0]);
        selectedDateTime.setMinutes(formData.reservation_time.split(":")[1]);

        // Check if the reservation time is too close to closing time (within 60 minutes)
        const timeBeforeClosing = new Date(closingTime);
        timeBeforeClosing.setMinutes(timeBeforeClosing.getMinutes() - 60); // Set time 60 minutes before closing

        // Check if the selected time is within the closing time and after the opening time
        if (
          selectedDateTime >= openingTime &&
          selectedDateTime <= closingTime
        ) {
          // Check if the selected time is too close to closing time (within 60 minutes)
          if (selectedDateTime <= timeBeforeClosing) {
            setFormError(
              "Reservations cannot be made within 60 minutes of closing time. Please choose a later time."
            );
            return;
          }
        } else {
          // Handle the case where the selected time is outside the allowed range (9:30 PM - 10:29 AM)
          setFormError(
            "Reservations are only allowed between 10:30 AM and 9:30 PM. Please choose a different time."
          );
          return;
        }
      }

      // Log to check if the updateReservation function is called
      console.log("Updating reservation...");

      // Proceed with the update
      await updateReservation(reservation_id, formData);

      // Redirect to the reservation details page
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
