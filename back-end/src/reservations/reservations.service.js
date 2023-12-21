// back-end/src/reservations/reservations.service.js

const knex = require("../db/connection");

async function create({ data = {} }) {
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = data;

  const now = new Date();
  const selectedDate = new Date(reservation_date);

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

  if (selectedDate <= now) {
    throw { status: 400, message: "Reservation must be in the future." };
  }

  // Check if the reservation_date falls on a Tuesday
  if (selectedDate.getUTCDay() === 2) {
    throw {
      status: 400,
      message: "Reservation must be in the future, closed on Tuesday.",
    };
  }
  // Check if required fields are present

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

  return newReservation;
}

// Check if required fields are present

// Insert new reservation into the database

async function list(date) {
  // Fetch reservations for the specified date from the database
  return await knex("reservations")
    .select("*")
    .where("reservation_date", date)
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

  if (!validStatusValues.includes(newStatus)) {
    throw { status: 400, message: "Invalid status value" };
  }

  return await knex("reservations")
    .where({ reservation_id })
    .update({ status: newStatus })
    .returning("*");
}

async function updateDetails(reservation_id, updatedDetails) {
  return await knex("reservations")
    .where({ reservation_id })
    .update(updatedDetails)
    .returning("*");
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
