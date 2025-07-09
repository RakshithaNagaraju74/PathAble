// File: backend/models/NgoModel.js
const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  managedZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  }],
  // NEW FREEMIUM FIELDS
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  maxZones: {
    type: Number,
    default: 2, // Free tier limit
  },
  // NEW: Field to indicate if the NGO itself is verified (e.g., a premium feature)
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Ngo', ngoSchema);
