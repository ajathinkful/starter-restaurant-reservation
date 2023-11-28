// Dashboard.js
import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import useQuery from "../utils/useQuery";
import { formatAsDate, previous, today, next } from "../utils/date-time";

function Dashboard() {
  const query = useQuery();
  const queryDate = query.get("date");
  const [date, setDate] = useState(queryDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations(date, abortController.signal)
      .then((reservations) => {
        console.log("Reservations:", reservations);
        setReservations(reservations);
      })
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const handleDateChange = (action) => {
    let newDate;

    // Calculate the new date based on the action (previous, today, next)
    if (action === "previous") {
      newDate = previous(date);
    } else if (action === "today") {
      newDate = today();
    } else if (action === "next") {
      newDate = next(date);
    }

    // Update the date in the URL
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("date", newDate);
    window.history.replaceState(null, null, `?${searchParams.toString()}`);

    // Update the state with the new date
    setDate(newDate);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date {formatAsDate(date)}</h4>
        <div className="ml-auto">
          <button onClick={() => handleDateChange("previous")}>Previous</button>
          <button onClick={() => handleDateChange("today")}>Today</button>
          <button onClick={() => handleDateChange("next")}>Next</button>
        </div>
      </div>
      <ErrorAlert error={reservationsError} />
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.reservation_id}>
            {`${reservation.first_name} ${
              reservation.last_name
            } - Date: ${formatAsDate(reservation.reservation_date)}, Time: ${
              reservation.reservation_time
            }, Phone: ${reservation.mobile_number}`}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Dashboard;
