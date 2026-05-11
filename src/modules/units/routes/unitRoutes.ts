import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { UnitController } from '../controllers/unitController';

const unitRoutes = Router();
const unitController = new UnitController();

unitRoutes.use(authMiddleware);
unitRoutes.get('/units', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => unitController.list(req, res));
unitRoutes.get('/units/:id', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => unitController.getById(req, res));
unitRoutes.post('/units', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => unitController.create(req, res));
unitRoutes.put('/units/:id', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => unitController.update(req, res));
unitRoutes.patch('/units/:id/deactivate', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => unitController.deactivate(req, res));
unitRoutes.patch('/units/:id/activate', authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => unitController.activate(req, res));

export { unitRoutes };
