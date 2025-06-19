const express = require('express');
const router = express.Router();
const qrSedeController = require('../controllers/qrSedeController');

router.post('/generar-qr', qrSedeController.generarQRSede);

module.exports = router;