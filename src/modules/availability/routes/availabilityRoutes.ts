import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { AvailabilityController } from '../controllers/availabilityController';

const availabilityRoutes = Router();
const availabilityController = new AvailabilityController();

availabilityRoutes.post('/forms/:formId/availability/generate', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.generate(req, res));
availabilityRoutes.post('/forms/:formId/availability', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.create(req, res));
availabilityRoutes.get('/forms/:formId/availability', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => availabilityController.list(req, res));
availabilityRoutes.patch('/availability/:slotId/block', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.block(req, res));
availabilityRoutes.patch('/availability/:slotId/unblock', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.unblock(req, res));
availabilityRoutes.put('/availability/:slotId', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.update(req, res));
availabilityRoutes.delete('/availability/:slotId', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => availabilityController.delete(req, res));


export { availabilityRoutes };
