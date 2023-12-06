import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listTables, seatReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    // Fetch available tables
    listTables()
      .then((tableList) => {
        // Filter tables to get only available ones
        const availableTables = tableList.filter(
          (table) => !table.reservation_id
        );
        setTables(availableTables);
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
        setFormError("Error fetching available tables.");
      });
  }, [reservation_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!selectedTable) {
        setFormError("Please select a table.");
        return;
      }

      // Send a request to seat the reservation at the selected table
      await seatReservation(selectedTable, { data: { reservation_id } });

      // Redirect to the dashboard after successful submission
      history.push("/dashboard");
    } catch (error) {
      console.error("Error seating reservation:", error);
      setFormError("Error seating reservation.");
    }
  };

  return (
    <div>
      <h2>Seat Reservation</h2>
      <form onSubmit={handleSubmit}>
        <ErrorAlert error={formError} />
        <label htmlFor="table_id">Select a Table:</label>
        <select
          id="table_id"
          name="table_id"
          onChange={(e) => setSelectedTable(e.target.value)}
          value={selectedTable}
          required
        >
          <option value="" disabled>
            -- Select a Table --
          </option>
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {`${table.table_name} - ${table.capacity}`}
            </option>
          ))}
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SeatReservation;
