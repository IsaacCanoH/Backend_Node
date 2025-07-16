const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS correcta
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const sedeRoutes = require("./routes/sedeRoutes");
const empleadoRoutes = require('./routes/empleadoRoutes');
const oficinaRoutes = require('./routes/oficinaRoutes');
const tipoBaseRoutes = require("./routes/tipoBaseRoutes");
const registroAsistenciaRoutes = require("./routes/registroAsistenciasRoutes");
const incidenciasRoutes = require("./routes/incidenciasRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");
const fotosRostroRoutes = require('./routes/fotosRostroRoutes');

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/sede', sedeRoutes);
app.use('/api/empleado', empleadoRoutes);
app.use('/api/oficina', oficinaRoutes);
app.use('/api/tipobase', tipoBaseRoutes);
app.use('/api/registrarasistencia', registroAsistenciaRoutes);
app.use('/api/inicidencia', incidenciasRoutes);
app.use('/api/notificacion', notificacionesRoutes);
app.use('/api/fotosRostros', fotosRostroRoutes);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
