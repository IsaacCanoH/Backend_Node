const pool = require('../db');

const crearTipoBase = async (req, res) => {
    try {
        const { tipo } = req.body;

        if (!tipo) {
            return res.status(400).json({ mensaje: "El tipo de base es obligatorio" });
        }

        const query = 'INSERT INTO tipo_base (tipo) VALUES ($1) RETURNING *';
        const values = [tipo];

        const result = await pool.query(query, values);

        res.status(201).json({
            mensaje: 'Tipo de base creada exitosamente',
            tipobase: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el tipo de base' });
    }
}

const obtenerTipoBase = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_base ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los tipos de bases' });
    }
}

module.exports = {
    crearTipoBase,
    obtenerTipoBase
}
