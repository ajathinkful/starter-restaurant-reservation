// back-end/src/tables/tables.service.js

const knex = require("../db/connection");

// Create function for table resources
async function create({ data = {} }) {
  // Extract data from the request body
  const { table_name, capacity, reservation_id } = data;

  if (!table_name) {
    console.log("Error: table_name is missing");
    throw { status: 400, message: "table_name is missing" };
  }

  if (table_name.length < 2) {
    console.log("Error: table_name must have at least two characters");
    throw {
      status: 400,
      message: "table_name must have at least two characters",
    };
  }

  // Validate if capacity is missing
  if (!capacity) {
    console.log("Error: capacity is missing");
    throw { status: 400, message: "capacity is missing" };
  }

  // Validate if capacity is zero
  if (capacity === 0) {
    console.log("Error: capacity cannot be zero");
    throw { status: 400, message: "capacity cannot be zero" };
  }

  // Validate if capacity is not a number
  if (isNaN(capacity) || !Number.isInteger(capacity)) {
    console.log("Error: capacity is not a valid number");
    throw { status: 400, message: "capacity is not a valid number" };
  }

  // Insert new table into the database
  const [newTable] = await knex("tables")
    .insert({
      table_name,
      capacity,
      reservation_id: reservation_id !== undefined ? reservation_id : null,
      occupied: reservation_id !== undefined ? true : false,
    })
    .returning("*");

  console.log("Table successfully created.", newTable);

  return newTable;
}

// List function for table resources
async function list() {
  // Fetch all tables from the database and sort by table name
  const tables = await knex("tables").select("*").orderBy("table_name");

  return tables;
}

async function read(table_id) {
  const table = await knex("tables").where({ table_id }).first();

  if (!table) {
    throw {
      status: 404,
      message: `Table with ID ${table_id} not found`,
    };
  }

  return table;
}

async function finishTable(table_id) {
  // Update the table in the database to mark it as available
  const table = await read(table_id);

  if (!table.occupied) {
    throw {
      status: 400,
      message: `Table with ID ${table_id} is not occupied`,
    };
  }

  // Fetch the reservation_id associated with the table
  const { reservation_id } = await knex("tables")
    .select("reservation_id")
    .where({ table_id })
    .first();

  // Update the reservation in the database to mark it as finished
  await knex("reservations")
    .where({ reservation_id })
    .update({ status: "finished" });

  await knex("tables")
    .where({ table_id })
    .update({ occupied: false, reservation_id: null });
}

// Export your service functions
module.exports = {
  create,
  list,
  read,
  finishTable,
};
