// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  password: {
    type: String,
    required: true
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Static method to validate login
userSchema.statics.findAndValidate = async function (username, password) {
  const user = await this.findOne({ username });
  if (!user) return false;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : false;
};

module.exports = mongoose.model('User', userSchema);
