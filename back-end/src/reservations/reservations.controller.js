// back-end/src/reservations/reservations.controller.js

const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.json({ data });
}

/**
 * Create handler for reservation resources
 */
async function create(req, res) {
  const newReservation = await service.create(req.body);
  res.status(201).json({ data: newReservation });
}

/**
 * Read handler for a specific reservation resource
 */
async function read(req, res) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  res.json({ data: reservation });
}

async function updateStatus(req, res) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  const updatedReservation = await service.updateStatus(reservation_id, status);

  res.json({ data: updatedReservation });
}

async function updateDetails(req, res) {
  const { reservation_id } = req.params;
  const updatedDetails = req.body.data; // Assuming your client sends the updated data in the request body

  const updatedReservation = await service.updateDetails(
    reservation_id,
    updatedDetails
  );

  res.json({ data: updatedReservation });
}

async function search(req, res) {
  const { mobile_number } = req.query;
  const data = await service.search(mobile_number);
  res.json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(read)], // Add the read function
  updateStatus: [asyncErrorBoundary(updateStatus)],
  updateDetails: [asyncErrorBoundary(updateDetails)],
  search: [asyncErrorBoundary(search)],
};
