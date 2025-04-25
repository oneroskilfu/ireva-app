import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { NextFunction, Request, Response } from 'express';

let io: SocketIOServer | null = null;

export function setupSocketIO(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected to socket.io:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected from socket.io:', socket.id);
    });
  });

  return io;
}

export function getSocketIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Middleware for attaching socket.io to request object
export function socketIOMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (io) {
      (req as any).io = io;
    }
    next();
  } catch (error) {
    console.error('Socket.io middleware error:', error);
    next();
  }
}