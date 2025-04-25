
const CoinGate = require('coingate');
CoinGate.init(process.env.COINGATE_API_KEY);

module.exports = CoinGate;
