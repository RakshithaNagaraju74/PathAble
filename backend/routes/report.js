// File: report.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Ngo = require('../models/NgoModel');
const Zone = require('../models/Zone'); // Import Zone model
const mongoose = require('mongoose');
const pointInPolygon = require('point-in-polygon'); // For geospatial checks on the backend
const { Parser } = require('json2csv'); // For CSV export

// NEW: Middleware for NGO authentication
const ngoAuthMiddleware = async (req, res, next) => {
  const ngoId = req.headers['x-ngo-id']; // Corrected to only use header for NGO ID
  if (!ngoId) {
    return res.status(401).json({ error: 'Unauthorized: NGO ID is required for this action.' });
  }
  try {
    // Validate that ngoId is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid NGO ID format.' });
    }
    const ngoExists = await Ngo.findById(ngoId); // Assuming Ngo model has findById
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

// POST /api/reports - Add a new accessibility report
router.post('/', async (req, res) => {
  try {
    const {
      type,
      comment,
      imageUrl,
      lat,
      lng,
      reportedBy, // Firebase UID
      placeName,
      address,
      googleMapsLink,
      city, // Added city
      district, // Added district
      postalCode, // Added postalCode
      notificationStatus,
      isNgoReport, // Field to identify NGO reports
      ngoReporterId, // NEW: ID of the NGO that made the report
      // NEW: AI Verification fields
      aiObjectDetection,
      aiImageCaption,
      aiVQA,
      teachableMachinePrediction, // NEW: Teachable Machine Prediction
    } = req.body;

    let userName = 'Unknown';
    let user = null;

    // Lookup user's name by Firebase UID (denormalization)
    user = await User.findOne({ uid: reportedBy });

    // If an NGO is reporting, use a default name or lookup NGO's name
    if (isNgoReport && ngoReporterId) {
        // You might want to fetch the NGO's name here if you have an NGO model with names
        const ngo = await Ngo.findById(ngoReporterId);
        userName = ngo ? `${ngo.name} (NGO)` : 'NGO Report';
    } else if (user) {
      userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.displayName || 'Unnamed User';

      // Prevent spam users from submitting reports (global user spam status)
      if (user.isGloballySpammed) { // Corrected from user.isSpam to user.isGloballySpammed
        return res.status(403).json({ error: 'Forbidden: Your account has been marked as spam and cannot submit reports.' });
      }
    }

    // Explicitly convert lat and lng to Number and handle potential NaN
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude provided.' });
    }

    const newReport = new Report({
      type,
      comment,
      imageUrl,
      latitude: parsedLat, // Ensure field name matches schema
      longitude: parsedLng, // Ensure field name matches schema
      reportedBy,
      userName,
      timestamp: new Date(),
      placeName,
      address,
      googleMapsLink,
      city, // Added city
      district, // Added district
      postalCode, // Added postalCode
      notificationStatus,
      isNgoReport: !!isNgoReport,
      ngoReporterId: isNgoReport ? ngoReporterId : null, // Set NGO reporter ID if it's an NGO report
      userComments: [],
      // NEW: AI Verification fields
      aiObjectDetection,
      aiImageCaption,
      aiVQA,
      teachableMachinePrediction, // NEW: Include Teachable Machine prediction
    });

    await newReport.save();

    res.status(201).json({
      message: '✅ Report saved to MongoDB',
      report: newReport
    });

  } catch (err) {
    console.error('MongoDB Error (Add Report):', err);
    res.status(500).json({ error: 'Failed to add report', details: err.message });
  }
});

