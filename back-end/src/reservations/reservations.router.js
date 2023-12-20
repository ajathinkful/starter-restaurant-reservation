// back-end/src/reservations/reservations.router.js

const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/search").get(controller.search);

router.route("/").get(controller.list).post(controller.create);

router
  .route("/:reservation_id")
  .get(controller.read)
  .put(controller.updateDetails);

router.route("/:reservation_id/status").put(controller.updateStatus);

module.exports = router;
