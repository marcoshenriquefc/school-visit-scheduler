import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { AuthService } from '../services/authService';
import { loginSchema } from '../validators/authValidator';

const authService = new AuthService();

export class AuthController {
  async login(request: AuthenticatedRequest, response: Response): Promise<Response> {
    const payload = loginSchema.parse(request.body);
    const result = await authService.login(payload.email, payload.password);
    return response.json(result);
  }

  async me(request: AuthenticatedRequest, response: Response): Promise<Response> {
    return response.json({ user: request.user });
  }
}
