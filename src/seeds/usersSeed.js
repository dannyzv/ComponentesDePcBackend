const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const users = [
  { name: 'Admin PC Builder', email: 'admin@pcbuilder.com', password: 'admin123' },
  { name: 'Usuario Demo', email: 'demo@pcbuilder.com', password: 'demo123' },
];

async function seed() {
  await connectDB();

  await User.deleteMany({});

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 10);
    await User.create({ name: user.name, email: user.email, password });
    console.log(`  Usuario creado: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('Seed de usuarios completado.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});