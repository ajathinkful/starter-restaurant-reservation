// back-end/src/reservations/reservations.service.js

const knex = require("../db/connection");

async function create(newReservationData) {
  // Insert new reservation into the database
  const [newReservation] = await knex("reservations")
    .insert({
      first_name: newReservationData.first_name,
      last_name: newReservationData.last_name,
      mobile_number: newReservationData.mobile_number,
      reservation_date: newReservationData.reservation_date,
      reservation_time: newReservationData.reservation_time,
      people: newReservationData.people,
    })
    .returning("*");

  return newReservation;
}

async function list() {
  // Fetch all reservations from the database
  return await knex("reservations").select("*");
}

module.exports = {
  create,
  list,
};
