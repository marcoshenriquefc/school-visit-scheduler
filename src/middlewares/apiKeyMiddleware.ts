import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiKeyService } from '../modules/apiKeys/services/apiKeyService';
import { AppError } from '../utils/appError';

const apiKeyService = new ApiKeyService();

export const apiKeyMiddleware = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
  if (!env.publicApiKeyRequired) return next();
  const apiKey = request.header('x-api-key');
  if (!apiKey) throw new AppError('Missing API key', 401);
  await apiKeyService.validateAndTouch(apiKey);
  next();
};
