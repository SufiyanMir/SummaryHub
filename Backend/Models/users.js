const mongoose = require('mongoose');
const { Schema } = mongoose;

const summarySchema = new Schema({
  id: { type: String, unique: true },
  text: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  posts: { type: [summarySchema], default: [] },
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
