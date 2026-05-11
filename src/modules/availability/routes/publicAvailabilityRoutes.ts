import { Router } from 'express';
import { AvailabilityController } from '../controllers/availabilityController';

const publicAvailabilityRoutes = Router();
const availabilityController = new AvailabilityController();

publicAvailabilityRoutes.get('/forms/:slug/availability/dates', (req, res) => availabilityController.publicDates(req, res));
publicAvailabilityRoutes.get('/forms/:slug/availability/times', (req, res) => availabilityController.publicTimes(req, res));

export { publicAvailabilityRoutes };
