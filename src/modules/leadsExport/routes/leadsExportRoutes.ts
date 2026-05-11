import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { LeadsExportController } from '../controllers/leadsExportController';

const leadsExportRoutes = Router();
const leadsExportController = new LeadsExportController();

leadsExportRoutes.get('/leads/export/csv', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => leadsExportController.exportCsv(req, res));
leadsExportRoutes.get('/leads/export/pdf', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL'), (req, res) => leadsExportController.exportPdf(req, res));

export { leadsExportRoutes };
