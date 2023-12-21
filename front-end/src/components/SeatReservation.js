import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  getReservationPeople,
  listTables,
  seatReservation,
  isTableOccupied,
} from "../utils/api";
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
    // Fetch available tables
    listTables()
      .then((tableList) => {
        setTables(tableList);
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

      // Extract the table_id from the selectedTable object
      const tableId = selectedTable.table_id;

      // Fetch the selected table to ensure it's up-to-date
      const updatedTableList = await listTables();

      const updatedTable = updatedTableList.find(
        (table) => table.table_id === tableId
      );

      // Check if the selected table is still available
      if (!updatedTable || updatedTable.reservation_id) {
        console.error("Selected table is no longer available.");
        setFormError("Selected table is no longer available.");
        return;
      }

      // Check if the table is already occupied
      const tableOccupied = await isTableOccupied(tableId);

      if (tableOccupied) {
        console.error("Selected table is already occupied.");
        setFormError("Selected table is already occupied.");
        return;
      }

      // Fetch the number of people for the reservation
      const reservationPeople = await getReservationPeople(reservation_id);

      // Check if the reservation's people exceed the table's capacity
      if (selectedTable.capacity < reservationPeople) {
        console.error("Table capacity is insufficient for the reservation.");
        setFormError("Table capacity is insufficient for the reservation.");
        return;
      }

      // Send a request to seat the reservation at the selected table
      await seatReservation(reservation_id, tableId);

      // Redirect to the dashboard after successful submission
      history.push("/dashboard");
    } catch (error) {
      console.error("Error seating reservation:", error);
      setFormError("Error seating reservation.");
    }
  };

  const handleCancel = () => {
    // Go back to the previous page
    history.goBack();
  };

  return (
    <div>
      <h2>Seat Reservation</h2>
      <form onSubmit={handleSubmit}>
        <ErrorAlert error={formError} />
        <div>
          <label htmlFor="table_id">Select a Table:</label>
          <select
            id="table_id"
            name="table_id"
            value={selectedTable ? selectedTable.table_id : ""}
            onChange={(e) => {
              const selectedTableId = e.target.value;
              const table = tables.find((t) => t.table_id === +selectedTableId);
              setSelectedTable(table);
            }}
            required
          >
            <option value="" disabled>
              Select a table
            </option>
            {tables.map((table) => (
              <option key={table.table_id} value={table.table_id}>
                {`${table.table_name} - ${table.capacity}`}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatReservation;
