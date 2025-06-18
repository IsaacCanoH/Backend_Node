const pool = require("../db");
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarQRPorCorreo = async (req, res) => {
  try {
    const { id } = req.params;

    // Generar JWT que solo firma la sede_id
    const token = jwt.sign({ sede_id: id }, process.env.JWT_SECRET, { expiresIn: '10m' });

    // Contenido del QR (JSON en texto plano)
    const qrPayload = JSON.stringify({ sede_id: id, token });

    // Convertir a QR
    const qrImage = await QRCode.toDataURL(qrPayload);

    // Enviar por correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'isac.c.2586@gmail.com', // puedes parametrizarlo luego
      subject: `Código QR de asistencia - sede ${id}`,
      html: `<p>Escanea este QR para registrar la asistencia:</p><img src="${qrImage}" alt="QR Asistencia"/>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'QR generado y enviado correctamente', qrData: qrPayload });
  } catch (error) {
    console.error('Error al generar/enviar QR:', error);
    res.status(500).json({ error: 'No se pudo enviar el QR' });
  }
};


module.exports = {
    registrarSedes,
    enviarQRPorCorreo
}