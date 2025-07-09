// routes/zones.js
const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');
const mongoose = require('mongoose');

// Middleware to ensure NGO ID is present
const ngoAuthMiddleware = (req, res, next) => {
  const ngoId = req.header('X-NGO-ID');
  if (!ngoId) {
    return res.status(401).json({ error: 'Missing X-NGO-ID header' });
  }
  req.ngoId = ngoId;
  next();
};

// POST /api/zones - Save a new zone (This should remain protected by ngoAuthMiddleware)
router.post('/', ngoAuthMiddleware, async (req, res) => {
  const ngoId = req.ngoId;
  const { name, coordinates } = req.body; // 'coordinates' from frontend is [[lat, lng], ...]

  if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) { // A polygon needs at least 3 distinct points + closing point
    return res.status(400).json({ error: 'Missing or invalid required fields: name or coordinates (polygon needs at least 3 points)' });
  }

  // Validate and convert ngoId to ObjectId
  let ngoObjectId;
  try {
    ngoObjectId = new mongoose.Types.ObjectId(ngoId);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid NGO ID format' });
  }

  // Convert client-side coordinates (array of [lat, lng]) to GeoJSON Polygon format
  // GeoJSON Polygon stores coordinates as an array of rings, where each ring is an array of [longitude, latitude] pairs.
  // The first and last points in each ring must be identical.
  // Assuming 'coordinates' from frontend is an array of Leaflet-style [latitude, longitude] pairs for a single ring.
  const geoJsonCoordinates = [
    coordinates.map(point => [Number(point[1]), Number(point[0])]) // Convert [lat, lng] to [lng, lat] and ensure numbers
  ];
  // Ensure the polygon is closed (first and last coordinate are the same)
  if (geoJsonCoordinates[0].length > 0 && (geoJsonCoordinates[0][0][0] !== geoJsonCoordinates[0][geoJsonCoordinates[0].length - 1][0] || geoJsonCoordinates[0][0][1] !== geoJsonCoordinates[0][geoJsonCoordinates[0].length - 1][1])) {
    geoJsonCoordinates[0].push(geoJsonCoordinates[0][0]);
  }


  const newZone = new Zone({
    name,
    coordinates: {
      type: 'Polygon',
      coordinates: geoJsonCoordinates
    },
    ngoId: ngoObjectId,
  });

  try {
    const savedZone = await newZone.save();
    res.status(201).json(savedZone);
  } catch (err) {
    console.error('MongoDB Error (Save Zone):', err);
    if (err.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'A zone with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to save zone', details: err.message });
  }
});


// GET /api/zones - Fetch all zones
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find({}); // Fetch all zones
    const formattedZones = zones.map(zone => ({
      _id: zone._id, // Use _id for consistency with frontend key
      name: zone.name,
      // Convert GeoJSON coordinates [[[lng, lat]]] to Leaflet's expected [[lat, lng]]
      // The GeoJSON `coordinates` field is an array of rings. For a simple polygon, it's `[outerRing]`.
      // The outer ring is an array of points, each point is `[longitude, latitude]`.
      // We need to convert each point to `[latitude, longitude]` for Leaflet.
      coordinates: zone.coordinates.coordinates[0].map(coord => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
      ngoId: zone.ngoId, // Include ngoId
      createdAt: zone.createdAt,
      // Add other properties if needed for display
    }));
    res.status(200).json(formattedZones);
  } catch (err) {
    console.error('Error fetching zones:', err);
    res.status(500).json({ error: 'Failed to fetch zones', details: err.message });
  }
});

// NEW: GET /api/zones/export/geojson - Export zones as GeoJSON
router.get('/export/geojson', ngoAuthMiddleware, async (req, res) => {
  const ngoId = req.ngoId;

  let ngoObjectId;
  try {
    ngoObjectId = new mongoose.Types.ObjectId(ngoId);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid NGO ID format' });
  }

  try {
    const zones = await Zone.find({ ngoId: ngoObjectId });

    const geoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: zones.map(zone => ({
        type: 'Feature',
        geometry: zone.coordinates, // This is already GeoJSON Polygon
        properties: {
          id: zone._id,
          name: zone.name,
          ngoId: zone.ngoId.toString(),
          createdAt: zone.createdAt,
          // Add any other properties you want to include
        }
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=ngo_zones.geojson');
    res.status(200).json(geoJsonFeatureCollection);

  } catch (err) {
    console.error('Error exporting zones GeoJSON:', err);
    res.status(500).json({ error: 'Failed to export zones GeoJSON', details: err.message });
  }
});


// PUT /api/zones/:id - Update an existing zone (Protected)
router.put('/:id', ngoAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const ngoId = req.ngoId; // From middleware
  const { name, coordinates } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid zone ID format' });
  }

  if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
    return res.status(400).json({ error: 'Missing or invalid required fields: name or coordinates (polygon needs at least 3 points)' });
  }

  // Convert client-side coordinates to GeoJSON Polygon format
  const geoJsonCoordinates = [
    coordinates.map(point => [Number(point[1]), Number(point[0])]) // Convert [lat, lng] to [lng, lat] and ensure numbers
  ];
  if (geoJsonCoordinates[0].length > 0 && (geoJsonCoordinates[0][0][0] !== geoJsonCoordinates[0][geoJsonCoordinates[0].length - 1][0] || geoJsonCoordinates[0][0][1] !== geoJsonCoordinates[0][geoJsonCoordinates[0].length - 1][1])) {
    geoJsonCoordinates[0].push(geoJsonCoordinates[0][0]);
  }

  try {
    // Ensure the NGO trying to update the zone is the one that manages it
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    if (zone.ngoId.toString() !== ngoId) {
      return res.status(403).json({ error: 'Forbidden: You do not manage this zone.' });
    }

    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      {
        name,
        coordinates: {
          type: 'Polygon',
          coordinates: geoJsonCoordinates
        }
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedZone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.status(200).json(updatedZone);
  } catch (err) {
    console.error('MongoDB Error (Update Zone):', err);
    if (err.code === 11000) {
        return res.status(409).json({ error: 'A zone with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to update zone', details: err.message });
  }
});


// DELETE /api/zones/:id - Delete a zone (Protected)
router.delete('/:id', ngoAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const ngoId = req.ngoId; // From middleware

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid zone ID format' });
  }

  try {
    // Ensure the NGO trying to delete the zone is the one that manages it
    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    if (zone.ngoId.toString() !== ngoId) {
      return res.status(403).json({ error: 'Forbidden: You do not manage this zone.' });
    }

    const deletedZone = await Zone.findByIdAndDelete(id);
    if (!deletedZone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (err) {
    console.error('MongoDB Error (Delete Zone):', err);
    res.status(500).json({ error: 'Failed to delete zone', details: err.message });
  }
});

module.exports = router;
