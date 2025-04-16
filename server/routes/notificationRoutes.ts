import { Router, Response } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/authMiddleware';

// Define extended request that includes the user from JWT payload
interface AuthenticatedRequest extends Request {
  jwtPayload?: {
    id: number;
    username: string;
    role: string;
  };
  user?: any;
}

const notificationRouter = Router();

// Apply authentication to all notification routes
notificationRouter.use(requireAuth);

// Get user notifications
notificationRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload or session
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const notifications = await storage.getUserNotifications(userId);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read
notificationRouter.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload or session
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const notificationId = parseInt(req.params.id);
    
    // Get notification to check ownership
    const notification = await storage.getUserNotifications(userId)
      .then(notifications => notifications.find(n => n.id === notificationId));
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found or does not belong to user" });
    }
    
    const updatedNotification = await storage.markNotificationAsRead(notificationId);
    
    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});

export default notificationRouter;