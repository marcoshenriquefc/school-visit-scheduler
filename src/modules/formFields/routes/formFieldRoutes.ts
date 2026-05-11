import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { FormFieldController } from '../controllers/formFieldController';

const formFieldRoutes = Router();
const formFieldController = new FormFieldController();

formFieldRoutes.use(authMiddleware, authorizeRoles('ADMIN', 'MARKETING'));
formFieldRoutes.post('/forms/:formId/fields', (req, res) => formFieldController.create(req, res));
formFieldRoutes.get('/forms/:formId/fields', (req, res) => formFieldController.list(req, res));
formFieldRoutes.get('/forms/:formId/fields/:fieldId', (req, res) => formFieldController.getById(req, res));
formFieldRoutes.put('/forms/:formId/fields/:fieldId', (req, res) => formFieldController.update(req, res));
formFieldRoutes.patch('/forms/:formId/fields/:fieldId/activate', (req, res) => formFieldController.activate(req, res));
formFieldRoutes.patch('/forms/:formId/fields/:fieldId/deactivate', (req, res) => formFieldController.deactivate(req, res));
formFieldRoutes.put('/forms/:formId/fields/reorder', (req, res) => formFieldController.reorder(req, res));

export { formFieldRoutes };
