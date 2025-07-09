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
  // NEW: Added city, district, postalCode fields as they are now being sent from frontend
  city: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  district: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  postalCode: {
    type: String,
    trim: true,
    default: 'N/A'
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
  // UPDATED: verifiedByNgos to include ngoName and isNgoPremium status
  verifiedByNgos: [ // Array of NGOs who have verified this report
    {
      ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo', required: true },
      ngoName: { type: String }, // Denormalized NGO name for display
      isNgoPremium: { type: Boolean, default: false }, // NEW: Is the verifying NGO a premium/verified NGO?
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
  },
  // NEW: Official NGO Response field
  officialNgoResponse: {
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo' },
    ngoName: { type: String }, // Denormalized NGO name for easier display
    responseText: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  // NEW FIELDS FOR AI VERIFICATION (Hugging Face API Integration)
  aiObjectDetection: {
    success: { type: Boolean }, // True if accessibility features were detected
    features: [{ // Array of detected features
      label: { type: String }, // e.g., "ramp", "elevator"
      score: { type: String } // Confidence score as a string (e.g., "98.75")
    }],
    message: { type: String } // Message if no features detected or an error occurred
  },
  aiImageCaption: { // Stores the generated image caption
    type: String
  },
  aiVQA: { // Stores the Visual Question Answering result
    question: { type: String },
    answer: { type: String }
  },
  // NEW: Teachable Machine Prediction field
  teachableMachinePrediction: {
    className: { type: String },
    probability: { type: String } // Storing as string to keep "XX.XX" format
  },
}, {
  timestamps: false // We are managing timestamp manually for better control
});

// Create a 2dsphere index for geospatial queries if you plan to use them
// This is good practice if you intend to perform location-based queries in MongoDB
// reportSchema.index({ location: '2dsphere' }); // If you add a GeoJSON 'location' field
reportSchema.index({ latitude: 1, longitude: 1 }); // Basic index for lat/lng for now

module.exports = mongoose.model('Report', reportSchema);
