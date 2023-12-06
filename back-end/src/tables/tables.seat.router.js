// back-end/src/tables/tables.seat.router.js

const router = require("express").Router();
const controller = require("./tables.seat.controller");

// Define your seat route here
router.route("/:table_id/seat/").put(controller.seatReservation);

// Export the router
module.exports = router;
