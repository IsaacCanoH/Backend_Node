const crypto = require('crypto');
const db = require('../db'); // Asegúrate que esta conexión esté correcta

function md5Encrypt(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

const login = async (req, res) => {
  const { usuario, clave_acceso } = req.body;

  if (!usuario || !clave_acceso) {
    return res.status(400).json({ status: 'error', message: 'Usuario y contraseña son obligatorios' });
  }

  try {
    const hashedPassword = md5Encrypt(clave_acceso);

    const result = await db.query(
      `SELECT usuario_id, nombre, ap_paterno, ap_materno, email, usuario 
       FROM reloj_checador_usuarios 
       WHERE usuario = $1 AND clave_acceso = $2`,
      [usuario, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    }

    const empleado = result.rows[0];

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Acceso permitido',
      data: {
        user: {
          empleado_id: empleado.usuario_id,
          nombre: empleado.nombre,
          apellido_p: empleado.ap_paterno,
          apellido_m: empleado.ap_materno,
          email: empleado.email,
          usuario: empleado.usuario
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

module.exports = { login };
