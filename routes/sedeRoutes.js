const express = require("express");
const router = express.Router();
const sedeController = require("../controllers/sedeController");

router.post("/registrar-sede", sedeController.registrarSedes);
router.get('/:id/enviar-qr', sedeController.enviarQRPorCorreo);

module.exports = router;