const pool = require("../db");

const registrarSedes = async(req, res) => {
    const { nombre, direccion, ubicacion_lat, ubicacion_lon, rango_metros } = req.body;

    try {
        await pool.query(
            `INSERT INTO Sedes (nombre, direccion, ubicacion_lat, ubicacion_lon, rango_metros)
            VALUES ($1, $2, $3, $4, $5)`,
            [nombre, direccion, ubicacion_lat, ubicacion_lon, rango_metros] 
        );

        res.status(201).json({ mensaje: 'Rgeistro de sede guarda'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al guardar regsitro de sede'})
    }
};

module.exports = {
    registrarSedes
}