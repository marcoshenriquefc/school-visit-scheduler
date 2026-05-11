import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';

const scheduleRoutes = Router();
const scheduleController = new ScheduleController();

scheduleRoutes.post('/schedules', (req, res) => scheduleController.create(req, res));
scheduleRoutes.patch('/schedules/:leadId/cancel', (req, res) => scheduleController.cancel(req, res));
scheduleRoutes.patch('/schedules/:leadId/reschedule', (req, res) => scheduleController.reschedule(req, res));

export { scheduleRoutes };
