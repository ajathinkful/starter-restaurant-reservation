import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listTables, seatReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [formError, setFormError] = useState(null);
  const [tableList, setTableList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    // Fetch available tables
    listTables()
      .then((tableList) => {
        // Filter tables to get only available ones
        const availableTables = tableList.filter(
          (table) => !table.reservation_id
        );
        setTables(availableTables);
        setTableList(tableList);
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
        setFormError("Error fetching available tables.");
      });
  }, [reservation_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("Selected Table:", selectedTable);
      if (!selectedTable || !selectedTable.table_id) {
        console.error("Please select a table.");
        setFormError("Please select a table.");
        return;
      }

      console.log("Before seatReservation");

      // Extract the table_id from the selectedTable object
      const tableId = selectedTable.table_id;

      console.log("Table ID:", tableId);

      // Send a request to seat the reservation at the selected table
      await seatReservation(reservation_id, tableId);

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
        <div>
          <label htmlFor="table_id">Select a Table:</label>
          <ul>
            {tables.map((table) => (
              <li key={table.table_id}>
                <label>
                  <input
                    type="radio"
                    name="table_id"
                    value={table.table_id}
                    checked={selectedTable?.table_id === table.table_id}
                    onChange={() => setSelectedTable(table)}
                    required
                  />
                  {`${table.table_name} - ${table.capacity}`}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SeatReservation;
