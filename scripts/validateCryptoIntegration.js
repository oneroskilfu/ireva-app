const fs = require('fs');
const path = require('path');

function checkFileExists(filePath, label) {
  const exists = fs.existsSync(filePath);
  console.log(`${label}: ${exists ? '✅ Found' : '❌ Missing'}`);
  return exists;
}

function checkFileContains(filePath, keywords = []) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  return keywords.every(kw => content.includes(kw));
}

console.log('\n=== iREVA Crypto Integration Validator ===\n');

// 1. Check core server components
console.log('--- Core Server Components ---');
checkFileExists('server/routes/crypto-investments.ts', 'Crypto Investments Route File');
console.log('- Crypto Payment Route:', checkFileContains('server/routes/crypto-investments.ts', ['initiateCryptoInvestment', 'cryptoPaymentService']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/services/crypto-payment-service.ts', 'Crypto Payment Service');
console.log('- Payment Service Logic:', checkFileContains('server/services/crypto-payment-service.ts', ['createPayment', 'getPayment', 'CoinGate']) ? '✅ Present' : '❌ Not found');

// 2. Check Webhook Security Implementation
console.log('\n--- Webhook Security Components ---');
checkFileExists('server/routes/crypto-webhooks.ts', 'Crypto Webhook Route');
console.log('- Webhook Handler:', checkFileContains('server/routes/crypto-webhooks.ts', ['/coingate/webhook', 'updateCryptoTransactionStatus']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/middleware/webhookSignatureVerifier.ts', 'Webhook Signature Verification');
console.log('- HMAC Verification:', checkFileContains('server/middleware/webhookSignatureVerifier.ts', ['createHmac', 'timingSafeEqual']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/middleware/rawBodyParser.ts', 'Raw Body Parser');
console.log('- Raw Body Capture:', checkFileContains('server/middleware/rawBodyParser.ts', ['rawBody', 'verify']) ? '✅ Present' : '❌ Not found');

// 3. Check documentation
console.log('\n--- Documentation ---');
checkFileExists('docs/webhook-security.md', 'Webhook Security Documentation');
console.log('- Security Guidelines:', checkFileContains('docs/webhook-security.md', ['Signature Verification', 'HMAC', 'Environment']) ? '✅ Present' : '❌ Not found');

// 4. Transaction and Wallet Models
console.log('\n--- Data Models ---');
checkFileExists('server/models/Transaction.js', 'Transaction Schema');
console.log('- Crypto Fields in Transaction:', checkFileContains('server/models/Transaction.js', ['txHash', 'status', 'walletAddress', 'crypto']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/models/Wallet.js', 'Wallet Schema');
console.log('- Balance Update Support:', checkFileContains('server/models/Wallet.js', ['balance', 'update']) ? '✅ Present' : '❌ Not found');

// 5. Frontend Integration
console.log('\n--- Frontend Components ---');
checkFileExists('client/src/components/CryptoPayment/CryptoPayment.tsx', 'Crypto Payment Component');
console.log('- Payment UI:', checkFileContains('client/src/components/CryptoPayment/CryptoPayment.tsx', ['QRCode', 'walletAddress']) ? '✅ Present' : '❌ Not found');

checkFileExists('client/src/pages/admin/CryptoTransactionsDashboard.tsx', 'Admin Crypto Dashboard');
console.log('- Admin Transaction Monitoring:', checkFileContains('client/src/pages/admin/CryptoTransactionsDashboard.tsx', ['transactions', 'status']) ? '✅ Present' : '❌ Not found');

checkFileExists('client/src/components/admin/CryptoWebhookSecurityGuide.tsx', 'Admin Security Guide');
console.log('- Security Guide:', checkFileContains('client/src/components/admin/CryptoWebhookSecurityGuide.tsx', ['webhookSecret', 'signature']) ? '✅ Present' : '❌ Not found');

// 6. Environment Variables Check
console.log('\n--- Environment Configuration ---');
const envExists = checkFileExists('.env', 'Environment File');
if (envExists) {
  console.log('- COINGATE_API_KEY:', process.env.COINGATE_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('- COINGATE_WEBHOOK_SECRET:', process.env.COINGATE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing');
}

console.log('\n=== Validation Complete ===\n');