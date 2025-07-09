const pool = require("../db"); // Ajusta según tu configuración de conexión a PostgreSQL
const path = require("path");

// Registrar incidencia con archivos
exports.crearIncidencia = async (req, res) => {
  try {
    const { usuario_id, tipo_incidencia, descripcion, fecha_incidencia } = req.body;
    const archivos = req.files;

    const nuevaIncidencia = await pool.query(
      `INSERT INTO reloj_checador_incidencias (usuario_id, tipo_incidencia, descripcion, fecha_incidencia)
       VALUES ($1, $2, $3, $4) RETURNING incidencia_id`,
      [usuario_id, tipo_incidencia, descripcion, fecha_incidencia]
    );

    const incidenciaId = nuevaIncidencia.rows[0].incidencia_id;

    for (const file of archivos) {
      await pool.query(
        `INSERT INTO reloj_checador_incidencias_evidencias (incidencia_id, tipo_archivo, ruta_archivo)
         VALUES ($1, $2, $3)`,
        [incidenciaId, file.mimetype, file.filename]
      );
    }

    res.status(201).json({ message: "Incidencia registrada exitosamente." });
  } catch (error) {
    console.error("Error al registrar incidencia:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

// Obtener incidencias por usuario
exports.obtenerIncidenciasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await pool.query(
      `SELECT i.*, e.tipo_archivo, e.ruta_archivo
       FROM reloj_checador_incidencias i
       LEFT JOIN reloj_checador_incidencias_evidencias e ON i.incidencia_id = e.incidencia_id
       WHERE i.usuario_id = $1
       ORDER BY i.fecha_creacion DESC`,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

exports.obtenerIncidencias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, e.tipo_archivo, e.ruta_archivo
       FROM reloj_checador_incidencias i
       LEFT JOIN reloj_checador_incidencias_evidencias e ON i.incidencia_id = e.incidencia_id
       ORDER BY i.fecha_creacion DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};
