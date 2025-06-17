const pool = require('../db');

// Registrar asistencia (entrada o salida)
const registrarAsistencia = async (req, res) => {
  const { usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon } = req.body;

  if (!usuario_id || !tipo || !fecha_hora_registro) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  if (!['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de registro inválido' });
  }

  try {
    await pool.query(
      `INSERT INTO registros_asistencia (usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon]
    );

    res.status(201).json({ mensaje: 'Registro de asistencia guardado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el registro' });
  }
};

// Ver registros (puede incluir filtros opcionales)
const verRegistros = async (req, res) => {
  const { usuario_id } = req.query;

  try {
    let query = 'SELECT * FROM registros_asistencia';
    const params = [];

    if (usuario_id) {
      query += ' WHERE usuario_id = $1 ORDER BY fecha_hora_registro DESC';
      params.push(usuario_id);
    } else {
      query += ' ORDER BY fecha_hora_registro DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los registros' });
  }
};

module.exports = {
  registrarAsistencia,
  verRegistros,
};
