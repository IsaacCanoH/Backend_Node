const db = require('../db');

const crearAsistencia = async (req, res) => {
  try {
    const { usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon, condicion } = req.body;

    const query = `
      INSERT INTO reloj_checador_asistencias 
      (usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon, condicion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [usuario_id, tipo, fecha_hora_registro, ubicacion_lat, ubicacion_lon, condicion];

    const { rows } = await db.query(query, values);
    res.status(201).json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('Error al crear asistencia:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

const obtenerAsistenciasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const query = `
      SELECT * FROM reloj_checador_asistencias 
      WHERE usuario_id = $1 
      ORDER BY fecha_hora_registro DESC;
    `;

    const { rows } = await db.query(query, [usuario_id]);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

module.exports = {
  crearAsistencia,
  obtenerAsistenciasPorUsuario,
};
