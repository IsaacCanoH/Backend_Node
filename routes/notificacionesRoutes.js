const express = require('express');
const router = express.Router();
const controlador = require('../controllers/notificacionesController');

router.get('/:usuario_id', controlador.obtenerPorEmpleado);
router.post('/crear-notificacion', controlador.crearNotificacion);
router.patch('/leer/:notificacion_id', controlador.marcarComoLeida);
router.patch('/vista/:notificacion_id', controlador.marcarComoVista);

module.exports = router;
