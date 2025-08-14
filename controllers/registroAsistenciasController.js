const db = require('../db');

const crearAsistencia = async (req, res) => {
  try {
    const { usuario_id, tipo, metodo, condicion, fecha_hora_registro, ubicacion_lat, ubicacion_lon } = req.body;

    const query = `
      INSERT INTO reloj_checador_asistencias 
      (usuario_id, tipo, metodo, condicion, fecha_hora_registro, ubicacion_lat, ubicacion_lon )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [usuario_id, tipo, metodo, condicion, fecha_hora_registro, ubicacion_lat, ubicacion_lon];

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
      ORDER BY fecha_hora_registro DESC
      LIMIT 60;
    `;

    const { rows } = await db.query(query, [usuario_id]);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

const obtenerAsistenciasMensuales = async (req, res) => {
  try {
    const year  = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const tz    = (req.query.tz || 'America/Mexico_City');

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ status: 'error', message: 'Parámetros inválidos: use year y month (1-12).' });
    }

    const query = `
      WITH bounds AS (
        SELECT
          (make_date($1,$2,1)::timestamp AT TIME ZONE $3) AS start_utc,
          ((make_date($1,$2,1) + INTERVAL '1 month')::timestamp AT TIME ZONE $3) AS end_utc
      ),
      filtered AS (
        SELECT
          a.*,
          ((a.fecha_hora_registro AT TIME ZONE $3))::date AS local_date
        FROM reloj_checador_asistencias a
        CROSS JOIN bounds b
        WHERE a.fecha_hora_registro >= b.start_utc
          AND a.fecha_hora_registro <  b.end_utc
      ),
      entrada AS (
        SELECT DISTINCT ON (usuario_id, local_date)
          usuario_id, local_date,
          fecha_hora_registro AS entrada_hora,
          condicion           AS entrada_condicion,
          metodo              AS entrada_metodo
        FROM filtered
        WHERE tipo = 'entrada'
        ORDER BY usuario_id, local_date, fecha_hora_registro ASC
      ),
      salida AS (
        SELECT DISTINCT ON (usuario_id, local_date)
          usuario_id, local_date,
          fecha_hora_registro AS salida_hora,
          condicion           AS salida_condicion,
          metodo              AS salida_metodo
        FROM filtered
        WHERE tipo = 'salida'
        ORDER BY usuario_id, local_date, fecha_hora_registro DESC
      ),
      unidos AS (
        SELECT
          COALESCE(e.usuario_id, s.usuario_id) AS usuario_id,
          COALESCE(e.local_date, s.local_date) AS local_date,
          e.entrada_hora, e.entrada_condicion, e.entrada_metodo,
          s.salida_hora,  s.salida_condicion,  s.salida_metodo
        FROM entrada e
        FULL JOIN salida s
          ON e.usuario_id = s.usuario_id AND e.local_date = s.local_date
      )
      SELECT
        u.usuario_id, u.nombre, u.ap_paterno, u.ap_materno, u.usuario,
        un.local_date,
        un.entrada_hora,   un.entrada_condicion,   un.entrada_metodo,
        un.salida_hora,    un.salida_condicion,    un.salida_metodo,
        CASE
          WHEN COALESCE(un.entrada_condicion,'falta') = 'puntual'
           AND COALESCE(un.salida_condicion,'falta')  = 'puntual'     THEN 'puntual'
          WHEN COALESCE(un.entrada_condicion,'falta') = 'puntual'
           AND COALESCE(un.salida_condicion,'falta')  = 'incompleta'  THEN 'incompleta'
          WHEN COALESCE(un.entrada_condicion,'falta') = 'puntual'
           AND COALESCE(un.salida_condicion,'falta')  = 'falta'       THEN 'incompleta'
          WHEN COALESCE(un.entrada_condicion,'falta') = 'retardo'
           AND COALESCE(un.salida_condicion,'falta')  = 'puntual'     THEN 'retardo'
          WHEN COALESCE(un.entrada_condicion,'falta') = 'retardo'
           AND COALESCE(un.salida_condicion,'falta') IN ('incompleta','falta') THEN 'incompleta'
          WHEN COALESCE(un.entrada_condicion,'falta') = 'falta'
           AND COALESCE(un.salida_condicion,'falta')  = 'falta'       THEN 'falta'
          ELSE 'incompleta'
        END AS condicion_final,

        /* Flag de incidencia */
        EXISTS (
          SELECT 1
          FROM reloj_checador_incidencias i
          WHERE i.usuario_id = u.usuario_id
            AND i.fecha_incidencia = un.local_date
        ) AS has_incidencia,

        /* Estado de la (única) incidencia del día */
        (
          SELECT COALESCE(v.estado, 'pendiente')
          FROM reloj_checador_incidencias i
          LEFT JOIN reloj_checador_incidencias_validacion v
            ON v.incidencia_id = i.incidencia_id
          WHERE i.usuario_id = u.usuario_id
            AND i.fecha_incidencia = un.local_date
          ORDER BY i.incidencia_id DESC
          LIMIT 1
        ) AS incidencia_estado

      FROM unidos un
      JOIN reloj_checador_usuarios u ON u.usuario_id = un.usuario_id
      ORDER BY u.ap_paterno, u.ap_materno, u.nombre, un.local_date;
    `;

    const { rows } = await db.query(query, [year, month, tz]);
    return res.status(200).json({ status: 'success', data: rows });

  } catch (error) {
    console.error('Error al obtener asistencias mensuales:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

module.exports = {
  crearAsistencia,
  obtenerAsistenciasPorUsuario,
  obtenerAsistenciasMensuales
};
