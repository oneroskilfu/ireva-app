export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  isDevelopment: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV || 'development',
};