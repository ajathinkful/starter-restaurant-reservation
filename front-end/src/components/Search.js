import React, { useState } from "react";
import { formatAsDate, formatAsTime } from "../utils/date-time";

function Search() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleFindClick = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/reservations/search?mobile_number=${phoneNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
        setNoResults(data.data.length === 0);
      } else {
        console.error("Error searching for phone number:", response.statusText);
      }
    } catch (error) {
      console.error("Error searching for phone number:", error.message);
    }
  };

  return (
    <div>
      <h2>Search for a Reservation by Phone Number</h2>

      <label htmlFor="mobile_number">Enter a customer's phone number:</label>
      <input
        type="text"
        id="mobile_number"
        name="mobile_number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="Enter a customer's phone number"
      />

      <button type="button" onClick={handleFindClick}>
        Find
      </button>

      {noResults && <p>No reservations found for the given phone number.</p>}

      <ul>
        {searchResults.map((reservation) => (
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
            {/* Add other reservation details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
