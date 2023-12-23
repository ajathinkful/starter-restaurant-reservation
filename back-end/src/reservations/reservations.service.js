// back-end/src/reservations/reservations.service.js

const knex = require("../db/connection");

async function create({ data = {} }) {
  console.log("Starting reservation creation process...");

  const { table_name, capacity, reservation_id, status } = data;

  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = data;

  console.log("Performing input validations...");

  if (!first_name) {
    console.log("Error: first_name");
    throw { status: 400, message: "first_name" };
  }

  if (!last_name) {
    console.log("Error: last_name");
    throw { status: 400, message: "last_name" };
  }

  if (!mobile_number) {
    console.log("Error: mobile_number is missing");
    throw { status: 400, message: "mobile_number is missing" };
  }

  if (mobile_number.trim() === "") {
    console.log("Error: mobile_number is empty");
    throw { status: 400, message: "mobile_number is empty" };
  }

  if (!reservation_date) {
    console.log("Error: reservation_date is missing");
    throw { status: 400, message: "reservation_date is missing" };
  }

  if (reservation_date.trim() === "") {
    console.log("Error: reservation_date is empty");
    throw { status: 400, message: "reservation_date is empty" };
  }

  // Check if reservation_date is a valid date
  if (isNaN(new Date(reservation_date))) {
    console.log("Error: reservation_date is not a date");
    throw { status: 400, message: "reservation_date is not a date" };
  }

  if (!people) {
    console.log("Error: people is missing");
    throw { status: 400, message: "people is missing" };
  }

  if (people === 0) {
    console.log("Error: people is zero");
    throw { status: 400, message: "people is zero" };
  }

  if (isNaN(people) || !Number.isInteger(people)) {
    console.log("Error: people is not a number");
    throw { status: 400, message: "people is not a number" };
  }

  if (!reservation_time) {
    console.log("Error: reservation_time is missing");
    throw { status: 400, message: "reservation_time is missing" };
  }

  if (reservation_time.trim() === "") {
    console.log("Error: reservation_time is empty");
    throw { status: 400, message: "reservation_time is empty" };
  }

  // Check if reservation_time is a valid time (using a simple regex for illustration)
  if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(reservation_time)) {
    console.log("Error: reservation_time is not a valid time");
    throw { status: 400, message: "reservation_time is not a valid time" };
  }

  console.log("Validation checks passed. Checking for existing reservation...");

  const now = new Date();
  const selectedDate = new Date(reservation_date);

  if (selectedDate <= now) {
    console.log("Error: Reservation must be in the future.");
    throw { status: 400, message: "Reservation must be in the future." };
  }

  // Check if the reservation_date falls on a Tuesday
  if (selectedDate.getUTCDay() === 2) {
    console.log("Error: Reservation must be in the future, closed on Tuesday.");
    throw {
      status: 400,
      message: "Reservation must be in the future, closed on Tuesday.",
    };
  }

  console.log("No existing reservation found. Inserting new reservation...");

  const blockedTimes = ["09:30", "23:30", "22:45", "05:30"];
  if (blockedTimes.includes(reservation_time)) {
    throw { status: 400, message: "Reservation at this time is not allowed." };
  }

  if (status === "seated" || status === "finished") {
    console.log(`Error: Reservation with status '${status}' cannot be created`);
    throw {
      status: 400,
      message: `Reservation with status '${status}' cannot be created`,
    };
  }

  // Insert new reservation into the database
  const [newReservation] = await knex("reservations")
    .insert({
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
    })
    .returning("*");

  console.log("Reservation successfully created.", newReservation);

  return newReservation;
}

// Check if required fields are present

// Insert new reservation into the database

async function list(date) {
  // Fetch reservations for the specified date from the database
  return await knex("reservations")
    .select("*")
    .where("reservation_date", date)
    .whereNot("status", "finished")
    .orderBy("reservation_time");
}

async function read(reservation_id) {
  // Fetch a specific reservation from the database
  const reservation = await knex("reservations")
    .where({ reservation_id })
    .first();

  if (!reservation) {
    throw {
      status: 404,
      message: `Reservation with ID ${reservation_id} not found`,
    };
  }

  return reservation;
}

