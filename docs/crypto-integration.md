# CoinGate Crypto Integration Setup Guide

This guide explains how to set up the CoinGate cryptocurrency payment integration with iREVA Real Estate Investment Platform.

## Prerequisites

1. A CoinGate merchant account
2. API keys from the CoinGate dashboard
3. Webhook secret for secure communication

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```
COINGATE_API_KEY=your_api_key_here
COINGATE_WEBHOOK_SECRET=your_webhook_secret_here
```

## Webhook Configuration

You must configure a webhook in your CoinGate dashboard to receive transaction status updates. 

### Webhook URL

Set your webhook URL in the CoinGate dashboard to:

```
https://yourdomain.com/api/webhook/coingate-webhook
```

### Webhook Events

Configure the webhook to listen for the following events:
- Payment received
- Payment confirmed
- Payment expired
- Payment invalid
- Payment canceled

### Security

The webhook is secured using HMAC-SHA256 signatures. CoinGate will sign each request with your webhook secret, and our server will verify this signature to ensure authenticity.

## Testing the Integration

1. Use the admin dashboard to verify that the CoinGate integration is properly configured
2. Make a test payment to ensure that notifications and database updates are working correctly
3. Check transaction status updates in real-time

## Troubleshooting

If you encounter issues with the CoinGate integration:

1. Verify that your API key and webhook secret are correctly set in the environment variables
2. Check that your webhook URL is correctly configured in the CoinGate dashboard
3. Review the server logs for any errors related to webhook signature verification
4. Ensure your CoinGate account has the proper permissions enabled

## Supported Cryptocurrencies

Our integration currently supports the following cryptocurrencies:
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- USDC (USD Coin)
- XRP (Ripple)
- BNB (Binance Coin)
- DOGE (Dogecoin)
- SOL (Solana)
- MATIC (Polygon)