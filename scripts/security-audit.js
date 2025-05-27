#!/usr/bin/env node

/**
 * iREVA Platform Security Audit Script
 * 
 * This script performs a comprehensive security audit of environment variables,
 * configuration files, and deployment settings to ensure production readiness.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.envFile = '.env';
  }

  log(message, type = 'info') {
    const colors = {
      error: '\x1b[31m',
      warning: '\x1b[33m',
      success: '\x1b[32m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log(`❌ ${message}`, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'warning');
  }

  addPassed(message) {
    this.passed.push(message);
    this.log(`✅ ${message}`, 'success');
  }

  checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  loadEnvFile() {
    if (!this.checkFileExists(this.envFile)) {
      this.addWarning(`Environment file ${this.envFile} not found`);
      return {};
    }

    try {
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      const env = {};
      
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      });

      return env;
    } catch (error) {
      this.addIssue(`Failed to read environment file: ${error.message}`);
      return {};
    }
  }

  auditJWTSecurity(env) {
    this.log('\n🔐 Auditing JWT Security...', 'info');
    
    // Check JWT_SECRET
    if (!env.JWT_SECRET) {
      this.addIssue('JWT_SECRET is not set');
    } else {
      if (env.JWT_SECRET.length < 32) {
        this.addIssue('JWT_SECRET is too short (minimum 32 characters required)');
      } else if (env.JWT_SECRET.length < 64) {
        this.addWarning('JWT_SECRET should be at least 64 characters for enhanced security');
      } else {
        this.addPassed('JWT_SECRET length is secure');
      }

      // Check for weak JWT secrets
      const weakSecrets = ['secret', 'password', '123456', 'jwt-secret', 'your-secret-key'];
      if (weakSecrets.some(weak => env.JWT_SECRET.toLowerCase().includes(weak))) {
        this.addIssue('JWT_SECRET appears to contain common/weak patterns');
      } else {
        this.addPassed('JWT_SECRET appears to be unique');
      }
    }

    // Check JWT_REFRESH_SECRET
    if (!env.JWT_REFRESH_SECRET) {
      this.addWarning('JWT_REFRESH_SECRET is not set (recommended for enhanced security)');
    } else if (env.JWT_REFRESH_SECRET === env.JWT_SECRET) {
      this.addIssue('JWT_REFRESH_SECRET should be different from JWT_SECRET');
    } else {
      this.addPassed('JWT_REFRESH_SECRET is properly configured');
    }

    // Check SESSION_SECRET
    if (!env.SESSION_SECRET) {
      this.addIssue('SESSION_SECRET is not set');
    } else if (env.SESSION_SECRET.length < 32) {
      this.addIssue('SESSION_SECRET is too short (minimum 32 characters required)');
    } else {
      this.addPassed('SESSION_SECRET is properly configured');
    }
  }

  auditDatabaseSecurity(env) {
    this.log('\n🗄️  Auditing Database Security...', 'info');
    
    if (!env.DATABASE_URL) {
      this.addIssue('DATABASE_URL is not set');
      return;
    }

    // Check for insecure database URLs
    if (env.DATABASE_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
      this.addIssue('DATABASE_URL points to localhost in production environment');
    }

    if (env.DATABASE_URL.includes('postgres://') && !env.DATABASE_URL.includes('sslmode=require')) {
      this.addWarning('Database connection may not be using SSL (add ?sslmode=require for production)');
    }

    // Check for hardcoded credentials
    if (env.DATABASE_URL.includes(':password@') || env.DATABASE_URL.includes(':123456@')) {
      this.addIssue('Database URL contains weak or default credentials');
    }

    this.addPassed('Database configuration reviewed');
  }

  auditCORSConfiguration(env) {
    this.log('\n🌐 Auditing CORS Configuration...', 'info');
    
    if (!env.CORS_ORIGIN) {
      this.addWarning('CORS_ORIGIN is not set - this may allow all origins');
    } else {
      const origins = env.CORS_ORIGIN.split(',');
      
      // Check for wildcard in production
      if (origins.includes('*') && process.env.NODE_ENV === 'production') {
        this.addIssue('CORS_ORIGIN allows all origins (*) in production');
      }

      // Check for HTTP origins in production
      const httpOrigins = origins.filter(origin => origin.trim().startsWith('http://'));
      if (httpOrigins.length > 0 && process.env.NODE_ENV === 'production') {
        this.addIssue(`CORS_ORIGIN contains HTTP origins in production: ${httpOrigins.join(', ')}`);
      }

      // Check for localhost in production
      const localhostOrigins = origins.filter(origin => origin.includes('localhost'));
      if (localhostOrigins.length > 0 && process.env.NODE_ENV === 'production') {
        this.addWarning(`CORS_ORIGIN contains localhost origins in production: ${localhostOrigins.join(', ')}`);
      }

      if (httpOrigins.length === 0 && !origins.includes('*')) {
        this.addPassed('CORS_ORIGIN is properly configured with HTTPS origins');
      }
    }
  }

  auditAPIKeys(env) {
    this.log('\n🔑 Auditing API Keys and Secrets...', 'info');
    
    const apiKeyPatterns = {
      'STRIPE_SECRET_KEY': /^sk_(test_|live_)[a-zA-Z0-9]+$/,
      'PAYSTACK_SECRET_KEY': /^sk_(test_|live_)[a-zA-Z0-9]+$/,
      'SENDGRID_API_KEY': /^SG\.[a-zA-Z0-9_-]+$/,
      'TWILIO_AUTH_TOKEN': /^[a-f0-9]{32}$/i
    };

    Object.entries(apiKeyPatterns).forEach(([keyName, pattern]) => {
      if (env[keyName]) {
        if (pattern.test(env[keyName])) {
          this.addPassed(`${keyName} format is valid`);
        } else {
          this.addWarning(`${keyName} format may be invalid`);
        }

        // Check for test keys in production
        if (env[keyName].includes('test') && process.env.NODE_ENV === 'production') {
          this.addIssue(`${keyName} appears to be a test key in production environment`);
        }
      }
    });

    // Check for hardcoded secrets in common formats
    const suspiciousPatterns = [
      'your-api-key',
      'your-secret-key',
      'change-me',
      'secret123',
      'password123'
    ];

    Object.entries(env).forEach(([key, value]) => {
      if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')) {
        suspiciousPatterns.forEach(pattern => {
          if (value.toLowerCase().includes(pattern)) {
            this.addIssue(`${key} appears to contain placeholder value: ${pattern}`);
          }
        });
      }
    });
  }

  auditHTTPSConfiguration(env) {
    this.log('\n🔒 Auditing HTTPS Configuration...', 'info');
    
    // Check frontend and backend URLs
    const urlKeys = ['FRONTEND_URL', 'BACKEND_URL', 'API_BASE_URL'];
    
    urlKeys.forEach(urlKey => {
      if (env[urlKey]) {
        if (env[urlKey].startsWith('http://') && process.env.NODE_ENV === 'production') {
          this.addIssue(`${urlKey} uses HTTP in production: ${env[urlKey]}`);
        } else if (env[urlKey].startsWith('https://')) {
          this.addPassed(`${urlKey} properly uses HTTPS`);
        }
      }
    });

    // Check for SSL certificate configuration
    if (env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
      this.addPassed('SSL certificate paths are configured');
    } else if (process.env.NODE_ENV === 'production') {
      this.addWarning('SSL certificate paths not configured (may be handled by reverse proxy)');
    }
  }

  auditProductionSettings(env) {
    this.log('\n🚀 Auditing Production Settings...', 'info');
    
    if (process.env.NODE_ENV === 'production') {
      // Check for debug settings
      if (env.DEBUG === 'true' || env.DEBUG === '1') {
        this.addWarning('DEBUG mode is enabled in production');
      }

      // Check log level
      if (env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace') {
        this.addWarning('Verbose logging is enabled in production');
      }

      // Check for development-specific settings
      if (env.DEVELOPMENT_MODE === 'true') {
        this.addIssue('Development mode is enabled in production');
      }

      this.addPassed('Production environment settings reviewed');
    }
  }

  auditFilePermissions() {
    this.log('\n📁 Auditing File Permissions...', 'info');
    
    const sensitiveFiles = ['.env', '.env.production', '.env.local'];
    
    sensitiveFiles.forEach(file => {
      if (this.checkFileExists(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode & parseInt('777', 8);
          
          if (mode & parseInt('044', 8)) {
            this.addWarning(`${file} is readable by group/others (consider chmod 600)`);
          } else {
            this.addPassed(`${file} has secure permissions`);
          }
        } catch (error) {
          this.addWarning(`Could not check permissions for ${file}`);
        }
      }
    });
  }

  checkForHardcodedSecrets() {
    this.log('\n🔍 Scanning for Hardcoded Secrets...', 'info');
    
    const filesToCheck = [
      'server/auth.ts',
      'server/config/security.ts',
      'client/src/lib/api.ts'
    ];

    const secretPatterns = [
      /(['"])(?:sk_|pk_)[a-zA-Z0-9]{20,}\1/g,
      /(['"])[A-Za-z0-9+/]{40,}={0,2}\1/g,
      /(['"])[a-f0-9]{32,}\1/g
    ];

    let foundSecrets = false;

    filesToCheck.forEach(file => {
      if (this.checkFileExists(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          secretPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              this.addIssue(`Potential hardcoded secret found in ${file}`);
              foundSecrets = true;
            }
          });
        } catch (error) {
          this.addWarning(`Could not scan ${file}: ${error.message}`);
        }
      }
    });

    if (!foundSecrets) {
      this.addPassed('No obvious hardcoded secrets found in source files');
    }
  }

  generateSecurityReport() {
    this.log('\n📊 Security Audit Report', 'info');
    this.log('='.repeat(50), 'info');
    
    this.log(`\n✅ Passed Checks: ${this.passed.length}`, 'success');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'warning');
    this.log(`❌ Critical Issues: ${this.issues.length}`, 'error');

    if (this.issues.length > 0) {
      this.log('\n🚨 Critical Issues to Fix:', 'error');
      this.issues.forEach((issue, index) => {
        this.log(`${index + 1}. ${issue}`, 'error');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings to Consider:', 'warning');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'warning');
      });
    }

    // Security score
    const totalChecks = this.passed.length + this.warnings.length + this.issues.length;
    const score = totalChecks > 0 ? Math.round((this.passed.length / totalChecks) * 100) : 0;
    
    this.log(`\n🏆 Security Score: ${score}%`, score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error');

    if (this.issues.length === 0) {
      this.log('\n🎉 No critical security issues found!', 'success');
      this.log('Your iREVA platform is ready for secure deployment.', 'success');
    } else {
      this.log('\n⚠️  Please address critical issues before production deployment.', 'warning');
    }

    return {
      score,
      issues: this.issues.length,
      warnings: this.warnings.length,
      passed: this.passed.length
    };
  }

  run() {
    this.log('🔒 Starting iREVA Platform Security Audit...', 'info');
    
    const env = this.loadEnvFile();
    
    this.auditJWTSecurity(env);
    this.auditDatabaseSecurity(env);
    this.auditCORSConfiguration(env);
    this.auditAPIKeys(env);
    this.auditHTTPSConfiguration(env);
    this.auditProductionSettings(env);
    this.auditFilePermissions();
    this.checkForHardcodedSecrets();
    
    return this.generateSecurityReport();
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  const result = auditor.run();
  
  // Exit with error code if critical issues found
  process.exit(result.issues > 0 ? 1 : 0);
}

module.exports = SecurityAuditor;