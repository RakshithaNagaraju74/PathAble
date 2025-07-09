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

  // NEW: Premium User Fields for Freemium Model
  isPremium: { type: Boolean, default: false }, // True if user has a premium subscription
  reportsViewedCount: { type: Number, default: 0 }, // Tracks how many reports the free user has viewed in the current period
  lastReportsViewReset: { type: Date, default: Date.now }, // Timestamp for the last reset of reportsViewedCount
  premium: { // Added premium field as per request
    type: Boolean,
    default: false,
  },

  // Existing fields for spam management
  markedAsSpamByNgos: [{
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo' },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String } // Optional reason for spamming
  }],
  // Global spam status for the user, triggered by a threshold of NGO spam markings
  isGloballySpammed: { type: Boolean, default: false },
  spamReason: { type: String }, // General reason if globally spammed (optional, could be calculated or stored as latest)
});

module.exports = mongoose.model('User', userSchema);
