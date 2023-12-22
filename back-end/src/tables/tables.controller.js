// back-end/src/tables/tables.controller.js

const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// List handler for table resources
async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

// Create handler for table resources
async function create(req, res) {
  const newTable = await service.create(req.body);
  res.status(201).json({ data: newTable });
}

async function read(req, res) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  res.json({ data: table });
}

async function finishTable(req, res) {
  const { table_id } = req.params;

  console.log(`Start finishing table with ID ${table_id}`);
  await service.finishTable(table_id);
  console.log(`Table with ID ${table_id} has been successfully finished.`);
  res.status(200).json({
    message: `Table with ID ${table_id} has been successfully finished.`,
  });
}

// Export your controller functions
module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(read)],
  finishTable: [asyncErrorBoundary(finishTable)],
};
