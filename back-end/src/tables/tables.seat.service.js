// back-end/src/tables/tables.seat.service.js

const knex = require("../db/connection");

// Seat function for table resources
async function seatReservation(table_id, reservation_id) {
  if (!reservation_id) {
    throw { status: 400, message: "reservation_id is missing" };
  }

  // Check if the reservation with the provided reservation_id exists
  const existingReservation = await knex("reservations")
    .where({ reservation_id })
    .first();

  // If reservation_id does not exist, throw a 404 error
  if (!existingReservation) {
    throw {
      status: 404,
      message: `Reservation with ID ${reservation_id} not found`,
    };
  }

  if (existingReservation.status === "seated") {
    throw { status: 400, message: "Reservation is already seated" };
  }

  const { capacity, occupied } = await knex("tables")
    .select("capacity", "occupied")
    .where({ table_id })
    .first();

  if (occupied) {
    throw { status: 400, message: "Table is already occupied" };
  }

  if (existingReservation.people > capacity) {
    throw { status: 400, message: "Table does not have sufficient capacity" };
  }

  // Update the table in the database to mark it as occupied
  const [seatedTable] = await knex("tables")
    .where({ table_id })
    .update({ occupied: true, reservation_id })
    .returning("*");

  await knex("reservations")
    .where({ reservation_id })
    .update({ status: "seated" });

  // Update the reservation in the database to mark it as seated
  console.log("Updated table:", seatedTable);
  return seatedTable;
}

// Export your service function
module.exports = {
  seatReservation,
};
