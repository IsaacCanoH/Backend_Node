const express = require('express');
const router = express.Router();
const asistenciaController = require("../controllers/asistenciaController");

router.post("/registrar-asistencia", asistenciaController.registrarAsistencia);
router.get("/ver-asistencias",asistenciaController.verRegistros);

module.exports = router;

