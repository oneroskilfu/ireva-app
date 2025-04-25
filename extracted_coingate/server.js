
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
app.use(bodyParser.json());

// Routes
const cryptoRoutes = require('./routes/cryptoRoutes');
const webhookHandler = require('./coingate/webhookHandler');

app.use('/api', cryptoRoutes);
app.use('/api', webhookHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
