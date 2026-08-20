const mongoose = require('mongoose');
const app = require('../src/index');
const connectDB = require('../src/config/db');

let connectionPromise = null;

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureConnection();
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
  }
  return app(req, res);
};