// GET /api/reports - Get all accessibility reports (can be filtered for NGO view or general public)
// UPDATED: Added zoneId, startDate, and endDate filters
// GET /api/reports - Get all reports (or filtered/limited)
router.get('/', async (req, res) => {
  try {
    const { ngoView, zoneId, userId: reqUserId } = req.query; // Added userId from query for premium check
    let query = {};

    // If ngoView is true, fetch all reports including spam for NGO dashboard
    if (ngoView === 'true') {
      // No additional filtering for spam reports here, as NGOs need to see them
      // The frontend NGO dashboard will handle the display logic for spam/verified
    } else {
      // For general users, filter out reports marked as spam by any NGO
      query.markedAsSpamByNgos = { $size: 0 }; // Only include reports with no spam markings
    }

    if (zoneId) {
      if (!mongoose.Types.ObjectId.isValid(zoneId)) {
        return res.status(400).json({ error: 'Invalid Zone ID format' });
      }
      const zone = await Zone.findById(zoneId);
      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }

      // Extract coordinates from the Zone model's GeoJSON structure
      const zoneCoordinates = zone.coordinates.coordinates[0]; // Assuming it's a single polygon

      // Find reports within the specified zone
      const reportsInZone = await Report.find({
        latitude: { $ne: null }, // Ensure latitude exists
        longitude: { $ne: null }, // Ensure longitude exists
      });

      const filteredReports = reportsInZone.filter(report => {
        // pointInPolygon expects [x, y] where x is longitude, y is latitude
        return pointInPolygon([report.longitude, report.latitude], zoneCoordinates);
      });

      // Override the query to use the filtered reports' IDs
      query._id = { $in: filteredReports.map(r => r._id) };
    }

    // Premium Access Feature Implementation
    let limit = 10; // Default free limit
    let user;

    if (reqUserId) { // Use reqUserId from query parameter
      user = await User.findOne({ uid: reqUserId });
      if (user && user.premium) {
        limit = 0; // No limit for premium users
      }
    }

    let reportsQuery = Report.find(query).sort({ timestamp: -1 });

    if (limit > 0) {
      reportsQuery = reportsQuery.limit(limit);
    }

    const reports = await reportsQuery.exec();

    res.status(200).json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

// NEW: Route to fetch all reports for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userReports = await Report.find({ reportedBy: userId }).sort({ timestamp: -1 });
    res.status(200).json(userReports);
  } catch (err) {
    console.error('Error fetching user-specific reports:', err);
    res.status(500).json({ error: 'Failed to fetch user reports', details: err.message });
  }
});


// NEW: Add a route to fetch reports submitted by a specific NGO
router.get('/ngo-contributions/:ngoId', ngoAuthMiddleware, async (req, res) => {
  try {
    const { ngoId } = req.params; // The ngoId from the URL (should match req.ngoId from middleware)
    if (req.ngoId !== ngoId) {
        return res.status(403).json({ error: 'Forbidden: You are not authorized to view these reports.' });
    }
    const reports = await Report.find({ isNgoReport: true, ngoReporterId: ngoId }).sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error('MongoDB Error (Fetch NGO Reports):', err);
    res.status(500).json({ error: 'Failed to fetch NGO reports', details: err.message });
  }
});


// Add a new route to get total contributions for a user
router.get('/user/:userId/contributions', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ reportedBy: req.params.userId });
    res.json({ totalContributions: totalReports });
  } catch (err) {
    console.error('MongoDB Error (Fetch User Contributions Count):', err);
    res.status(500).json({ error: 'Failed to fetch user contributions count', details: err.message });
  }
});

// NEW: Add a comment to a report
router.post('/:reportId/comments', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId, userName, commentText } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.userComments.push({ userId, userName, commentText, timestamp: new Date() });
    await report.save();

    res.status(201).json({ message: 'Comment added successfully', userComments: report.userComments });
  } catch (err) {
    console.error('MongoDB Error (Add Comment):', err);
    res.status(500).json({ error: 'Failed to add comment', details: err.message });
  }
});

