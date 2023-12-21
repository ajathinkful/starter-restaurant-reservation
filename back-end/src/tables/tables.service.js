// back-end/src/tables/tables.service.js

const knex = require("../db/connection");

// Create function for table resources
async function create({ data = {} }) {
  // Extract data from the request body
  const { table_name, capacity } = data;

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
    .insert({ table_name, capacity })
    .returning("*");

  console.log("Table successfully created.");

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
