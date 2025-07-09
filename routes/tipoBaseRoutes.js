const express = require('express');
const router = express.Router();
const tipoBaseController = require("../controllers/tipoBaseController");

router.post('/base', tipoBaseController.crearTipoBase);
router.get('/base', tipoBaseController.obtenerTipoBase);

module.exports = router;