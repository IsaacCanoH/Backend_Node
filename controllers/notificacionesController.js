const db = require('../db');

// Obtener todas las notificaciones de un empleado
exports.obtenerPorEmpleado = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await db.query(
      `SELECT * 
       FROM reloj_checador_notificaciones 
       WHERE usuario_id = $1 AND vista = FALSE
       ORDER BY fecha_creacion DESC`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

exports.crearNotificacion = async (req, res) => {
  const { usuario_id, titulo, mensaje, tipo, leida, vista, metadata } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO reloj_checador_notificaciones 
        (usuario_id, titulo, mensaje, tipo, leida, vista, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) 
       RETURNING *`,
      [usuario_id, titulo, mensaje, tipo, leida, vista, metadata]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear notificación:', err);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
};


// Marcar notificación como leída
exports.marcarComoLeida = async (req, res) => {
  const { notificacion_id } = req.params;

  try {
    const result = await db.query(
      `UPDATE reloj_checador_notificaciones 
       SET leida = TRUE, fecha_leida = CURRENT_TIMESTAMP 
       WHERE notificacion_id = $1 RETURNING *`,
      [notificacion_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
};

// Marcar notificación como vista
exports.marcarComoVista = async (req, res) => {
  const { notificacion_id } = req.params;

  try {
    const result = await db.query(
      `UPDATE reloj_checador_notificaciones 
       SET vista = TRUE
       WHERE notificacion_id = $1 
       RETURNING *`,
      [notificacion_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al marcar como vista:', err);
    res.status(500).json({ error: 'Error al marcar como vista' });
  }
};  