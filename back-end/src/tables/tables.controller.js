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

// Export your controller functions
module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
};
