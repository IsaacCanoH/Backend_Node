const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const sedeRoutes = require("./routes/sedeRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/sede', sedeRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
