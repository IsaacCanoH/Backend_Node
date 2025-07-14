const express = require('express');
const router = express.Router();
const fotosRostroController = require('../controllers/fotosRostroController');

router.post('/guardar-foto-rostro', fotosRostroController.guardarFotoRostro);
router.get('/obtener-foto-rostro/:usuario_id', fotosRostroController.obtenerFotoRostro);

module.exports = router;
