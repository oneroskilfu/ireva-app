
const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
    const payload = req.body;

    // Log and process payload
    console.log('CoinGate Webhook Received:', payload);

    // Validate signature (recommended) and update investment status
    // e.g., mark investment as confirmed in DB

    res.status(200).send('Webhook received');
});

module.exports = router;
