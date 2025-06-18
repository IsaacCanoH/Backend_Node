const express = require("express");
const router = express.Router();
const sedeController = require("../controllers/sedeController");

router.post("/registrar-sede", sedeController.registrarSedes);
router.get('/:id/enviar-qr', enviarQRPorCorreo);

module.exports = router;