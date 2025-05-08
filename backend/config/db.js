const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const DB_URI = process.env.DB_URI;

  if (!DB_URI) {
    console.error('DB_URI not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;