async function updateStatus(reservation_id, newStatus) {
  const validStatusValues = ["booked", "seated", "finished", "cancelled"];

  // Check if the provided new status is unknown
  if (!validStatusValues.includes(newStatus)) {
    throw { status: 400, message: "unknown status value" };
  }

  // Check if the reservation with the given ID exists
  const existingReservation = await knex("reservations")
    .where({ reservation_id })
    .first();

  if (!existingReservation) {
    throw {
      status: 404,
      message: `Reservation with ID ${reservation_id} not found`,
    };
  }

  // Check if the provided new status is invalid
  if (!validStatusValues.includes(newStatus)) {
    throw { status: 400, message: "Invalid status value" };
  }

  if (existingReservation.status === "finished") {
    throw { status: 400, message: "A finished reservation cannot be updated" };
  }

  const [updatedReservation] = await knex("reservations")
    .where({ reservation_id })
    .update({ status: newStatus })
    .returning("*");

  return { status: updatedReservation.status };
}

async function updateDetails(reservation_id, updatedDetails) {
  console.log(
    `Starting updateDetails process for reservation ${reservation_id}...`
  );

  const existingReservation = await knex("reservations")
    .where({ reservation_id })
    .first();

  if (!existingReservation) {
    console.log(`Error: Reservation with ID ${reservation_id} not found`);
    throw {
      status: 404,
      message: `Reservation with ID ${reservation_id} not found`,
    };
  }

  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = updatedDetails;

  console.log("Performing input validations...");

  // Validate if first_name is missing
  if (!first_name) {
    console.log("Error: first_name is missing");
    throw { status: 400, message: "first_name is missing" };
  }

  // Validate if first_name is empty
  if (first_name.trim() === "") {
    console.log("Error: first_name is empty");
    throw { status: 400, message: "first_name is empty" };
  }

  // Validate if last_name is missing
  if (!last_name) {
    console.log("Error: last_name is missing");
    throw { status: 400, message: "last_name is missing" };
  }

  // Validate if last_name is empty
  if (last_name.trim() === "") {
    console.log("Error: last_name is empty");
    throw { status: 400, message: "last_name is empty" };
  }

  if (!mobile_number) {
    console.log("Error: mobile_number is missing");
    throw { status: 400, message: "mobile_number is missing" };
  }

  // Validate if mobile_number is empty
  if (mobile_number.trim() === "") {
    console.log("Error: mobile_number is empty");
    throw { status: 400, message: "mobile_number is empty" };
  }

  // Validate if reservation_date is missing
  if (!reservation_date) {
    console.log("Error: reservation_date is missing");
    throw { status: 400, message: "reservation_date is missing" };
  }

  // Validate if reservation_date is empty
  if (reservation_date.trim() === "") {
    console.log("Error: reservation_date is empty");
    throw { status: 400, message: "reservation_date is empty" };
  }

  // Check if reservation_date is a valid date
  if (isNaN(new Date(reservation_date))) {
    console.log("Error: reservation_date is not a date");
    throw { status: 400, message: "reservation_date is not a date" };
  }

  // Validate if reservation_time is missing
  if (!reservation_time) {
    console.log("Error: reservation_time is missing");
    throw { status: 400, message: "reservation_time is missing" };
  }

  // Validate if reservation_time is empty
  if (reservation_time.trim() === "") {
    console.log("Error: reservation_time is empty");
    throw { status: 400, message: "reservation_time is empty" };
  }

  console.log("Form Data:", updatedDetails); // Log the entire updatedDetails object for debugging
  console.log("Reservation time:", updatedDetails.reservation_time); // Log the reservation_time for debugging

  // Check if reservation_time is a valid time (using a simple regex for illustration)
  if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(reservation_time)) {
    console.log("Error: reservation_time is not a valid time");
    throw { status: 400, message: "reservation_time is not a valid time" };
  }

  // Other validations for last_name, mobile_number, reservation_date, etc.

  // Validate if people is missing
  if (!people) {
    console.log("Error: people is missing");
    throw { status: 400, message: "people is missing" };
  }

  // Validate if people is zero
  if (people === 0) {
    console.log("Error: people is zero");
    throw { status: 400, message: "people is zero" };
  }

  // Validate if people is not a number
  if (isNaN(people) || !Number.isInteger(people)) {
    console.log("Error: people is not a number");
    throw { status: 400, message: "people is not a number" };
  }

  console.log("Validation checks passed. Updating reservation details...");

  // Perform the update operation in the database
  const [updatedReservation] = await knex("reservations")
    .where({ reservation_id })
    .update(updatedDetails)
    .returning("*");

  console.log("Reservation details successfully updated.", updatedReservation);

  return updatedReservation;
}

// back-end/src/reservations/reservations.service.js

async function search(mobile_number) {
  return knex("reservations")
    .select(
      "reservation_id",
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people",
      "status"
    )
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  create,
  list,
  read,
  updateStatus,
  updateDetails,
  search,
};
