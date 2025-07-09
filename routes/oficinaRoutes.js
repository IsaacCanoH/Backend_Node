const express = require('express');
const router = express.Router();
const { crearOficina, obtenerOficinas } = require('../controllers/oficinaController');

router.post('/crear-oficina', crearOficina);       
router.get('/ver-oficina', obtenerOficinas);     

module.exports = router;