// NEW: Toggle like on a comment (simplified - in a real app, this might be a PATCH)
router.post('/:reportId/comments/:commentIndex/like', async (req, res) => {
    try {
        const { reportId, commentIndex } = req.params;
        const { userId } = req.body;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        if (!report.userComments[commentIndex]) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        let comment = report.userComments[commentIndex];
        // Ensure likedBy array exists
        if (!comment.likedBy) {
            comment.likedBy = [];
        }

        const userLiked = comment.likedBy.includes(userId);

        if (userLiked) {
            // Unlike
            comment.likedBy = comment.likedBy.filter(id => id !== userId);
        } else {
            // Like
            comment.likedBy.push(userId);
        }

        await report.save(); // Save the entire report with updated comments

        res.status(200).json({ message: 'Like status updated', comment: report.userComments[commentIndex] });

    } catch (err) {
        console.error('MongoDB Error (Toggle Like):', err);
        res.status(500).json({ error: 'Failed to toggle like', details: err.message });
    }
});


// NEW: Get total reports count
router.get('/count', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({});
    res.json({ totalReports });
  } catch (err) {
    console.error('MongoDB Error (Total Reports Count):', err);
    res.status(500).json({ error: 'Failed to fetch total reports count', details: err.message });
  }
});

// NEW: Get unique active contributors count (e.g., last 30 days)
router.get('/active-contributors', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeContributors = await Report.distinct('reportedBy', { timestamp: { $gte: thirtyDaysAgo } });
    res.json({ activeContributorsCount: activeContributors.length });
  } catch (err) {
    console.error('MongoDB Error (Active Contributors Count):', err);
    res.status(500).json({ error: 'Failed to fetch active contributors count', details: err.message });
  }
});

// NEW: Get new reports today count
router.get('/today-count', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Set to the beginning of today in local time

    const newReportsToday = await Report.countDocuments({ timestamp: { $gte: startOfToday } });
    res.json({ newReportsToday });
  } catch (err) {
    console.error('MongoDB Error (New Reports Today Count):', err);
    res.status(500).json({ error: 'Failed to fetch new reports today count', details: err.message });
  }
});

// NEW: POST /api/reports/:reportId/trust - Toggle 'trust' reaction on a report
router.post('/:reportId/trust', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the request body

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const trustedBy = report.trustedBy || [];
    const userIndex = trustedBy.indexOf(userId);

    if (userIndex > -1) {
      // User has already trusted, so untrust
      trustedBy.splice(userIndex, 1);
    } else {
      // User has not trusted, so trust
      trustedBy.push(userId);
    }
    report.trustedBy = trustedBy; // Ensure the updated array is assigned back

    await report.save(); // Save the report document

    res.status(200).json(report); // Return the updated report with the new trustedBy array
  } catch (err) {
    console.error('MongoDB Error (Toggle Trust):', err);
    res.status(500).json({ error: 'Failed to toggle trust on report', details: err.message });
  }
});

// NEW: DELETE /api/reports/:reportId - Delete a report
router.delete('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.body; // Assuming userId is sent for authorization

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID is required.' });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Authorization check: Only the reportedBy user can delete their report
    if (report.reportedBy !== userId) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this report.' });
    }

    await Report.deleteOne({ _id: reportId }); // Use deleteOne for clarity

    res.status(200).json({ message: 'Report deleted successfully.' });

  } catch (err) {
    console.error('MongoDB Error (Delete Report):', err);
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
});

// UPDATED: PUT /api/reports/:reportId/verify - NGO marks a report as verified (per NGO)
router.put('/:reportId/verify', ngoAuthMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;
        const ngoId = req.ngoId; // Extracted from middleware
        const { isVerified } = req.body; // Expecting { isVerified: boolean }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found.' });
        }

        // Initialize verifiedByNgos if it doesn't exist
        if (!report.verifiedByNgos) {
            report.verifiedByNgos = [];
        }

        const ngoVerificationIndex = report.verifiedByNgos.findIndex(v => v.ngoId.toString() === ngoId);

        if (isVerified) {
            if (ngoVerificationIndex === -1) {
                // Add NGO's verification if not already present
                report.verifiedByNgos.push({ ngoId: ngoId, timestamp: new Date() });
                // Note: The user's badge count increment logic for verification is removed from here
                // as it should be managed centrally and not by each NGO's verification action.
            }
        } else {
            if (ngoVerificationIndex !== -1) {
                // Remove NGO's verification
                report.verifiedByNgos.splice(ngoVerificationIndex, 1);
            }
        }
        
        await report.save();

        res.status(200).json({ message: `Report successfully ${isVerified ? 'verified' : 'un-verified'} by NGO ${ngoId}`, report });
    } catch (err) {
        console.error('MongoDB Error (Verify Report):', err);
        res.status(500).json({ error: 'Failed to verify report', details: err.message });
    }
});


