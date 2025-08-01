const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const {
  crearIncidencia,
  obtenerIncidenciasPorUsuario,
  obtenerIncidencias,
  obtenerTipoIncidencia
} = require("../controllers/incidenciasController");

router.post("/crear-incidencia", upload.array("archivos", 5), crearIncidencia);
router.get("/tipo", obtenerTipoIncidencia)
router.get("/obtener-incidencia/:usuario_id", obtenerIncidenciasPorUsuario);
router.get("/", obtenerIncidencias);


module.exports = router;
