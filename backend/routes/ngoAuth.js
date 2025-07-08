const express = require('express');
const router = express.Router();
const Ngo = require('../models/NgoModel'); // MongoDB Mongoose model

router.post('/ngo-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const ngo = await Ngo.findOne({ email });
    if (!ngo) return res.json({ success: false });

    if (ngo.password === password) {
      return res.json({ success: true, ngo });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
