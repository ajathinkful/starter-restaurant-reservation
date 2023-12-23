// Dashboard.js
import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import useQuery from "../utils/useQuery";
import {
  formatAsDate,
  formatAsTime,
  previous,
  today,
  next,
} from "../utils/date-time";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

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
    try {
      listReservations(date, abortController.signal, API_BASE_URL)
        .then((reservations) => {
          console.log("Reservations:", reservations);
          setReservations(reservations);
        })
        .catch((error) => {
          console.error("Error fetching tables:", error);
          setReservationsError("clicking too fast");
        });

      listTables()
        .then((tables) => {
          setTables(tables);
        })
        .catch((error) => {
          console.error("Error fetching tables:", error);
          setDashboardError(error);
        });
    } catch (error) {
      console.error("An error occurred while loading the dashboard:", error);
    }

    // Return a cleanup function to cancel the request on unmount or dependency change
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

  async function handleSeatClick(reservationId) {
    try {
      // Retain the existing functionality to navigate to the seat page
      history.push(`/reservations/${reservationId}/seat`);
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
    }
  }

  function handleFinishConfirmation(tableId, reservationId) {
    console.log("Start of handleFinishConfirmation");
    const isTableReady = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );

    if (isTableReady) {
      // 1. Send a DELETE request to /tables/:table_id/seat
      fetch(`${API_BASE_URL}/tables/${tableId}/seat`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Table ${tableId} has been successfully finished.`);
            // 2. Update the corresponding reservation status to "finished"
            return fetch(
              `${API_BASE_URL}/reservations/${reservationId}/status`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  data: {
                    status: "finished",
                  },
                }),
              }
            );
          } else {
            console.error(
              `Error finishing table ${tableId}: ${response.statusText}`
            );
            throw new Error("Failed to finish the table.");
          }
        })
        .then(() => {
          // 3. Refresh the page
          window.location.reload();

          console.log("End of handleFinishConfirmation");
        })
        .catch((error) => {
          console.error("An error occurred while finishing the table:", error);
        });
    }
  }

  const handleCancelConfirmation = (reservationId) => {
    const confirmCancel = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );

    if (confirmCancel) {
      // Send a PUT request to update reservation status to "cancelled"
      fetch(`${API_BASE_URL}/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            status: "cancelled",
          },
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log(
              `Reservation ${reservationId} has been successfully cancelled.`
            );
            // Refresh the dashboard after updating the status
            loadDashboard();
          } else {
            console.error(
              `Error cancelling reservation ${reservationId}: ${response.statusText}`
            );
            return response.json(); // Add this line to parse and log the response body
          }
        })
        .then((errorData) => {
          console.log("Error response data:", errorData);
          throw new Error("Failed to cancel the reservation.");
        })
        .catch((error) => {
          console.error(
            "An error occurred while cancelling the reservation:",
            error
          );
        });
    }
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
        {reservations
          .filter(
            (reservation) =>
              reservation.status === "booked" || reservation.status === "seated"
          )
          .map((reservation) => (
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
                <label>Time of reservation:</label>{" "}
                {formatAsTime(reservation.reservation_time)}
              </div>
              <div>
                <label>Number of people in the party:</label>{" "}
                {reservation.people || "N/A"}
              </div>
              <div>
                <label>Status:</label>{" "}
                <div data-reservation-id-status={reservation.reservation_id}>
                  {reservation.status || "Booked"}
                </div>
              </div>
              {reservation.status === "booked" && (
                <div>
                  <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                    <button
                      onClick={() =>
                        handleSeatClick(reservation.reservation_id)
                      }
                    >
                      Seat
                    </button>
                  </Link>
                  <Link to={`/reservations/${reservation.reservation_id}/edit`}>
                    <button>Edit</button>
                  </Link>

                  <button
                    data-reservation-id-cancel={reservation.reservation_id}
                    onClick={() =>
                      handleCancelConfirmation(reservation.reservation_id)
                    }
                  >
                    Cancel
                  </button>
                </div>
              )}
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
                    onClick={() =>
                      handleFinishConfirmation(
                        table.table_id,
                        table.reservation_id
                      )
                    }
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
