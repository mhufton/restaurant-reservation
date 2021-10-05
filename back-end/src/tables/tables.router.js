const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./tables.controller");

router
  .route("/")
  .get(controller.list)
  .post(controller.create)

router
  .route("/:tableId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy)

module.exports = router;