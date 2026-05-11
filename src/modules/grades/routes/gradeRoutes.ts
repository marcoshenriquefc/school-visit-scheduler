import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { GradeController } from '../controllers/gradeController';

const gradeRoutes = Router();
const gradeController = new GradeController();

gradeRoutes.use(authMiddleware);
gradeRoutes.get('/grades', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => gradeController.list(req, res));
gradeRoutes.get('/grades/:id', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => gradeController.getById(req, res));
gradeRoutes.post('/grades', authorizeRoles('ADMIN', 'MARKETING'), (req, res) => gradeController.create(req, res));
gradeRoutes.put('/grades/:id', authorizeRoles('ADMIN', 'MARKETING'), (req, res) => gradeController.update(req, res));
gradeRoutes.patch('/grades/:id/deactivate', authorizeRoles('ADMIN', 'MARKETING'), (req, res) => gradeController.deactivate(req, res));
gradeRoutes.patch('/grades/:id/activate', authorizeRoles('ADMIN', 'MARKETING'), (req, res) => gradeController.activate(req, res));

export { gradeRoutes };
