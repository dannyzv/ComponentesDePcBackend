require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const componentRoutes = require('./routes/componentRoutes');
const compatibilityRoutes = require('./routes/compatibilityRoutes');
const buildRoutes = require('./routes/buildRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ComponentesDePcBackend' });
});

app.use('/api/components', componentRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/builds', buildRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API disponible en http://localhost:${PORT}`);
  });
});

module.exports = app;