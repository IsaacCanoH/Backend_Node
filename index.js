const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

// Middleware global
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer();
app.use(upload.none());

// Rutas
const authRoutes = require('./routes/authRoutes');
const sedeRoutes = require("./routes/sedeRoutes");
const empleadoRoutes = require('./routes/empleadoRoutes');
const oficinaRoutes = require('./routes/oficinaRoutes');
const tipoBaseRoutes = require("./routes/tipoBaseRoutes");
const registroAsistenciaRoutes = require("./routes/registroAsistenciasRoutes");
const incidenciasRoutes = require("./routes/incidenciasRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");
const fotosRostroRoutes = require('./routes/fotosRostroRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/sede', sedeRoutes);
app.use('/api/empleado', empleadoRoutes);
app.use('/api/oficina', oficinaRoutes);
app.use('/api/tipobase', tipoBaseRoutes);
app.use('/api/asistencias', registroAsistenciaRoutes);
app.use('/api/inicidencia', incidenciasRoutes);
app.use('/api/notificacion', notificacionesRoutes);
app.use('/api/fotosRostros', fotosRostroRoutes);

// Servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
