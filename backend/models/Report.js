const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['ramp', 'elevator', 'restroom', 'parking', 'entrance', 'pathway', 'other']
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  latitude: { // Ensure these match the frontend payload 'lat' and 'lng'
    type: Number,
    required: true
  },
  longitude: { // Ensure these match the frontend payload 'lat' and 'lng'
    type: Number,
    required: true
  },
  reportedBy: { // Firebase UID of the user who reported
    type: String,
    required: true
  },
  userName: { // Denormalized user name for display
    type: String,
    default: 'Anonymous'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  placeName: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  googleMapsLink: {
    type: String,
    trim: true
  },
  notificationStatus: {
    type: String,
    enum: ['none', 'pending', 'sent'],
    default: 'none'
  },
  userComments: [ // Array of comments by other users on this report
    {
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      commentText: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      likedBy: [{ type: String }] // Array of userIds who liked this comment
    }
  ],
  trustedBy: [{ // Array of userIds who 'trusted' this report
    type: String
  }],
  // NEW FIELDS FOR NGO DASHBOARD
  verifiedByNgos: [ // Array of NGOs who have verified this report
    {
      ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo', required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  markedAsSpamByNgos: [ // Array of NGOs who have marked this report as spam
    {
      ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo', required: true },
      timestamp: { type: Date, default: Date.now },
      reason: { type: String } // Optional reason for spamming
    }
  ],
  isNgoReport: { // Flag to indicate if the report was submitted by an NGO
    type: Boolean,
    default: false
  },
  ngoReporterId: { // Stores the ObjectId of the NGO if it's an NGO report
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo',
    default: null // Can be null if it's a regular user report
  }
}, {
  timestamps: false // We are managing timestamp manually for better control
});

// Create a 2dsphere index for geospatial queries if you plan to use them
reportSchema.index({ latitude: 1, longitude: 1 }); // Basic index for lat/lng

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
