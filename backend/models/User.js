// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  displayName: { type: String }, // Can be used as a fallback if first/last not set
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  isNgoAccount: { type: Boolean, default: false }, // If true, this user is an NGO
  // NEW: Array to store which NGOs have marked this user as spam
  markedAsSpamByNgos: [{
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo' },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String } // Optional reason for spamming
  }],
  // NEW: Global spam status for the user, triggered by a threshold of NGO spam markings
  isGloballySpammed: { type: Boolean, default: false },
  spamReason: { type: String }, // General reason if globally spammed (optional, could be calculated or stored as latest)
});

module.exports = mongoose.model('User', userSchema);
