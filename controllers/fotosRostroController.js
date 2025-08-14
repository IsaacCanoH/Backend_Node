const pool = require('../db');

// Guardar foto de rostro
const guardarFotoRostro = async (req, res) => {
    try {
        const { usuario_id, imagen_base64, descriptor } = req.body;


        if (!usuario_id || !imagen_base64 || !Array.isArray(descriptor) || descriptor.length === 0) {
            return res.status(400).json({ mensaje: 'Faltan datos requeridos o descriptor inválido' });
        }

        await pool.query(
            `INSERT INTO reloj_checador_fotos_rostro (usuario_id, imagen_base64, descriptor) 
             VALUES ($1, $2, $3::jsonb)`,
            [
                usuario_id,
                imagen_base64,
                JSON.stringify(descriptor) 
            ]
        );

        res.status(201).json({ mensaje: 'Foto y descriptor guardados correctamente' });

    } catch (error) {
        console.error('❌ Error al guardar foto de rostro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const obtenerFotoRostro = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const result = await pool.query(
            `SELECT imagen_base64, descriptor 
             FROM reloj_checador_fotos_rostro 
             WHERE usuario_id = $1 
             ORDER BY fecha_registro DESC 
             LIMIT 1`,
            [usuario_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró foto de rostro para este usuario' });
        }

        const { imagen_base64, descriptor } = result.rows[0];

        res.status(200).json({
            imagen_base64,
            descriptor
        });

    } catch (error) {
        console.error('❌ Error al obtener foto de rostro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    guardarFotoRostro,
    obtenerFotoRostro
};