// UPDATED: PUT /api/reports/:reportId/spam - NGO marks a report as spam (per NGO)
router.put('/:reportId/spam', ngoAuthMiddleware, async (req, res) => {
  try {
    const { reportId } = req.params;
    const ngoId = req.ngoId; // Extracted from middleware
    const { isSpam, spamReason = '' } = req.body; // Expecting { isSpam: boolean, spamReason: string }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Initialize markedAsSpamByNgos if it doesn't exist
    if (!report.markedAsSpamByNgos) {
        report.markedAsSpamByNgos = [];
    }

    const ngoSpamIndex = report.markedAsSpamByNgos.findIndex(s => s.ngoId.toString() === ngoId);

    if (isSpam) { // If the frontend wants to mark as spam
        if (ngoSpamIndex === -1) {
            // Add NGO's spam marking if not already present
            report.markedAsSpamByNgos.push({ ngoId: ngoId, timestamp: new Date(), reason: spamReason });
        } else {
            // Update existing spam marking reason
            report.markedAsSpamByNgos[ngoSpamIndex].reason = spamReason;
            report.markedAsSpamByNgos[ngoSpamIndex].timestamp = new Date();
        }
    } else { // If the frontend wants to unmark as spam
        if (ngoSpamIndex !== -1) {
            // Remove NGO's spam marking
            report.markedAsSpamByNgos.splice(ngoSpamIndex, 1);
        }
    }

    await report.save();

    // Removed logic to globally mark user as spam based on report spamming.
    // User spamming is now a separate, direct action on the user model via /api/users/:userId/update-spam-status.

    res.status(200).json({ message: `Report successfully ${isSpam ? 'marked as spam' : 'unmarked as spam'} by NGO ${ngoId}`, report });
  } catch (err)
 {
    console.error('MongoDB Error (Mark Spam):', err);
    res.status(500).json({ error: 'Failed to mark report as spam', details: err.message });
  }
});

// NEW: User Management Routes for NGOs

