import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { createApiKeySchema } from '../validators/apiKeyValidator';
import { ParamsRequest } from '@/@types/express';

const apiKeyService = new ApiKeyService();

export class ApiKeyController {
  async create(request: Request, response: Response): Promise<Response> {
    const { name } = createApiKeySchema.parse(request.body);
    return response.status(201).json(await apiKeyService.create(name));
  }
  async list(_request: Request, response: Response): Promise<Response> {
    return response.json(await apiKeyService.list());
  }
  async activate(request: Request<ParamsRequest<"id">>, response: Response): Promise<Response> {
    return response.json(await apiKeyService.activate(request.params.id));
  }
  async deactivate(request: Request<ParamsRequest<"id">>, response: Response): Promise<Response> {
    return response.json(await apiKeyService.deactivate(request.params.id));
  }
}
