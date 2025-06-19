const express = require('express');
const router = express.Router();
const { validarQR } = require('../controllers/asistenciaController'); 

router.post('/validar-qr', validarQR);

module.exports = router;
