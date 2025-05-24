
// go-live-validator.ts
import axios from 'axios';
import { createClient } from 'redis';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({ url: process.env.REDIS_URL });
const pg = new Pool({ connectionString: process.env.DATABASE_URL });

async function validateEnvVars() {
  const requiredVars = [
    'REDIS_URL',
    'DATABASE_URL',
    'JWT_SECRET',
    'EMAIL_API_KEY',
    'NODE_ENV'
  ];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) throw new Error(`Missing env vars: ${missing.join(', ')}`);
  console.log('✅ All required environment variables are set.');
}

async function checkDatabaseConnection() {
  try {
    await pg.query('SELECT 1');
    console.log('✅ PostgreSQL is reachable.');
  } catch (err) {
    throw new Error('❌ PostgreSQL connection failed: ' + err.message);
  }
}

async function checkRedisConnection() {
  try {
    await redis.connect();
    await redis.set('healthcheck', 'ok');
    console.log('✅ Redis is reachable.');
    await redis.disconnect();
  } catch (err) {
    throw new Error('❌ Redis connection failed: ' + err.message);
  }
}

async function testApiEndpoint(url: string, description: string) {
  try {
    const res = await axios.get(url);
    if (res.status === 200) {
      console.log(`✅ ${description} responded with status 200.`);
    } else {
      throw new Error(`${description} returned status ${res.status}`);
    }
  } catch (err) {
    throw new Error(`❌ Failed to reach ${description}: ${err.message}`);
  }
}

async function runValidator() {
  console.log('🚀 Running Go-Live Readiness Validator...\n');
  try {
    await validateEnvVars();
    await checkDatabaseConnection();
    await checkRedisConnection();
    await testApiEndpoint('http://localhost:5000/health', 'Health Check Endpoint');
    await testApiEndpoint('http://localhost:5000/api/admin/users', 'Admin Users Endpoint');
    await testApiEndpoint('http://localhost:5000/api/tenants/check', 'Tenant Isolation Endpoint');
    console.log('\n🎉 All systems are ready for production launch!');
  } catch (err) {
    console.error('\n🛑 Go-Live Validator Failed:', err.message);
    process.exit(1);
  }
}

runValidator();
