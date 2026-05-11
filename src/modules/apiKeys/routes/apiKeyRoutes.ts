import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/authMiddleware';
import { ApiKeyController } from '../controllers/apiKeyController';

const apiKeyRoutes = Router();
const apiKeyController = new ApiKeyController();

apiKeyRoutes.use(authMiddleware, authorizeRoles('ADMIN'));
apiKeyRoutes.post('/api-keys', (req, res) => apiKeyController.create(req, res));
apiKeyRoutes.get('/api-keys', (req, res) => apiKeyController.list(req, res));
apiKeyRoutes.patch('/api-keys/:id/deactivate', (req, res) => apiKeyController.deactivate(req, res));
apiKeyRoutes.patch('/api-keys/:id/activate', (req, res) => apiKeyController.activate(req, res));

export { apiKeyRoutes };
