// Dashboard.js
import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import useQuery from "../utils/useQuery";
import { formatAsDate, previous, today, next } from "../utils/date-time";
import { useHistory } from "react-router-dom";

function Dashboard() {
  const query = useQuery();
  const queryDate = query.get("date");
  const [date, setDate] = useState(queryDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState(null);

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

    listTables()
      .then((tables) => {
        setTables(tables);
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
        setDashboardError(error); // Update the state variable
      });
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
            <div>
              <label>First name:</label> {reservation.first_name}
            </div>
            <div>
              <label>Last name:</label> {reservation.last_name}
            </div>
            <div>
              <label>Mobile number:</label> {reservation.mobile_number}
            </div>
            <div>
              <label>Date of reservation:</label>{" "}
              {formatAsDate(reservation.reservation_date)}
            </div>
            <div>
              <label>Time of reservation:</label> {reservation.reservation_time}
            </div>
            <div>
              <label>Number of people in the party:</label>{" "}
              {reservation.people || "N/A"}
            </div>
            <button
              onClick={() =>
                history.push(`/reservations/${reservation.reservation_id}/seat`)
              }
            >
              Seat
            </button>
          </li>
        ))}
      </ul>
      <div>
        <h4>Tables</h4>
        <ul>
          {tables.map((table) => (
            <li key={table.table_id}>
              Table: {table.table_name} - Capacity: {table.capacity}{" "}
              {table.reservation_id ? (
                <span data-table-id-status={table.table_id}>Occupied</span>
              ) : (
                <span data-table-id-status={table.table_id}>Free</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default Dashboard;
