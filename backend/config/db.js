const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB using the URI defined in environment
 * variables. Exits the process on failure since the API cannot function
 * without a database connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
