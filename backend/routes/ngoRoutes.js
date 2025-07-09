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
router.put('/:id/subscription', async (req, res) => {
  try {
    const ngoId = req.params.id;
    const { subscriptionTier } = req.body;

    if (!['free', 'premium'].includes(subscriptionTier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const updateFields = { subscriptionTier };
    if (subscriptionTier === 'premium') {
      updateFields.maxZones = 999; // Set a high limit for premium
    } else {
      updateFields.maxZones = 2; // Revert to free tier limit
    }

    const ngo = await Ngo.findByIdAndUpdate(
      ngoId,
      updateFields,
      { new: true, select: '-password' }
    );

    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.status(200).json({ message: 'Subscription tier updated successfully', ngo });
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
