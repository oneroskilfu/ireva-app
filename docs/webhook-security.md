# Webhook Security Implementation

## Overview

This document outlines the security measures implemented to protect cryptocurrency payment webhooks in the iREVA platform.

## Why Webhook Security Matters

Webhooks are essential for receiving real-time payment notifications from cryptocurrency payment processors like CoinGate. However, they can be a security vulnerability if not properly protected:

1. **Fraudulent Transactions** - Without verification, attackers could forge webhook calls to mark unpaid transactions as completed
2. **Data Tampering** - Malicious actors could alter payment amounts or transaction details
3. **Service Disruption** - Excessive unverified webhook calls could lead to denial of service

## Security Measures Implemented

### 1. Signature Verification

All incoming webhook requests from CoinGate are validated using HMAC-SHA256 signatures:

- The payment provider signs each webhook payload using a shared secret
- Our server independently computes a signature and verifies it matches the one provided
- Requests with invalid or missing signatures are rejected
- Timing-safe comparison is used to prevent timing attacks

### 2. Environment-based Protection

- Production environments enforce strict signature verification
- Development environments can optionally bypass verification for easier testing
- Configuration is controlled via environment variables

### 3. Raw Body Preservation

- Middleware captures the raw HTTP request body
- Ensures exact signature verification on the unmodified payload
- Prevents issues with body-parser transformations affecting verification

## Configuration

To enable webhook security, set the following environment variables:

```
COINGATE_WEBHOOK_SECRET=your_webhook_secret_from_coingate
```

For development and testing, you can use:

```
NODE_ENV=development
```

## Implementation Details

The security is implemented through two middleware components:

1. `rawBodyParser`: Captures the raw request body for signature verification
2. `bypassSignatureVerificationInDevelopment`: Conditionally applies verification based on environment

## Webhook Testing

For development, a test endpoint is available:

```
POST /api/crypto/webhooks/test/webhook
```

This allows simulating webhook calls without needing to generate valid signatures.

## Security Recommendations

1. **Rotate Webhook Secrets Regularly** - Update the webhook secret in both CoinGate and your environment variables
2. **Monitor Failed Verifications** - Keep track of signature verification failures as potential attack attempts
3. **Use HTTPS Only** - All webhook endpoints should be accessible only via HTTPS

## Troubleshooting

Common webhook verification issues:

1. Missing or incorrect webhook secret
2. Header name mismatch (e.g., 'x-coingate-signature' vs 'x-signature')
3. Body parsing issues affecting the raw request body
4. Different hashing algorithms or encodings