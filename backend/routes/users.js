// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming User model exists
const Ngo = require('../models/NgoModel'); // Import Ngo model for NGO login
const mongoose = require('mongoose'); // Import mongoose to use mongoose.Types.ObjectId

// Define the threshold for a user to be considered globally spammed
const USER_SPAM_THRESHOLD = 2; // Set to 2 for easier testing; change to 3 if that's the desired production threshold

// Placeholder for basic NGO authentication (for login only)
const checkNgoCredentials = async (email, password) => {
  const ngo = await Ngo.findOne({ email });
  if (ngo && ngo.password === password) { // IMPORTANT: In production, hash and compare passwords using bcrypt
    return ngo;
  }
  return null;
};

// NEW: Middleware for NGO authentication (Made async to use await for Ngo.findById)
const ngoAuthMiddleware = async (req, res, next) => {
  const ngoId = req.headers['x-ngo-id'];
  if (!ngoId) {
    return res.status(401).json({ error: 'Unauthorized: NGO ID is required for this action.' });
  }
  try {
    // Validate that ngoId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid NGO ID format.' });
    }
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


// POST /api/users - Create a new user or update if exists (upsert)
router.post('/', async (req, res) => {
  try {
    const { uid, firstName, lastName, email } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: uid }, // Find a user by uid
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if no document matches the filter
        setDefaultsOnInsert: true // Apply schema's default values for new document
      }
    );

    // Check if user is marked as globally spammed after fetching/creating them
    if (user && user.isGloballySpammed) {
      return res.status(403).json({ error: 'Account suspended: This account has been marked as spam.', spamReason: user.spamReason });
    }

    res.status(200).json({ message: 'User saved/updated in MongoDB', user });
  } catch (err) {
    console.error('MongoDB Error (User upsert):', err);
    res.status(500).json({ error: 'Failed to save or update user', details: err.message });
  }
});


// GET /api/users/:uid - Get a user by uid
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('MongoDB Error (Get User by UID):', err);
    res.status(500).json({ error: 'Failed to retrieve user', details: err.message });
  }
});

// NEW: GET /api/users - Get all users (for NGO Dashboard)
router.get('/', ngoAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    console.error('MongoDB Error (Get All Users):', err);
    res.status(500).json({ error: 'Failed to retrieve users', details: err.message });
  }
});


// NEW: POST /api/users/ngo-login - NGO Login
router.post('/ngo-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const ngo = await checkNgoCredentials(email, password);
    if (ngo) {
      res.status(200).json({ message: 'NGO logged in successfully', ngoId: ngo._id });
    } else {
      res.status(401).json({ error: 'Invalid NGO credentials.' });
    }
  } catch (err) {
    console.error('MongoDB Error (NGO Login):', err);
    res.status(500).json({ error: 'Failed to log in NGO', details: err.message });
  }
});

// CORRECTED: PUT /api/users/:uid/update-spam-status - Mark/Unmark user as spam
router.put('/:uid/update-spam-status', ngoAuthMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;
    const { isSpam, spamReason = '' } = req.body; // isSpam is the desired state after the action
    const ngoId = req.ngoId; // NGO ID from the middleware

    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Initialize markedAsSpamByNgos if it doesn't exist
    if (!user.markedAsSpamByNgos) {
      user.markedAsSpamByNgos = [];
    }

    // Convert ngoId to ObjectId for proper comparison and storage
    const ngoObjectId = new mongoose.Types.ObjectId(ngoId);

    const ngoSpamIndex = user.markedAsSpamByNgos.findIndex(entry => entry.ngoId.equals(ngoObjectId)); // Use .equals() for ObjectId comparison

    if (isSpam) { // If the frontend wants to mark as spam
      if (ngoSpamIndex === -1) {
        // Add NGO's spam marking if not already present
        user.markedAsSpamByNgos.push({ ngoId: ngoObjectId, timestamp: new Date(), reason: spamReason });
      } else {
        // Update existing entry (e.g., reason or timestamp)
        user.markedAsSpamByNgos[ngoSpamIndex].reason = spamReason;
        user.markedAsSpamByNgos[ngoSpamIndex].timestamp = new Date();
      }
    } else { // If the frontend wants to unmark as spam
      if (ngoSpamIndex !== -1) {
        // Remove NGO's spam marking
        user.markedAsSpamByNgos.splice(ngoSpamIndex, 1);
      }
    }

    // Recalculate isGloballySpammed based on the updated array length
    user.isGloballySpammed = user.markedAsSpamByNgos.length >= USER_SPAM_THRESHOLD;

    // Set a general spamReason if globally spammed (can be the latest reason, or aggregated)
    if (user.isGloballySpammed) {
        // You could aggregate reasons or just store the latest. Storing latest for simplicity.
        user.spamReason = spamReason || `Marked by ${user.markedAsSpamByNgos.length} NGOs.`;
    } else {
        user.spamReason = undefined; // Clear reason if not globally spammed
    }

    await user.save(); // Save the updated user document

    res.status(200).json({ message: `User spam status updated by NGO ${ngoId}`, user });
  } catch (err) {
    console.error('MongoDB Error (Update User Spam Status):', err);
    res.status(500).json({ error: 'Failed to update user spam status', details: err.message });
  }
});


// NEW: PUT /api/users/:uid/increment-badge-count (Internal/Admin use)
router.put('/:uid/increment-badge-count', ngoAuthMiddleware, async (req, res) => { // Added ngoAuthMiddleware
  try {
    const { uid } = req.params;

    const user = await User.findOneAndUpdate(
      { uid: uid },
      { $inc: { badgeCount: 1 } }, // Increment badgeCount by 1
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User badge count incremented', user });
  } catch (err) {
    console.error('MongoDB Error (Increment Badge Count):', err);
    res.status(500).json({ error: 'Failed to increment badge count', details: err.message });
  }
});


module.exports = router;
