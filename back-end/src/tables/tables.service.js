// back-end/src/tables/tables.service.js

const knex = require("../db/connection");

// Create function for table resources
async function create({ data }) {
  // Extract data from the request body
  const { table_name, capacity } = data;

  // Insert new table into the database
  const [newTable] = await knex("tables")
    .insert({ table_name, capacity })
    .returning("*");

  return newTable;
}

// List function for table resources
async function list() {
  // Fetch all tables from the database
  return await knex("tables").select("*");
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
