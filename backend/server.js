// backend/server.js (snippet)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// If no other backend services use Firebase, you can remove this:
// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/report');
const ngoAuthRoutes = require('./routes/ngoAuth');
const zonesRoutes = require('./routes/zones');
const ngoRoutes = require('./routes/ngoRoutes'); // The new file // Make sure this path is correct

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection - ENSURE THIS IS WORKING
mongoose.connect('mongodb://localhost:27017/accessmap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Mount your routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', ngoAuthRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/ngos', ngoRoutes);  // This mounts your new MongoDB-based zones routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});