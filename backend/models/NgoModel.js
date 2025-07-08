// backend/models/NgoModel.js
const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // IMPORTANT: In production, store hashed passwords using bcrypt
  name: { type: String, required: true },
  // Add other NGO specific fields as needed, e.g., registrationNumber, contactInfo
}, {
  timestamps: true
});

module.exports = mongoose.model('Ngo', ngoSchema);