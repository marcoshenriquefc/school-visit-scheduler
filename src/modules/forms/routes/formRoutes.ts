import { Request, Response, Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { FormController } from '../controllers/formController';
import { IdParam, SlugParam } from '@/@types/express';

const formRoutes = Router();
const formController = new FormController();

formRoutes.get('/forms/:slug/public', (req: Request<SlugParam>, res: Response) => formController.getPublicBySlug(req, res));
formRoutes.get('/forms', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req: Request, res: Response) => formController.list(req, res));
formRoutes.get('/forms/:id', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req: Request<IdParam>, res: Response) => formController.getById(req, res));
formRoutes.post('/forms', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')              , (req: Request, res: Response)          => formController.create(req, res));
formRoutes.put('/forms/:id', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')           , (req: Request<IdParam>, res: Response) => formController.update(req, res));
formRoutes.patch('/forms/:id/activate', authMiddleware, authorizeRoles('ADMIN', 'MARKETING'), (req: Request<IdParam>, res: Response) => formController.activate(req, res));
formRoutes.patch('/forms/:id/pause', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')   , (req: Request<IdParam>, res: Response) => formController.pause(req, res));
formRoutes.patch('/forms/:id/close', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')   , (req: Request<IdParam>, res: Response) => formController.close(req, res));
formRoutes.put('/forms/:id/units', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')     , (req: Request<IdParam>, res: Response) => formController.linkUnits(req, res));
formRoutes.put('/forms/:id/grades', authMiddleware, authorizeRoles('ADMIN', 'MARKETING')    , (req: Request<IdParam>, res: Response) => formController.linkGrades(req, res));

export { formRoutes };
