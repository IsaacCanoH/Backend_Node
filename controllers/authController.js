const crypto = require('crypto');
const db = require('../db');

// Funcionalidad

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

    // Consulta principal del usuario
    const userResult = await db.query(`
      SELECT usuario_id, nombre, ap_paterno, ap_materno, email, usuario, ping_hash,
             id_direccion, id_coordinacion, id_jefatura, id_oficina, ig_grupo_horario, key_qr, clave_acceso
      FROM reloj_checador_usuarios
      WHERE usuario = $1 AND clave_acceso = $2
    `, [usuario, hashedPassword]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    }

    const u = userResult.rows[0];

    const [direccion, coordinacion, oficina, horario] = await Promise.all([
      db.query(`SELECT nombre FROM reloj_checador_catalogo_direcciones WHERE id = $1`, [u.id_direccion]),
      db.query(`SELECT nombre FROM reloj_checador_catalogo_coordinaciones WHERE id = $1`, [u.id_coordinacion]),
      db.query(`
    SELECT nombre, latitud, longitud 
    FROM reloj_checador_catalogo_oficinas 
    WHERE id = $1
  `, [u.id_oficina]),
      db.query(`
    SELECT check_in, tolerance, check_out
    FROM reloj_checador_horarios
    WHERE id = $1
  `, [u.ig_grupo_horario])
    ]);


    const timestamp = new Date().toISOString();
    const requestId = crypto.randomUUID();

    const response = {
      status: 'success',
      code: 200,
      message: 'Acceso permitido',
      data: {
        user: {
          empleado_id: u.usuario_id,
          nombre: u.nombre,
          apellido_p: u.ap_paterno,
          apellido_m: u.ap_materno,
          email: u.email,
          usuario: u.usuario,
          pin: u.ping_hash
        },
        work_info: {
          assignment_id: u.id_direccion,
          assignment_name: direccion.rows[0]?.nombre || '',
          leadership_id: u.id_coordinacion,
          leadership_name: coordinacion.rows[0]?.nombre || '',
          office_id: u.id_oficina,
          office_name: oficina.rows[0]?.nombre || '',
          checking_hash: u.clave_acceso,
          group_work: u.ig_grupo_horario,
          block_key_qr: u.key_qr || '',
          lat: oficina.rows[0]?.latitud,
          lng: oficina.rows[0]?.longitud
        },
        schedule: {
          start: horario.rows[0]?.check_in || '',
          tolerance: horario.rows[0]?.tolerance || '',
          end: horario.rows[0]?.check_out || ''
        }
      },
      meta: {
        timestamp,
        request_id: requestId
      }
    };

    return res.status(200).json([response]); // <-- se envía dentro de un array como pediste
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

module.exports = { login };
