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
const qrSedeRoutes = require("./routes/qrSedeRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/sede', sedeRoutes);
app.use('/api/qrsede',qrSedeRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