// GET /api/users - Get all users (for NGO dashboard)
router.get('/users', ngoAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users for NGO dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:userUid/update-spam-status - Mark/Unmark user as spam
router.put('/users/:userUid/update-spam-status', ngoAuthMiddleware, async (req, res) => {
  try {
    const { userUid } = req.params;
    const { isSpam, spamReason = '' } = req.body;

    const user = await User.findOne({ uid: userUid });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isGloballySpammed = isSpam; // Corrected to isGloballySpammed
    user.spamReason = spamReason;
    await user.save();

    res.status(200).json({ message: 'User spam status updated successfully.', user });
  } catch (error) {
    console.error('Error updating user spam status:', error);
    res.status(500).json({ error: 'Failed to update user spam status' });
  }
});
router.post('/:reportId/official-response', ngoAuthMiddleware, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { responseText } = req.body;
    const ngoId = req.ngoId; // From your auth middleware

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const ngo = await Ngo.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    report.officialNgoResponse = {
      ngoId: ngoId,
      ngoName: ngo.name,
      responseText: responseText,
      timestamp: new Date(),
    };

    await report.save();
    res.status(200).json(report);
  } catch (err) {
    console.error('Error adding official response:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// NEW LEADERBOARD ENDPOINTS

// GET /api/reports/leaderboard/verified-zones
// Returns zones with the most verified reports
router.get('/leaderboard/verified-zones', ngoAuthMiddleware, async (req, res) => {
  try {
    const ngoId = req.ngoId; // Ensure NGO is authenticated

    // Fetch all zones for the current NGO
    const ngoZones = await Zone.find({ ngoId: ngoId });

    // Fetch all reports that are verified by *any* NGO
    const verifiedReports = await Report.find({
      'verifiedByNgos.0': { '$exists': true }, // At least one verification
      latitude: { $exists: true, $ne: null }, // Ensure lat/lng exist
      longitude: { $exists: true, $ne: null }
    });

    const zoneVerifiedCounts = {};

    // Iterate through verified reports and check if they fall into any of the NGO's zones
    for (const report of verifiedReports) {
      // Point for point-in-polygon should be [longitude, latitude]
      const point = [report.longitude, report.latitude];

      for (const zone of ngoZones) {
        let polygonCoords = [];
        // The backend stores GeoJSON Polygon coordinates as [[[lng, lat], ...]]
        // The frontend sends [[lat, lng], ...] which is converted to GeoJSON for storage.
        // So, when fetching, zone.coordinates.coordinates[0] should already be [[lng, lat], ...]
        if (zone.coordinates && zone.coordinates.type === 'Polygon' && zone.coordinates.coordinates && zone.coordinates.coordinates[0]) {
            polygonCoords = zone.coordinates.coordinates[0];
        } else {
            console.warn("Skipping zone due as its coordinates are not in expected GeoJSON Polygon format:", zone);
            continue;
        }

        // Check if the report's point is within the zone's polygon
        if (pointInPolygon(point, polygonCoords)) {
          zoneVerifiedCounts[zone._id] = (zoneVerifiedCounts[zone._id] || 0) + 1;
          break; // Report belongs to this zone, move to next report
        }
      }
    }

    // Format results for the leaderboard
    const leaderboard = Object.keys(zoneVerifiedCounts).map(zoneId => {
      const zone = ngoZones.find(z => z._id.toString() === zoneId);
      return {
        zoneId: zoneId,
        zoneName: zone ? zone.name : 'Unknown Zone',
        verifiedReportsCount: zoneVerifiedCounts[zoneId]
      };
    }).sort((a, b) => b.verifiedReportsCount - a.verifiedReportsCount); // Sort descending

    res.status(200).json(leaderboard);

  } catch (err) {
    console.error('MongoDB Error (Verified Zones Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch verified zones leaderboard', details: err.message });
  }
});

// GET /api/reports/leaderboard/fastest-response-ngos
// Returns NGOs with the fastest average response time
router.get('/leaderboard/fastest-response-ngos', ngoAuthMiddleware, async (req, res) => {
  try {
    const pipeline = [
      // 1. Match reports that have an official NGO response
      {
        $match: {
          'officialNgoResponse': { '$exists': true, '$ne': null }
        }
      },
      // 2. Calculate response time in milliseconds
      {
        $addFields: {
          responseTimeMs: {
            $subtract: ['$officialNgoResponse.timestamp', '$timestamp']
          }
        }
      },
      // 3. Group by NGO ID and calculate average response time
      {
        $group: {
          _id: '$officialNgoResponse.ngoId',
          averageResponseTimeMs: { $avg: '$responseTimeMs' }
        }
      },
      // 4. Lookup NGO details (especially name)
      {
        $lookup: {
          from: 'ngos', // The name of the NGO collection in MongoDB
          localField: '_id',
          foreignField: '_id',
          as: 'ngoDetails'
        }
      },
      // 5. Unwind the ngoDetails array (since $lookup returns an array)
      {
        $unwind: '$ngoDetails'
      },
      // 6. Project desired fields and convert average time to a more readable format (e.g., hours)
      {
        $project: {
          _id: 0,
          ngoId: '$_id',
          ngoName: '$ngoDetails.name',
          averageResponseTimeMs: '$averageResponseTimeMs',
          averageResponseTimeHours: { $divide: ['$averageResponseTimeMs', 3600000] } // Convert ms to hours
        }
      },
      // 7. Sort by average response time (ascending for fastest)
      {
        $sort: {
          averageResponseTimeMs: 1
        }
      }
    ];

    const fastestResponseNgos = await Report.aggregate(pipeline);

    res.status(200).json(fastestResponseNgos);

  } catch (err) {
    console.error('MongoDB Error (Fastest Response NGOs Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch fastest response NGOs leaderboard', details: err.message });
  }
});

// NEW: GET /api/reports/leaderboard/total-reports-by-ngo
// Returns NGOs ranked by the total number of reports they have submitted
router.get('/leaderboard/total-reports-by-ngo', ngoAuthMiddleware, async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          isNgoReport: true, // Only consider reports submitted by NGOs
          ngoReporterId: { $exists: true, $ne: null } // Ensure ngoReporterId exists
        }
      },
      {
        $group: {
          _id: '$ngoReporterId',
          totalReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'ngos', // The name of your NGO collection
          localField: '_id',
          foreignField: '_id',
          as: 'ngoDetails'
        }
      },
      {
        $unwind: '$ngoDetails'
      },
      {
        $project: {
          _id: 0,
          ngoId: '$_id',
          ngoName: '$ngoDetails.name',
          totalReports: 1
        }
      },
      {
        $sort: {
          totalReports: -1 // Sort by total reports descending
        }
      }
    ];

    const result = await Report.aggregate(pipeline);
    res.status(200).json(result);
  } catch (err) {
    console.error('MongoDB Error (Total Reports by NGO Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch total reports by NGO leaderboard', details: err.message });
  }
});

