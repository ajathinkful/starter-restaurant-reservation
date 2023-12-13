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

  function handleFinishConfirmation(tableId) {
    const isTableReady = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );

    if (isTableReady) {
      // 1. Send a DELETE request to /tables/:table_id/seat
      fetch(`http://localhost:5001/tables/${tableId}/seat`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Table ${tableId} has been successfully finished.`);
            // 2. Refresh the List of Tables
            return fetch(`http://localhost:5001/tables`); // or a specific table endpoint
          } else {
            console.error(
              `Error finishing table ${tableId}: ${response.statusText}`
            );
            throw new Error("Failed to finish the table.");
          }
        })
        .then((updatedTablesResponse) => updatedTablesResponse.json())
        .then((updatedTables) => {
          setTables(updatedTables.data); // Update the state with the new list of tables
        })
        .catch((error) => {
          console.error("An error occurred while finishing the table:", error);
        });
    }
  }

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
                <span data-table-id-status={table.table_id}>
                  Occupied{" "}
                  <button
                    data-table-id-finish={table.table_id}
                    onClick={() => handleFinishConfirmation(table.table_id)}
                  >
                    Finish
                  </button>
                </span>
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
