// backend/routes/ngoRoutes.js
const express = require('express');
const router = express.Router();
const Ngo = require('../models/NgoModel'); // Make sure the path to NgoModel is correct

// Route to get NGO details by ID
router.get('/:id', async (req, res) => {
  try {
    const ngoId = req.params.id;
    const ngo = await Ngo.findById(ngoId).select('-password'); // Exclude password from the response

    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.status(200).json(ngo);
  } catch (error) {
    console.error('Error fetching NGO details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
