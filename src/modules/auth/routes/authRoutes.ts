import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/authMiddleware';
import { AuthController } from '../controllers/authController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', (req, res) => authController.login(req, res));
authRoutes.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export { authRoutes };
