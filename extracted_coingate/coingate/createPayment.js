
const CoinGate = require('./coingateClient');

const createPayment = async (amount, currency, callbackUrl) => {
    const params = {
        order_id: 'iREVA-' + Date.now(),
        price_amount: amount,
        price_currency: currency,
        receive_currency: 'USDT',
        callback_url: callbackUrl,
        cancel_url: 'https://yourdomain.com/payment-cancelled',
        success_url: 'https://yourdomain.com/payment-success',
        title: 'iREVA Investment Payment',
    };

    try {
        const response = await CoinGate.createOrder(params);
        return response;
    } catch (err) {
        console.error('CoinGate Payment Error:', err);
        throw err;
    }
};

module.exports = createPayment;
