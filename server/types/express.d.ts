import { UserPayload } from '../../shared/types/user-payload';

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      jwtPayload?: UserPayload;
    }
  }
}

export {};