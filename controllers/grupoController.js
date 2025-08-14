const pool = require("../db");

exports.crearGrupo = async (req, res) => {
    const { nombre, descripcion, creado_por } = req.body;

    try {
        const query = `
      INSERT INTO reloj_checador_grupos (nombre, descripcion, creado_por)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
        const values = [nombre, descripcion, creado_por];
        const { rows } = await pool.query(query, values);

        res.status(201).json({
            status: "success",
            message: "Grupo creado correctamente",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error al crear grupo:", error.message);
        res.status(500).json({
            status: "error",
            message: "No se pudo crear el grupo",
            error: error.message,
        });
    }
};

exports.editarGrupo = async (req, res) => {
    const { grupo_id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
        const query = `
      UPDATE reloj_checador_grupos
      SET nombre = $1, descripcion = $2
      WHERE grupo_id = $3
      RETURNING *;
    `;
        const values = [nombre, descripcion, grupo_id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Grupo no encontrado",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Grupo actualizado correctamente",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error al editar grupo:", error.message);
        res.status(500).json({
            status: "error",
            message: "No se pudo editar el grupo",
            error: error.message,
        });
    }
};

exports.obtenerGruposPorCreador = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const query = `
      SELECT grupo_id, nombre, descripcion, creado_en
      FROM reloj_checador_grupos
      WHERE creado_por = $1
      ORDER BY creado_en DESC;
    `;
    const { rows } = await pool.query(query, [usuario_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No se encontraron grupos creados por este usuario",
      });
    }

    res.status(200).json({
      status: "success",
      grupos: rows,
    });
  } catch (error) {
    console.error("Error al obtener grupos por creador:", error.message);
    res.status(500).json({
      status: "error",
      message: "No se pudo obtener los grupos",
      error: error.message,
    });
  }
};

exports.eliminarGrupo = async (req, res) => {
  const { grupo_id } = req.params;

  try {
    // Primero verifica si el grupo existe
    const verificarQuery = `
      SELECT * FROM reloj_checador_grupos
      WHERE grupo_id = $1;
    `;
    const { rows: grupoExistente } = await pool.query(verificarQuery, [grupo_id]);

    if (grupoExistente.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Grupo no encontrado",
      });
    }

    // Elimina el grupo
    const eliminarQuery = `
      DELETE FROM reloj_checador_grupos
      WHERE grupo_id = $1;
    `;
    await pool.query(eliminarQuery, [grupo_id]);

    res.status(200).json({
      status: "success",
      message: "Grupo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar grupo:", error.message);
    res.status(500).json({
      status: "error",
      message: "No se pudo eliminar el grupo",
      error: error.message,
    });
  }
};

exports.obtenerUsuariosRelacionados = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Paso 1: Obtener info del usuario administrador
    const adminQuery = `
      SELECT rol_usuario, id_direccion, id_coordinacion, id_oficina
      FROM reloj_checador_usuarios
      WHERE usuario_id = $1
    `;
    const { rows: adminRows } = await pool.query(adminQuery, [usuario_id]);

    if (adminRows.length === 0) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    }

    const admin = adminRows[0];

    if (admin.rol_usuario !== "enlace-administrativo") {
      return res.status(403).json({ status: "error", message: "No autorizado para esta operación" });
    }

    // Paso 2: Buscar usuarios con mismos datos de zona
    const userQuery = `
      SELECT usuario_id, nombre, ap_paterno, ap_materno, email, usuario, rol_usuario
      FROM reloj_checador_usuarios
      WHERE id_direccion = $1 AND id_coordinacion = $2 AND id_oficina = $3
        AND usuario_id != $4
    `;

    const values = [
      admin.id_direccion,
      admin.id_coordinacion,
      admin.id_oficina,
      usuario_id
    ];

    const { rows: relatedUsers } = await pool.query(userQuery, values);

    res.status(200).json({
      status: "success",
      total: relatedUsers.length,
      usuarios: relatedUsers
    });
  } catch (error) {
    console.error("Error al obtener usuarios relacionados:", error.message);
    res.status(500).json({
      status: "error",
      message: "No se pudo obtener usuarios relacionados",
      error: error.message
    });
  }
};
