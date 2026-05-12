import { Router } from 'express';
import { PublicFormController } from '../controllers/publicFormController';

const publicRoutes = Router();
const publicFormController = new PublicFormController();

publicRoutes.get('/forms/:slug', (req, res) => publicFormController.getForm(req, res));
publicRoutes.get('/forms/:slug/data', (req, res) => publicFormController.getFormData(req, res));
publicRoutes.get('/forms/:slug/units', (req, res) => publicFormController.getUnits(req, res));
publicRoutes.get('/forms/:slug/grades', (req, res) => publicFormController.getGrades(req, res));
publicRoutes.get('/forms/:slug/fields', (req, res) => publicFormController.getFields(req, res));

export { publicRoutes };
