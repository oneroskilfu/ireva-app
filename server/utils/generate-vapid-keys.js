/**
 * This utility generates VAPID keys for Web Push Notifications
 * Run this script with Node.js to generate a new pair of keys:
 * node generate-vapid-keys.js
 * 
 * Store these keys in your environment variables:
 * - PUBLIC_VAPID_KEY
 * - PRIVATE_VAPID_KEY
 */

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated:');
console.log('==========================================');
console.log('PUBLIC_VAPID_KEY=' + vapidKeys.publicKey);
console.log('PRIVATE_VAPID_KEY=' + vapidKeys.privateKey);
console.log('==========================================');
console.log('Add these to your .env file');