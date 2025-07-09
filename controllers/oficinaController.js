const pool = require('../db');

const crearOficina = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre de la oficina es obligatorio.' });
    }

    const query = 'INSERT INTO oficinas (nombre) VALUES ($1) RETURNING *';
    const values = [nombre];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Oficina creada exitosamente',
      oficina: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    // Si es por duplicado
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'Ya existe una oficina con ese nombre.' });
    }

    res.status(500).json({ mensaje: 'Error al crear la oficina.' });
  }
};

const obtenerOficinas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM oficinas ORDER BY id ASC');

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las oficinas.' });
  }
};

module.exports = {
  crearOficina,
  obtenerOficinas
};
