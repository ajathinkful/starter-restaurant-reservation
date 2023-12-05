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

// Export your service functions
module.exports = {
  create,
  list,
};