// NEW: GET /api/reports/leaderboard/total-verified-by-ngo
// Returns NGOs ranked by the total number of reports they have verified
router.get('/leaderboard/total-verified-by-ngo', ngoAuthMiddleware, async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          'verifiedByNgos.0': { '$exists': true } // Reports that have been verified by at least one NGO
        }
      },
      {
        $unwind: '$verifiedByNgos' // Deconstructs the array to get each verification entry
      },
      {
        $group: {
          _id: '$verifiedByNgos.ngoId',
          totalVerifiedReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'ngos', // The name of your NGO collection
          localField: '_id',
          foreignField: '_id',
          as: 'ngoDetails'
        }
      },
      {
        $unwind: '$ngoDetails'
      },
      {
        $project: {
          _id: 0,
          ngoId: '$_id',
          ngoName: '$ngoDetails.name',
          totalVerifiedReports: 1
        }
      },
      {
        $sort: {
          totalVerifiedReports: -1 // Sort by total verified reports descending
        }
      }
    ];

    const result = await Report.aggregate(pipeline);
    res.status(200).json(result);
  } catch (err) {
    console.error('MongoDB Error (Total Verified by NGO Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch total verified reports by NGO leaderboard', details: err.message });
  }
});

// NEW: GET /api/reports/leaderboard/total-spammed-by-ngo
// Returns NGOs ranked by the total number of reports they have marked as spam
router.get('/leaderboard/total-spammed-by-ngo', ngoAuthMiddleware, async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          'markedAsSpamByNgos.0': { '$exists': true } // Reports that have been marked as spam by at least one NGO
        }
      },
      {
        $unwind: '$markedAsSpamByNgos' // Deconstructs the array to get each spam entry
      },
      {
        $group: {
          _id: '$markedAsSpamByNgos.ngoId',
          totalSpamReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'ngos', // The name of your NGO collection
          localField: '_id',
          foreignField: '_id',
          as: 'ngoDetails'
        }
      },
      {
        $unwind: '$ngoDetails'
      },
      {
        $project: {
          _id: 0,
          ngoId: '$_id',
          ngoName: '$ngoDetails.name',
          totalSpamReports: 1
        }
      },
      {
        $sort: {
          totalSpamReports: -1 // Sort by total spam reports descending
        }
      }
    ];

    const result = await Report.aggregate(pipeline);
    res.status(200).json(result);
  } catch (err) {
    console.error('MongoDB Error (Total Spam by NGO Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch total spam reports by NGO leaderboard', details: err.message });
  }
});


