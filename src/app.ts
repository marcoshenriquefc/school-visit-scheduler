import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRoutes } from './modules/auth/routes/authRoutes';
import { userRoutes } from './modules/users/routes/userRoutes';
import { unitRoutes } from './modules/units/routes/unitRoutes';
import { gradeRoutes } from './modules/grades/routes/gradeRoutes';
import { formRoutes } from './modules/forms/routes/formRoutes';
import { formFieldRoutes } from './modules/formFields/routes/formFieldRoutes';
import { availabilityRoutes } from './modules/availability/routes/availabilityRoutes';
import { publicAvailabilityRoutes } from './modules/availability/routes/publicAvailabilityRoutes';
import { publicRoutes } from './modules/public/routes/publicRoutes';
import { scheduleRoutes } from './modules/schedules/routes/scheduleRoutes';
import { leadRoutes } from './modules/leads/routes/leadRoutes';
import { apiKeyRoutes } from './modules/apiKeys/routes/apiKeyRoutes';
import { dashboardRoutes } from './modules/dashboard/routes/dashboardRoutes';
import { leadsExportRoutes } from './modules/leadsExport/routes/leadsExportRoutes';
import { apiKeyMiddleware } from './middlewares/apiKeyMiddleware';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'handle-backend' }));
app.use('/auth', authRoutes);
app.use('/admin', userRoutes);
app.use('/admin', unitRoutes);
app.use('/admin', gradeRoutes);
app.use('/admin', formRoutes);
app.use('/admin', formFieldRoutes);
app.use('/admin', availabilityRoutes);
app.use('/admin', leadRoutes);
app.use('/admin', apiKeyRoutes);
app.use('/admin', dashboardRoutes);
app.use('/admin', leadsExportRoutes);
app.use('/public', apiKeyMiddleware, publicRoutes);
app.use('/public', apiKeyMiddleware, publicAvailabilityRoutes);
app.use('/public', apiKeyMiddleware, scheduleRoutes);

app.use(errorHandler);

export { app };
