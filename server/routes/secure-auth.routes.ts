import { Router } from 'express';
import { login, register, getProfile } from '../controllers/secure-auth.controller';
import { secureAuthMiddleware } from '../middleware/secure-auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', secureAuthMiddleware, getProfile);

export default router;