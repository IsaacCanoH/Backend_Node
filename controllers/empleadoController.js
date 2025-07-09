const pool = require('../db');
const crypto = require('crypto');

const crearEmpleado = async (req, res) => {
  try {
    const {
      nombre,
      ap_paterno,
      ap_materno,
      email,
      usuario,
      clave_acceso,
      ping_hash,
      id_direccion,
      id_coordinacion,
      id_jefatura,
      id_oficina,
      ig_grupo_horario,
      id_municipio,
      id_tipo_usuario,
      telefono
    } = req.body;

    // Validación básica
    if (!nombre || !ap_paterno || !ap_materno || !email || !usuario || !clave_acceso || !ping_hash) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    // Encriptar contraseña y pin con MD5
    const hashContrasena = crypto.createHash('md5').update(clave_acceso).digest('hex');
    const hashPin = crypto.createHash('md5').update(ping_hash).digest('hex');

    const query = `
      INSERT INTO reloj_checador_usuarios (
        nombre, ap_paterno, ap_materno, email, usuario, clave_acceso, ping_hash,
        id_direccion, id_coordinacion, id_jefatura, id_oficina, ig_grupo_horario,
        id_municipio, id_tipo_usuario, telefono
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      nombre,
      ap_paterno,
      ap_materno,
      email,
      usuario,
      hashContrasena,
      hashPin,
      id_direccion,
      id_coordinacion,
      id_jefatura,
      id_oficina,
      ig_grupo_horario,
      id_municipio,
      id_tipo_usuario,
      telefono
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      empleado: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el empleado' });
  }
};

module.exports = {
  crearEmpleado
};
