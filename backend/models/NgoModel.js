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
  // You might add more freemium-related fields here, e.g.,
  // analyticsAccess: { type: String, enum: ['basic', 'advanced'], default: 'basic' },
  // supportTier: { type: String, enum: ['standard', 'technical', 'priority'], default: 'standard' },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Ngo', ngoSchema);