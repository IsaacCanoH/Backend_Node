const express = require("express");
const router = express.Router();
const formParser = require("../middlewares/formParser");
const grupoController = require("../controllers/grupoController");

router.post("/crear-grupo", formParser, grupoController.crearGrupo);
router.put("/edit-grupo/:grupo_id", formParser, grupoController.editarGrupo);
router.get("/obtener-grupo/:usuario_id", formParser, grupoController.obtenerGruposPorCreador);
router.delete("/eliminar-grupo/:grupo_id", grupoController.eliminarGrupo);
router.get("/usuarios-relacionados/:usuario_id", grupoController.obtenerUsuariosRelacionados);


module.exports = router;