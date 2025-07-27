const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const registroAsistenciaController = require("../controllers/registroAsistenciasController");

router.post("/registrar-asistencia",upload.none(), registroAsistenciaController.crearAsistencia);
router.get("/obtener-asistencia/:usuario_id", registroAsistenciaController.obtenerAsistenciasPorUsuario);

module.exports = router;