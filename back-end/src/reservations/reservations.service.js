// back-end/src/reservations/reservations.service.js

const knex = require("../db/connection");

async function create({ data }) {
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = data;

  console.log("Received Data:", data);

  if (!first_name) {
    console.log("Error: first_name");
    throw { status: 400, message: "first_name" };
  }

  if (!last_name) {
    console.log("Error: last_name");
    throw { status: 400, message: "last_name" };
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

async function list() {
  // Fetch all reservations from the database
  return await knex("reservations").select("*");
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

module.exports = {
  create,
  list,
  read,
};
