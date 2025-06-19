const express = require("express");
const router = express.Router();
const sedeController = require("../controllers/sedeController");

router.post("/registrar-sede", sedeController.registrarSedes);

module.exports = router;