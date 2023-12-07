// back-end/src/tables/tables.seat.service.js

const knex = require("../db/connection");

// Seat function for table resources
async function seatReservation(table_id, reservation_id) {
  // Update the table in the database to mark it as occupied
  const [seatedTable] = await knex("tables")
    .where({ table_id })
    .update({ occupied: true, reservation_id })
    .returning("*");

  // Update the reservation in the database to mark it as seated
  console.log("Updated table:", seatedTable);
  return seatedTable;
}

// Export your service function
module.exports = {
  seatReservation,
};
