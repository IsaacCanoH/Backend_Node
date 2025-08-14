const pool = require("../db"); 

exports.crearIncidencia = async (req, res) => {
  try {
    const { usuario_id, tipo_incidencia, descripcion, fecha_incidencia } = req.body;
    const archivos = Array.isArray(req.files) ? req.files : [];

    const tiposArch = archivos.map(f => f.mimetype);
    const rutasArch = archivos.map(f => f.filename);

    const { rows: [out] } = await pool.query(
      `
      WITH nueva AS (
        INSERT INTO reloj_checador_incidencias (usuario_id, tipo_incidencia, descripcion, fecha_incidencia)
        VALUES ($1, $2, $3, $4::date)
        RETURNING incidencia_id
      ),
      ins_evid AS (
        INSERT INTO reloj_checador_incidencias_evidencias (incidencia_id, tipo_archivo, ruta_archivo)
        SELECT (SELECT incidencia_id FROM nueva), t.tipo, t.ruta
        FROM unnest($5::text[], $6::text[]) AS t(tipo, ruta)
        RETURNING evidencia_id
      ),
      valid AS (
        INSERT INTO reloj_checador_incidencias_validacion (incidencia_id)
        SELECT incidencia_id FROM nueva
        RETURNING validacion_id, estado, motivo
      )
      SELECT
        (SELECT incidencia_id FROM nueva) AS incidencia_id,
        COALESCE((SELECT json_agg(evidencia_id) FROM ins_evid), '[]'::json) AS evidencias_ids,
        (SELECT row_to_json(valid) FROM valid) AS validacion;
      `,
      [usuario_id, tipo_incidencia, descripcion || null, fecha_incidencia, tiposArch, rutasArch]
    );

    return res.status(201).json({
      message: "Incidencia registrada exitosamente."
    });
  } catch (error) {
    console.error("Error al registrar incidencia:", error);
    return res.status(500).json({ error: "Error del servidor." });
  }
};

