const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true
  });

  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
};
