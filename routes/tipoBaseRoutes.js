const express = require('express');
const router = express.Router();
const tipoBaseController = require("../controllers/tipoBaseController");

router.get('/getDireccion', tipoBaseController.obtenerDirecciones);
router.get('/getCoordinacion/:direccionId', tipoBaseController.obtenerCoordinacionesPorDireccion);
router.get('/getJefatura/:coordinacionId', tipoBaseController.obtenerJefaturasPorCoordinacion);
router.get('/getOficina', tipoBaseController.obtenerOficina);
router.get('/getHorario', tipoBaseController.obtenerHorario)
router.get('/getTipoBase', tipoBaseController.obtenerTipoBase)

module.exports = router;