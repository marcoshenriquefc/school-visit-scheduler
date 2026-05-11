import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: string; email: string };
}

export const authMiddleware = (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
  const authHeader = request.headers.authorization;
  if (!authHeader) throw new AppError('Unauthorized', 401);

  const [, token] = authHeader.split(' ');
  if (!token) throw new AppError('Unauthorized', 401);

  request.user = verifyToken(token);
  next();
};

export const authorizeRoles = (...roles: string[]) => (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
  if (!request.user || !roles.includes(request.user.role)) throw new AppError('Forbidden', 403);
  next();
};
