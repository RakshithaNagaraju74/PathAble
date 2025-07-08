// models/Zone.js
const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Define coordinates as a GeoJSON Polygon object
  coordinates: {
    type: {
      type: String, // Explicitly String type for 'type'
      enum: ['Polygon'], // Ensure it's always 'Polygon'
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of rings, each ring is an array of [longitude, latitude] pairs
      required: true
    }
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo', // Reference to an NGO model if you have one
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a geospatial index on the 'coordinates.coordinates' field
// This tells MongoDB to index the actual coordinate array within the GeoJSON object
zoneSchema.index({ coordinates: '2dsphere' });


const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