exports.actualizarEstadoIncidencia = async (req, res) => {
  try {
    const { incidencia_id } = req.params;
    const { estado, motivo } = req.body;

    const estadosPermitidos = ["pendiente", "aprobado", "rechazado"];
    if (!estadosPermitidos.includes(estado)) {  
      return res.status(400).json({ error: "Estado inválido." });
    }

    const motivoFinal = estado === "aprobado" ? null : (motivo || null);

    const { rowCount } = await pool.query(
      `
      UPDATE reloj_checador_incidencias_validacion
      SET estado = $1,
          motivo = $2
      WHERE incidencia_id = $3
      `,
      [estado, motivoFinal, incidencia_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Incidencia no encontrada o sin validación asociada." });
    }

    res.json({ message: "Estado y motivo actualizados correctamente." });
  } catch (error) {
    console.error("Error al actualizar estado de incidencia:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};



exports.obtenerIncidenciasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const { rows } = await pool.query(
      `
      SELECT
        i.incidencia_id,
        i.usuario_id,
        i.tipo_incidencia,
        i.descripcion,
        i.fecha_incidencia,
        v.estado,
        v.motivo,
        i.fecha_creacion,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'tipo_archivo', e.tipo_archivo,
              'ruta_archivo', e.ruta_archivo
            )
          ) FILTER (WHERE e.ruta_archivo IS NOT NULL),
          '[]'::json
        ) AS evidencias
      FROM reloj_checador_incidencias i
      LEFT JOIN reloj_checador_incidencias_evidencias e
        ON i.incidencia_id = e.incidencia_id
      LEFT JOIN reloj_checador_incidencias_validacion v
        ON i.incidencia_id = v.incidencia_id
      WHERE i.usuario_id = $1
      GROUP BY
        i.incidencia_id, i.usuario_id, i.tipo_incidencia, i.descripcion,
        i.fecha_incidencia, v.estado, v.motivo, i.fecha_creacion
      ORDER BY i.fecha_creacion DESC;
      `,
      [usuario_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};


exports.obtenerIncidencias = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        i.incidencia_id,
        i.usuario_id,
        i.tipo_incidencia,
        i.descripcion,
        i.fecha_incidencia,
        v.estado,
        v.motivo,
        i.fecha_creacion,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'tipo_archivo', e.tipo_archivo,
              'ruta_archivo', e.ruta_archivo
            )
          ) FILTER (WHERE e.ruta_archivo IS NOT NULL),
          '[]'::json
        ) AS evidencias
      FROM reloj_checador_incidencias i
      LEFT JOIN reloj_checador_incidencias_evidencias e
        ON i.incidencia_id = e.incidencia_id
      LEFT JOIN reloj_checador_incidencias_validacion v
        ON i.incidencia_id = v.incidencia_id
      GROUP BY
        i.incidencia_id, i.usuario_id, i.tipo_incidencia, i.descripcion,
        i.fecha_incidencia, v.estado, v.motivo, i.fecha_creacion
      ORDER BY i.fecha_creacion DESC;
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

exports.obtenerTipoIncidencia = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reloj_checador_catalogo_tipo_incidencia ORDER BY id ASC');
        res.json({ status: "success", data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los tipos de incidencias' });
    }
}

exports.obtenerIncidenciasPorUsuarioYFecha = async (req, res) => {
  try {
    const { usuario_id, fecha } = req.params;

    if (!usuario_id || !fecha) {
      return res.status(400).json({ error: "usuario_id y fecha son requeridos." });
    }

    const { rows } = await pool.query(
      `
      SELECT
        i.incidencia_id,
        i.usuario_id,
        i.tipo_incidencia,
        i.descripcion,
        i.fecha_incidencia,
        v.estado,
        v.motivo,
        i.fecha_creacion,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'tipo_archivo', e.tipo_archivo,
              'ruta_archivo', e.ruta_archivo
            )
          ) FILTER (WHERE e.ruta_archivo IS NOT NULL),
          '[]'::json
        ) AS evidencias
      FROM reloj_checador_incidencias i
      LEFT JOIN reloj_checador_incidencias_evidencias e
        ON i.incidencia_id = e.incidencia_id
      LEFT JOIN reloj_checador_incidencias_validacion v
        ON i.incidencia_id = v.incidencia_id
      WHERE i.usuario_id = $1
        AND i.fecha_incidencia::date = $2::date
      GROUP BY
        i.incidencia_id, i.usuario_id, i.tipo_incidencia, i.descripcion,
        i.fecha_incidencia, v.estado, v.motivo, i.fecha_creacion
      ORDER BY i.fecha_creacion DESC;
      `,
      [usuario_id, fecha]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener incidencias por usuario y fecha:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

exports.obtenerFechasElegiblesUltimos30 = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuario_id, 10);
    if (!Number.isInteger(usuarioId)) {
      return res.status(400).json({ error: "usuario_id inválido." });
    }

    const sql = `
      WITH ultimos_registros AS (
        SELECT a.*
        FROM reloj_checador_asistencias a
        WHERE a.usuario_id = $1
        ORDER BY a.fecha_hora_registro DESC
        LIMIT 60
      ),
      asist_local AS (
        SELECT
          a.usuario_id,
          (a.fecha_hora_registro AT TIME ZONE 'America/Mexico_City')::date AS local_date,
          a.tipo,
          a.condicion
        FROM ultimos_registros a
      ),
      dias_distintos AS (
        SELECT local_date
        FROM asist_local
        GROUP BY local_date
        ORDER BY local_date DESC
        LIMIT 30
      ),
      por_dia AS (
        SELECT
          al.usuario_id,
          al.local_date,
          MAX(CASE WHEN al.tipo = 'entrada' THEN al.condicion END) AS entrada,
          MAX(CASE WHEN al.tipo = 'salida'  THEN al.condicion END) AS salida
        FROM asist_local al
        INNER JOIN dias_distintos dd ON dd.local_date = al.local_date
        GROUP BY al.usuario_id, al.local_date
      ),
      estado AS (
        SELECT
          usuario_id,
          local_date,
          CASE
            WHEN entrada = 'puntual' AND salida = 'puntual' THEN 'puntual'
            WHEN entrada = 'puntual' AND salida IN ('incompleta','falta') THEN 'incompleta'
            WHEN entrada = 'retardo' AND salida = 'puntual' THEN 'retardo'
            WHEN entrada = 'retardo' AND salida IN ('incompleta','falta') THEN 'incompleta'
            WHEN entrada = 'falta'   AND salida = 'falta'   THEN 'falta'
            ELSE COALESCE(entrada, 'falta')
          END AS estado_final
        FROM por_dia
      ),
      incidencias_dia AS (
        SELECT
          i.usuario_id,
          i.fecha_incidencia::date AS local_date,
          BOOL_OR(COALESCE(v.estado, 'pendiente') <> 'rechazado') AS tiene_no_rechazada
        FROM reloj_checador_incidencias i
        LEFT JOIN reloj_checador_incidencias_validacion v
          ON v.incidencia_id = i.incidencia_id
        INNER JOIN (SELECT local_date FROM dias_distintos) dd
          ON dd.local_date = i.fecha_incidencia::date
        WHERE i.usuario_id = $1
        GROUP BY i.usuario_id, i.fecha_incidencia::date
      )
      SELECT
        e.local_date::text AS fecha,
        e.estado_final
      FROM estado e
      LEFT JOIN incidencias_dia id
        ON id.usuario_id = e.usuario_id AND id.local_date = e.local_date
      WHERE e.estado_final IN ('falta','retardo','incompleta')
        AND COALESCE(id.tiene_no_rechazada, FALSE) = FALSE
      ORDER BY e.local_date DESC;
    `;

    const { rows } = await pool.query(sql, [usuarioId]);
    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("Error al obtener fechas elegibles (últimos 30):", err);
    return res.status(500).json({ error: "Error del servidor." });
  }
};
