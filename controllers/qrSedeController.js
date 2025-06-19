const pool = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Hola
const generarQRSede = async (req, res) => {
  const { sede_id } = req.body;

  if (!sede_id) {
    return res.status(400).json({ error: 'El campo sede_id es requerido.' });
  }

  try {
    // 1. Verificamos que la sede exista
    const [sede] = await pool.query('SELECT * FROM Sedes WHERE sede_id = ?', [sede_id]);

    if (sede.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada.' });
    }

    // 2. Creamos el token JWT
    const payload = {
      sede_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' }); // 5 minutos

    // 3. Respondemos con el token
    return res.status(200).json({
      mensaje: 'Token generado correctamente',
      token,
    });

  } catch (error) {
    console.error('Error generando QR:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  generarQRSede,
};
