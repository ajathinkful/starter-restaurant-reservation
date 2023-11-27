// api.js
/**
 * Defines the base URL for the API.
 * The default values are overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time"; // Import formatReservationTime

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

    // Use formatReservationTime here
    return formatReservationTime(payload.data);
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */
export async function listReservations(date, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("date", date);

  return await fetchJson(url, { headers, signal }).then(formatReservationDate);
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
export async function createReservation(reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(reservation),
  };

  return await fetchJson(url, { ...options, signal }).then(
    formatReservationDate
  );
}
