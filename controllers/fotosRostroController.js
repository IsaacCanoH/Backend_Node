const pool = require('../db'); // Asegúrate de tener tu pool de conexión PostgreSQL

// Guardar foto de rostro
const guardarFotoRostro = async (req, res) => {
    try {
        const { usuario_id, imagen_base64 } = req.body;

        if (!usuario_id || !imagen_base64) {
            return res.status(400).json({ mensaje: 'usuario_id e imagen_base64 son requeridos' });
        }

        await pool.query(
            'INSERT INTO reloj_checador_fotos_rostro (usuario_id, imagen_base64) VALUES ($1, $2)',
            [usuario_id, imagen_base64]
        );

        res.status(200).json({ mensaje: 'Foto de rostro guardada correctamente' });
    } catch (error) {
        console.error('Error al guardar foto de rostro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Obtener foto de rostro por usuario_id
const obtenerFotoRostro = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const result = await pool.query(
            'SELECT * FROM reloj_checador_fotos_rostro WHERE usuario_id = $1 ORDER BY fecha_registro DESC LIMIT 1',
            [usuario_id]
        );

        if (result.rows.length === 0) {
            // Devuelve un 200 con imagen_base64 null
            return res.status(200).json({ imagen_base64: null });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener foto de rostro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};


module.exports = {
    guardarFotoRostro,
    obtenerFotoRostro
};
