// back-end/src/reservations/reservations.router.js

const router = require("express").Router();
const controller = require("./reservations.controller");

router
  .route("/")
  .get((req, res, next) => {
    // Check if the mobile_number query parameter exists
    if (req.query.mobile_number) {
      // If it exists, call the middleware for the search controller
      controller.search[0](req, res, next);
    } else {
      // If it doesn't exist, call the middleware for the list controller
      controller.list[0](req, res, next);
    }
  })
  .post(controller.create);

router
  .route("/:reservation_id")
  .get(controller.read)
  .put(controller.updateDetails);

router.route("/:reservation_id/status").put(controller.updateStatus);

module.exports = router;
