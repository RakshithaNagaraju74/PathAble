// backend/routes/ngoRoutes.js
const express = require('express');
const router = express.Router();
const Ngo = require('../models/NgoModel'); // Make sure the path to NgoModel is correct

// Assuming you have an ngoAuthMiddleware defined elsewhere or will define it here
// For demonstration, let's include a basic placeholder if not already in this file
const ngoAuthMiddleware = async (req, res, next) => {
  const ngoId = req.headers['x-ngo-id'];
  if (!ngoId) {
    return res.status(401).json({ error: 'Unauthorized: NGO ID is required for this action.' });
  }
  try {
    const ngoExists = await Ngo.findById(ngoId);
    if (!ngoExists) {
      return res.status(401).json({ error: 'Unauthorized: Invalid NGO ID.' });
    }
    req.ngoId = ngoId; // Attach verified ngoId to request
    next();
  } catch (error) {
    console.error("NGO Auth Middleware Error:", error);
    return res.status(500).json({ error: 'Server error during NGO authentication.' });
  }
};


// Route to get NGO details by ID
router.get('/:id', async (req, res) => {
  try {
    const ngoId = req.params.id;
    // Include the new 'isVerified' field in the select statement
    const ngo = await Ngo.findById(ngoId).select('-password');

    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.status(200).json(ngo);
  } catch (error) {
    console.error('Error fetching NGO details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update NGO subscription tier
router.put('/:id/subscription', ngoAuthMiddleware, async (req, res) => { // Added ngoAuthMiddleware
  try {
    const ngoId = req.params.id;
    // Ensure the logged-in NGO is updating its own subscription (basic security)
    if (req.ngoId !== ngoId) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own subscription.' });
    }

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

// NEW: Route to update NGO's verification status (e.g., by an admin)
// IMPORTANT: In a real application, this route should be protected by a dedicated admin authentication middleware.
// For demonstration, we'll use ngoAuthMiddleware, but be aware of the security implications.
router.put('/:id/verify-status', ngoAuthMiddleware, async (req, res) => {
  try {
    const ngoId = req.params.id;
    const { isVerified } = req.body; // Expecting { isVerified: true/false }

    // In a real app, you'd add an admin role check here:
    // if (!req.user.isAdmin) { return res.status(403).json({ error: 'Forbidden: Admin access required.' }); }

    const ngo = await Ngo.findByIdAndUpdate(
      ngoId,
      { isVerified: isVerified },
      { new: true, select: '-password' } // Return the updated NGO, excluding password
    );

    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.status(200).json({ message: `NGO verification status updated to ${isVerified}`, ngo });
  } catch (error) {
    console.error('Error updating NGO verification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
