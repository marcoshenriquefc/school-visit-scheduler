import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { UserController } from '../controllers/userController';

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authMiddleware, authorizeRoles('ADMIN'));
userRoutes.post('/users', (req, res) => userController.create(req, res));
userRoutes.get('/users', (req, res) => userController.list(req, res));
userRoutes.get('/users/:id', (req, res) => userController.getById(req, res));
userRoutes.put('/users/:id', (req, res) => userController.update(req, res));
userRoutes.patch('/users/:id/deactivate', (req, res) => userController.deactivate(req, res));

export { userRoutes };