// NEW: GET /api/reports/export/csv - Export reports as CSV
router.get('/export/csv', ngoAuthMiddleware, async (req, res) => {
  try {
    const ngoId = req.ngoId; // From middleware
    const { zoneId, startDate, endDate } = req.query;

    let query = {};
    // Only export reports not marked as spam by the current NGO for general view
    // Or if ngoView is explicitly true, show all reports for that NGO
    query.$or = [
      { markedAsSpamByNgos: { $exists: false } },
      { 'markedAsSpamByNgos.ngoId': { $ne: ngoId } } // Not marked as spam by THIS NGO
    ];


    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    let reports = await Report.find(query).lean(); // Use .lean() for plain JS objects

    // If zoneId is provided, filter reports by zone on the backend
    if (zoneId) {
      const zone = await Zone.findById(zoneId);
      if (!zone || !zone.coordinates || zone.coordinates.type !== 'Polygon' || !zone.coordinates.coordinates[0]) {
        return res.status(404).json({ error: 'Zone not found or invalid coordinates for filtering.' });
      }
      const polygonCoords = zone.coordinates.coordinates[0]; // GeoJSON [[lng, lat], ...]

      reports = reports.filter(report => {
        if (typeof report.latitude !== 'number' || typeof report.longitude !== 'number' || isNaN(report.latitude) || isNaN(report.longitude)) {
          return false; // Skip reports with invalid coordinates
        }
        const point = [report.longitude, report.latitude]; // Point for point-in-polygon is [lng, lat]
        return pointInPolygon(point, polygonCoords);
      });
    }

    if (reports.length === 0) {
      return res.status(200).send('No reports found for the selected criteria.');
    }

    const fields = [
      { label: 'Report ID', value: '_id' },
      { label: 'Type', value: 'type' },
      { label: 'Comment', value: 'comment' },
      { label: 'Image URL', value: 'imageUrl' },
      { label: 'Latitude', value: 'latitude' },
      { label: 'Longitude', value: 'longitude' },
      { label: 'Place Name', value: 'placeName' },
      { label: 'Address', value: 'address' },
      { label: 'Google Maps Link', value: 'googleMapsLink' },
      { label: 'Reported By User ID', value: 'reportedBy' },
      { label: 'Reported By User Name', value: 'userName' },
      { label: 'Timestamp', value: 'timestamp' },
      { label: 'Notification Status', value: 'notificationStatus' },
      { label: 'Is NGO Report', value: 'isNgoReport' },
      { label: 'NGO Reporter ID', value: 'ngoReporterId' },
      {
        label: 'Verified By NGOs',
        value: row => row.verifiedByNgos && row.verifiedByNgos.length > 0
          ? row.verifiedByNgos.map(v => v.ngoId.toString()).join('; ')
          : 'No'
      },
      {
        label: 'Marked As Spam By NGOs',
        value: row => row.markedAsSpamByNgos && row.markedAsSpamByNgos.length > 0
          ? row.markedAsSpamByNgos.map(s => `${s.ngoId.toString()} (Reason: ${s.reason || 'N/A'})`).join('; ')
          : 'No'
      },
      {
        label: 'Official NGO Response',
        value: row => row.officialNgoResponse ? `By ${row.officialNgoResponse.ngoName}: "${row.officialNgoResponse.responseText}"` : 'N/A'
      },
      // NEW: Add AI verification fields to CSV export
      {
        label: 'AI Object Detection Success',
        value: row => row.aiObjectDetection ? (row.aiObjectDetection.success ? 'Yes' : 'No') : 'N/A'
      },
      {
        label: 'AI Detected Features',
        value: row => row.aiObjectDetection && row.aiObjectDetection.features && row.aiObjectDetection.features.length > 0
          ? row.aiObjectDetection.features.map(f => `${f.label} (${f.score}%)`).join('; ')
          : 'N/A'
      },
      {
        label: 'AI Object Detection Message',
        value: row => row.aiObjectDetection ? row.aiObjectDetection.message || 'N/A' : 'N/A'
      },
      {
        label: 'AI Image Caption',
        value: row => row.aiImageCaption || 'N/A'
      },
      {
        label: 'AI VQA Question',
        value: row => row.aiVQA ? row.aiVQA.question || 'N/A' : 'N/A'
      },
      {
        label: 'AI VQA Answer',
        value: row => row.aiVQA ? row.aiVQA.answer || 'N/A' : 'N/A'
      },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reports);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=accessibility_reports.csv');
    res.status(200).send(csv);

  } catch (err) {
    console.error('Error exporting reports CSV:', err);
    res.status(500).json({ error: 'Failed to export reports CSV', details: err.message });
  }
});
// NEW: GET /api/reports/leaderboard/most-reported-places
// Returns places (based on placeName) with the highest number of reports
router.get('/leaderboard/most-reported-places', async (req, res) => {
  try {
    const mostReportedPlaces = await Report.aggregate([
      {
        $match: {
          placeName: { $exists: true, $ne: null, $ne: '' } // Ensure placeName exists and is not empty
        }
      },
      {
        $group: {
          _id: '$placeName', // Group by placeName
          totalReports: { $sum: 1 } // Count reports for each place
        }
      },
      {
        $sort: {
          totalReports: -1 // Sort in descending order of total reports
        }
      },
      {
        $limit: 10 // Limit to top 10 most reported places
      },
      {
        $project: {
          _id: 0, // Exclude _id from the final output
          placeName: '$_id', // Rename _id to placeName
          totalReports: 1
        }
      }
    ]);
    res.status(200).json(mostReportedPlaces);
  } catch (err) {
    console.error('MongoDB Error (Most Reported Places Leaderboard):', err);
    res.status(500).json({ error: 'Failed to fetch most reported places leaderboard', details: err.message });
  }
});
router.get('/user-analytics/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Fetch all reports by the user for base calculations
    const userReports = await Report.find({ reportedBy: uid });

    // Basic User Stats
    const totalReports = userReports.length;
    const verifiedReportsCount = userReports.filter(report => report.verifiedByNgos && report.verifiedByNgos.length > 0).length;

    // Reports by Type (using aggregation for efficiency)
    const reportsByType = await Report.aggregate([
      { $match: { reportedBy: uid } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Top Reported Places by User (using aggregation for efficiency)
    const topReportedPlacesByUser = await Report.aggregate([
      { $match: { reportedBy: uid, placeName: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$placeName', totalReports: { $sum: 1 } } },
      { $sort: { totalReports: -1 } },
      { $limit: 5 }, // Limit to top 5 places
      { $project: { _id: 0, placeName: '$_id', totalReports: 1 } }
    ]);

    // Community Engagement Metrics
    let ngoVerificationsReceived = 0;
    let userTrustsReceived = 0;
    let spamMarkingsReceived = 0;

    userReports.forEach(report => {
      if (report.verifiedByNgos) {
        ngoVerificationsReceived += report.verifiedByNgos.length;
      }
      if (report.trustedBy) { // Assuming trustedBy is an array of user UIDs
        userTrustsReceived += report.trustedBy.length;
      }
      if (report.markedAsSpamByNgos) {
        spamMarkingsReceived += report.markedAsSpamByNgos.length;
      }
    });

    // Simple Impact Score calculation (can be refined based on business logic)
    // This is a basic example; you might assign weights, consider zone criticality etc.
    const impactScore = Math.max(0, (verifiedReportsCount * 2) + (userTrustsReceived * 1) - (spamMarkingsReceived * 1.5));

    res.status(200).json({
      totalReports,
      verifiedReportsCount,
      reportsByType,
      topReportedPlacesByUser,
      ngoVerificationsReceived,
      userTrustsReceived,
      spamMarkingsReceived,
      impactScore,
    });

  } catch (err) {
    console.error('Error fetching user analytics:', err);
    res.status(500).json({ error: 'Failed to fetch user analytics', details: err.message });
  }
});


module.exports = router;

