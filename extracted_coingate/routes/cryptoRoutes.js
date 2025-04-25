
const express = require('express');
const router = express.Router();
const createPayment = require('../coingate/createPayment');

router.post('/create-crypto-payment', async (req, res) => {
    const { amount, currency } = req.body;
    try {
        const payment = await createPayment(amount, currency, 'https://yourdomain.com/api/webhook');
        res.json({ payment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create crypto payment' });
    }
});

module.exports = router;
