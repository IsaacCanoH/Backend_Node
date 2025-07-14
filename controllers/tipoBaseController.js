const pool = require('../db');

exports.obtenerTipoBase = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reloj_checador_catalogo_tipo_base ORDER BY id ASC');
        res.json({ status: "success", data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los tipos de bases' });
    }
}

exports.obtenerDirecciones = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reloj_checador_catalogo_direcciones");
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Obtener coordinaciones por dirección
exports.obtenerCoordinacionesPorDireccion = async (req, res) => {
  const { direccionId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM reloj_checador_catalogo_coordinaciones WHERE direccion_id = $1",
      [direccionId]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Obtener jefaturas por coordinación
exports.obtenerJefaturasPorCoordinacion = async (req, res) => {
  const { coordinacionId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM reloj_checador_catalogo_jefaturas WHERE coordinacion_id = $1",
      [coordinacionId]
    );
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.obtenerHorario = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reloj_checador_horarios ORDER BY id ASC');

        // Cambiar nombres de campos
        const horarios = result.rows.map(horario => ({
            id: horario.id,
            start: horario.ckeck_in,
            tolerance: horario.tolerance,
            end: horario.check_out
        }));

        res.json({ status: "success", data: horarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los tipos de horarios' });
    }
}


exports.obtenerOficina = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reloj_checador_catalogo_oficinas ORDER BY id ASC');
        res.json({ status: "success", data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los tipos de horarios' });
    }
}