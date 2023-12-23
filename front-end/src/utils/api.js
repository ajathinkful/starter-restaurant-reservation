// api.js
/**
 * Defines the base URL for the API.
 * The default values are overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time"; // Import formatReservationTime
import { today } from "./date-time";
import { formatAsDate } from "./date-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the request.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range, the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }

    // Adjust the handling based on the new structure
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservations.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservations.
 */
export async function listReservations(date, signal) {
  const currentDate = date || today();
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("date", currentDate);

  // console.log("API Request URL:", url.toString());

  try {
    const response = await fetch(url, { headers, signal });
    const responseData = await response.json();

    // console.log("API Response Data:", responseData);

    if (!Array.isArray(responseData.data)) {
      console.error("API Response does not contain an array:", responseData);
      return []; // Return an empty array or handle it as appropriate
    }

    // Filter reservations based on the provided date

    const filteredReservations = responseData.data.filter(
      (reservation) =>
        formatAsDate(reservation.reservation_date) === currentDate
    );

    // console.log("Filtered Reservations:", filteredReservations);

    // Use formatReservationTime here
    return formatReservationTime(filteredReservations);
  } catch (error) {
    // Handle errors
    console.error(error.stack);
    throw error;
  }
}

/**
 * Creates a new reservation.
 * @param reservation
 *  an object containing reservation details:
 *    - first_name
 *    - last_name
 *    - mobile_number
 *    - reservation_date
 *    - reservation_time
 *    - people
 * @param signal
 *  an optional AbortController signal for aborting the request.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the created reservation or an error.
 *  If the response is not in the 200 - 399 range, the promise is rejected.
 */
// ... (previous code)

// ... (previous code)

/**
 * Creates a new reservation.
 * @param reservation
 *  an object containing reservation details:
 *    - first_name
 *    - last_name
 *    - mobile_number
 *    - reservation_date
 *    - reservation_time
 *    - people
 * @param signal
 *  an optional AbortController signal for aborting the request.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the created reservation or an error.
 *  If the response is not in the 200 - 399 range, the promise is rejected.
 */
export async function createReservation(reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }), // Wrap the reservation in a 'data' property
  };

  let response; // Declare response outside the try block

  try {
    // Log the data before sending
    console.log("Reservation Data Sent:", { data: reservation });

    response = await fetch(url, { ...options, signal });
    const responseData = await response.json();

    console.log("Create Reservation Response Data:", responseData);

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(responseData.error || "Failed to create reservation");
    }

    // Check if the expected 'data' property is present in the response
    if (!responseData.hasOwnProperty("data")) {
      throw new Error("Response does not contain 'data' property");
    }

    return responseData.data;
  } catch (error) {
    console.error("Error creating reservation:", error);

    // Log the entire response for inspection
    console.log("Error Response:", response);

    throw error;
  }
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables.
 */
export async function listTables() {
  const url = new URL(`${API_BASE_URL}/tables`);

  console.log("API Request URL:", url.toString());

  try {
    const response = await fetch(url, { headers });
    const responseData = await response.json();

    console.log("API Response Data (Tables):", responseData);

    if (!Array.isArray(responseData.data)) {
      console.error("API Response does not contain an array:", responseData);
      return []; // Return an empty array or handle it as appropriate
    }

    return responseData.data;
  } catch (error) {
    // Handle errors
    console.error(error.stack);
    throw error;
  }
}

// api.js
// ... (your existing code)

export async function createTable(tableData) {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: tableData }), // Wrap the tableData in a 'data' property
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(responseData.error || "Failed to create table");
    }

    if (!responseData.hasOwnProperty("data")) {
      throw new Error("Response does not contain 'data' property");
    }

    return responseData.data;
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

// api.js
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5001";

async function seatReservation(reservation_id, table_id, signal) {
  try {
    // Fetch the selected reservation to check the number of people
    const reservationResponse = await fetch(
      `${BASE_URL}/reservations/${reservation_id}`
    );
    const reservationData = await reservationResponse.json();

    if (!reservationResponse.ok) {
      throw new Error(
        `Failed to fetch reservation details. Status: ${reservationResponse.status}`
      );
    }

    const { people: reservationPeople } = reservationData;

    // Fetch the selected table to check its capacity
    const tableResponse = await fetch(`${BASE_URL}/tables/${table_id}`);
    const tableData = await tableResponse.json();

    if (!tableResponse.ok) {
      throw new Error(
        `Failed to fetch table details. Status: ${tableResponse.status}`
      );
    }

    const { capacity: tableCapacity } = tableData;

    // Check if the table capacity is less than the number of people in the reservation
    if (tableCapacity < reservationPeople) {
      // If the capacity is insufficient, return a 400 response with an error message
      throw new Error("Table capacity is insufficient for the reservation");
    }

    // If capacity is sufficient, proceed with seating the reservation
    const response = await fetch(`${BASE_URL}/tables/${table_id}/seat`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { reservation_id } }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to seat reservation. Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error seating reservation:", error);
    throw error;
  }
}

export { seatReservation };

export async function getReservationPeople(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);

  try {
    const response = await fetch(url, { headers, signal });
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch reservation details. Status: ${response.status}`
      );
    }

    return responseData.data.people;
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    throw error;
  }
}

export async function isTableOccupied(table_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}`);

  try {
    const response = await fetch(url, { headers, signal });
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch table details. Status: ${response.status}`
      );
    }

    return responseData.data.reservation_id !== null;
  } catch (error) {
    console.error("Error fetching table details:", error);
    throw error;
  }
}

export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);

  try {
    const response = await fetch(url, { headers, signal });
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch reservation details. Status: ${response.status}`
      );
    }

    return responseData.data;
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    throw error;
  }
}

export async function updateReservation(reservation_id, updatedData, signal) {
  const formattedTime = updatedData.reservation_time.slice(0, 5);

  // Create the updatedDetails object with the formatted reservation_time
  const updatedDetails = {
    ...updatedData,
    reservation_time: formattedTime,
  };
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);

  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedDetails }), // Wrap the updatedData in a 'data' property
  };

  try {
    const response = await fetch(url, { ...options, signal });
    const responseData = await response.json();

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(responseData.error || "Failed to update reservation");
    }

    return responseData.data;
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
}
