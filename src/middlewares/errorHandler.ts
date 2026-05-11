import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const errorHandler = (error: Error, _request: Request, response: Response, _next: NextFunction): Response => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message, details: env.nodeEnv === 'development' ? (error.details ?? null) : null });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({ message: 'Validation failed', details: error.flatten() });
  }

  return response.status(500).json({ message: 'Internal server error' });
};
