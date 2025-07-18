const express = require("express");
const router = express.Router();
const registroAsistenciaController = require("../controllers/registroAsistenciasController");

router.post("/registrar-asistencia", registroAsistenciaController.crearAsistencia);
router.get("/obtener-asistencia/:usuario_id", registroAsistenciaController.obtenerAsistenciasPorUsuario);

module.exports = router;