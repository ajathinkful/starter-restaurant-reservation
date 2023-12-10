// back-end/src/reservations/reservations.router.js

const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/").get(controller.list).post(controller.create);

router.route("/:reservation_id").get(controller.read);

module.exports = router;
