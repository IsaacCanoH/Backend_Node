const pool = require('../db');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generarQRSede = async (req, res) => {
  const { sede_id, correo_destino } = req.body;

  if (!sede_id || !correo_destino) {
    return res.status(400).json({ error: 'sede_id y correo_destino son requeridos.' });
  }

  try {
    // 1. Verificar que la sede exista
    const result = await pool.query('SELECT * FROM Sedes WHERE sede_id = $1', [sede_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada.' });
    }

    // 2. Generar token JWT
    const payload = { sede_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

    // 3. Generar QR como imagen PNG (base64)
    const qrDataUrl = await QRCode.toDataURL(token);

    // Convertimos el base64 a buffer de imagen PNG
    const base64Image = qrDataUrl.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // 4. Enviar por correo con adjunto
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o el que uses
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sistema de Asistencia" <${process.env.EMAIL_USER}>`,
      to: correo_destino,
      subject: 'Código QR de Sede',
      text: 'Adjunto encontrarás el código QR para el registro de asistencia de la sede.',
      attachments: [
        {
          filename: `qr_sede_${sede_id}.png`,
          content: imageBuffer,
          contentType: 'image/png',
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'QR generado y enviado por correo exitosamente.',
    });

  } catch (error) {
    console.error('Error generando o enviando QR:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  generarQRSede,
};
