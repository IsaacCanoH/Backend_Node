const express = require("express");
const router = express.Router();
const formParser = require("../middlewares/formParser");
const upload = require("../middlewares/multer");
const {
  crearIncidencia,
  obtenerIncidenciasPorUsuario,
  obtenerIncidencias,
  obtenerTipoIncidencia,
  obtenerIncidenciasPorUsuarioYFecha,
  obtenerFechasElegiblesUltimos30,
  actualizarEstadoIncidencia
} = require("../controllers/incidenciasController");

router.post("/crear-incidencia", upload.array("archivos", 5), crearIncidencia);
router.get("/tipo", obtenerTipoIncidencia);
router.get("/obtener-incidencia/:usuario_id", obtenerIncidenciasPorUsuario);
router.get("/", obtenerIncidencias);
router.get("/usuario/:usuario_id/:fecha", obtenerIncidenciasPorUsuarioYFecha);
router.get("/fechas-elegibles/:usuario_id", obtenerFechasElegiblesUltimos30);
router.put("/actualizar-estado/:incidencia_id", formParser, actualizarEstadoIncidencia);

module.exports = router;
