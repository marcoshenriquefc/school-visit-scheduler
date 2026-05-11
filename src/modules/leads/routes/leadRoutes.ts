import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { LeadController } from '../controllers/leadController';

const leadRoutes = Router();
const leadController = new LeadController();

leadRoutes.use(authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'));
leadRoutes.get('/leads', (req, res) => leadController.list(req, res));
leadRoutes.get('/leads/:id', (req, res) => leadController.getById(req, res));
leadRoutes.patch('/leads/:id/status', (req, res) => leadController.updateStatus(req, res));

export { leadRoutes };
