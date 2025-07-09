const express = require('express');
const router = express.Router();
const { crearEmpleado } = require('../controllers/empleadoController');

router.post('/crear-empleado', crearEmpleado);

module.exports = router;
