import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 1. Investment route for crypto
checkFileExists('server/routes/crypto-investments.ts', 'Crypto Investment Route File');
console.log('- Crypto Route:', checkFileContains('server/routes/crypto-investments.ts', ['createPayment', 'CryptoPayment']) ? '✅ Present' : '❌ Not found');

// 2. Crypto payment service
checkFileExists('server/services/crypto-payment-service.ts', 'Crypto Payment Service');
console.log('- Service Methods:', checkFileContains('server/services/crypto-payment-service.ts', ['createPayment', 'getPaymentStatus', 'updatePaymentStatus', 'processWebhookEvent']) ? '✅ Present' : '❌ Not found');
console.log('- Test Connection:', checkFileContains('server/services/crypto-payment-service.ts', ['testConnection', 'success']) ? '✅ Present' : '❌ Not found');

// 3. Webhook route and handlers
checkFileExists('server/routes/crypto-webhooks.ts', 'Crypto Webhook Route');
console.log('- Webhook Handler:', checkFileContains('server/routes/crypto-webhooks.ts', ['coingate/webhook', 'updateCryptoTransactionStatus']) ? '✅ Present' : '❌ Not found');

// 4. Webhook security middleware
checkFileExists('server/middleware/webhookSignatureVerifier.ts', 'Webhook Signature Verifier');
console.log('- Signature Verification:', checkFileContains('server/middleware/webhookSignatureVerifier.ts', ['createHmac', 'timingSafeEqual']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/middleware/rawBodyParser.ts', 'Raw Body Parser');
console.log('- Raw Body Access:', checkFileContains('server/middleware/rawBodyParser.ts', ['rawBody', 'verify']) ? '✅ Present' : '❌ Not found');

// 5. Transaction models
checkFileExists('server/models/Transaction.js', 'Transaction Schema');
console.log('- Crypto Fields in Transaction:', checkFileContains('server/models/Transaction.js', ['txHash', 'status', 'walletAddress']) ? '✅ Present' : '❌ Not found');

// 6. Wallet model/service
checkFileExists('server/models/Wallet.js', 'Wallet Schema');
console.log('- Balance Management:', checkFileContains('server/models/Wallet.js', ['balance', 'crypto']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/services/wallet-service.ts', 'Wallet Service');
console.log('- Crypto Balance Updates:', checkFileContains('server/services/wallet-service.ts', ['updateCryptoBalance', 'wallet']) ? '✅ Present' : '❌ Not found');

// 7. Admin routes for crypto validation and management
checkFileExists('server/routes/admin-crypto-routes.ts', 'Admin Crypto Routes');
console.log('- Admin Dashboard:', checkFileContains('server/routes/admin-crypto-routes.ts', ['adminCryptoRouter', '/transactions']) ? '✅ Present' : '❌ Not found');

checkFileExists('server/routes/admin-crypto-validate.ts', 'Admin Crypto Validation');
console.log('- Validation Endpoint:', checkFileContains('server/routes/admin-crypto-validate.ts', ['validate', 'testConnection']) ? '✅ Present' : '❌ Not found');

// 8. Frontend components (basic checks)
console.log('\n--- Frontend Checks ---');
checkFileExists('client/src/components/CryptoPayment/CryptoPayment.tsx', 'Crypto Payment Component');
console.log('- Payment UI:', checkFileContains('client/src/components/CryptoPayment/CryptoPayment.tsx', ['QRCode', 'walletAddress']) ? '✅ Present' : '❌ Not found');

checkFileExists('client/src/components/admin/CryptoIntegrationValidator.tsx', 'Crypto Integration Validator');
console.log('- Admin Validator UI:', checkFileContains('client/src/components/admin/CryptoIntegrationValidator.tsx', ['ValidationItem', 'getSectionStatus']) ? '✅ Present' : '❌ Not found');

checkFileExists('client/src/components/admin/CryptoWebhookSecurityGuide.tsx', 'Crypto Webhook Security Guide');
console.log('- Security Guide UI:', checkFileContains('client/src/components/admin/CryptoWebhookSecurityGuide.tsx', ['webhookSecret', 'signature']) ? '✅ Present' : '❌ Not found');

// 9. Environment variables check
console.log('\n--- Environment Setup ---');
console.log('- COINGATE_API_KEY:', process.env.COINGATE_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('- COINGATE_WEBHOOK_SECRET:', process.env.COINGATE_WEBHOOK_SECRET ? '✅ Set' : '❌ Not Set');

console.log('\n=== Validation Complete ===\n');