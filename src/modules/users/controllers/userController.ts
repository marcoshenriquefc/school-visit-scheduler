import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';

const userService = new UserService();

export class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    const payload = createUserSchema.parse(request.body);
    const user = await userService.create(payload);
    return response.status(201).json(user);
  }
  async list(_request: Request, response: Response): Promise<Response> { return response.json(await userService.list()); }
  async getById(request: Request, response: Response): Promise<Response> { return response.json(await userService.getById(request.params.id)); }
  async update(request: Request, response: Response): Promise<Response> {
    const payload = updateUserSchema.parse(request.body);
    return response.json(await userService.update(request.params.id, payload));
  }
  async deactivate(request: Request, response: Response): Promise<Response> { return response.json(await userService.deactivate(request.params.id)); }
}
