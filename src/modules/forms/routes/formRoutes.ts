import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { FormController } from '../controllers/formController';

const formRoutes = Router();
const formController = new FormController();

formRoutes.get('/forms/:slug/public', (req, res) => formController.getPublicBySlug(req, res));
formRoutes.get('/forms', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => formController.list(req, res));
formRoutes.get('/forms/:id', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => formController.getById(req, res));
formRoutes.post('/forms', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.create(req, res));
formRoutes.put('/forms/:id', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.update(req, res));
formRoutes.patch('/forms/:id/activate', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.activate(req, res));
formRoutes.patch('/forms/:id/pause', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.pause(req, res));
formRoutes.patch('/forms/:id/close', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.close(req, res));
formRoutes.put('/forms/:id/units', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.linkUnits(req, res));
formRoutes.put('/forms/:id/grades', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req, res) => formController.linkGrades(req, res));

export { formRoutes };
