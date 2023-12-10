// back-end/src/tables/tables.router.js

const router = require("express").Router();
const controller = require("./tables.controller");

// Define your routes here
router.route("/").get(controller.list).post(controller.create);

router.route("/:table_id").get(controller.read);

// Export the router
module.exports = router;
