import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { DashboardController } from '../controllers/dashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get('/dashboard', authMiddleware, authorizeRoles('ADMIN', 'MARKETING', 'COMMERCIAL', 'OPERATIONAL'), (req, res) => dashboardController.getDashboard(req, res));

export { dashboardRoutes };
