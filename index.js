const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const sedeRoutes = require("./routes/sedeRoutes");
const empleadoRoutes = require('./routes/empleadoRoutes');
const oficinaRoutes = require('./routes/oficinaRoutes');
const tipoBaseRoutes = require("./routes/tipoBaseRoutes");
const registroAsistenciaRoutes = require("./routes/registroAsistenciasRoutes");
const incidenciasRoutes = require("./routes/incidenciasRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/sede', sedeRoutes);
app.use('/api/empleado', empleadoRoutes);
app.use('/api/oficina', oficinaRoutes);
app.use('/api/tipobase', tipoBaseRoutes);
app.use('/api/registrarasistencia', registroAsistenciaRoutes);
app.use('/api/inicidencia', incidenciasRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
