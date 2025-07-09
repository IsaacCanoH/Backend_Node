const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const {
  crearIncidencia,
  obtenerIncidenciasPorUsuario,
  obtenerIncidencias
} = require("../controllers/incidenciasController");

router.post("/crear-incidencia", upload.array("archivos", 5), crearIncidencia);
router.get("/:usuario_id", obtenerIncidenciasPorUsuario);
router.get("/", obtenerIncidencias);
module.exports = router;
