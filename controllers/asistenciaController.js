const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const validarQR = async (req, res) => {
  const { token_qr, usuario_id } = req.body;

  if (!token_qr || !usuario_id) {
    return res.status(400).json({ error: 'token_qr y usuario_id son requeridos.' });
  }

  try {
    // 1. Verificar y decodificar el token del QR
    let payload;
    try {
      payload = jwt.verify(token_qr, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'QR inválido o expirado.' });
    }

    const sedeDelQR = payload.sede_id;

    // 2. Obtener la sede del usuario desde la base de datos
    const result = await pool.query('SELECT sede FROM usuarios WHERE usuario_id = $1', [usuario_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const sedeDelUsuario = result.rows[0].sede;

    // 3. Comparar las sedes
    if (sedeDelUsuario !== sedeDelQR) {
      return res.status(403).json({ error: 'La sede del QR no corresponde a la del usuario.' });
    }

    // Si coincide:
    return res.status(200).json({
      mensaje: 'QR válido. La sede coincide con la del usuario.',
      sede_id: sedeDelQR,
    });

  } catch (error) {
    console.error('Error validando QR:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  validarQR,
};
