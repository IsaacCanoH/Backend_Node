const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1 AND estado = $2', [usuario, 'activo']);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuarioDB = result.rows[0];

    const passwordMatch = await bcrypt.compare(contrasena, usuarioDB.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const payload = {
      id: usuarioDB.id,
      nombre: usuarioDB.nombre,
      apellido: usuarioDB.apellido,
      email: usuarioDB.email,
      usuario: usuarioDB.usuario,
      rol: usuarioDB.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  login,
};
