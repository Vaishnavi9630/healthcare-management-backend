const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDb = async () => {
  try {
    await mongoose.connect(db);
    console.log('mongo db connected');
  } catch (err) {
    console.log('err---->', err);
    process.exit(1);
  }
}

module.exports = connectDb;