// back-end/src/tables/tables.seat.controller.js

const service = require("./tables.seat.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function handleMissingData(req, res, next) {
  if (!req.body.data) {
    req.body.data = {};
  }
  next();
}

// Seat handler for table resources
async function seatReservation(req, res) {
  const { reservation_id } = req.body.data;

  // Seat the reservation at the specified table
  const seatedTable = await service.seatReservation(
    req.params.table_id,
    reservation_id
  );
  console.log("Response from service:", seatedTable);

  res.status(200).json({ data: seatedTable });
}

// Export your controller function
module.exports = {
  seatReservation: [
    handleMissingData, // Apply the middleware
    asyncErrorBoundary(seatReservation),
  ],
};
