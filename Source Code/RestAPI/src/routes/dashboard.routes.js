import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { getDashboardSummary } from '../services/dashboard.service.js';

const router = Router();

router.use(authenticate);

// Single endpoint for dashboard cards and charts to reduce client requests.
router.get('/summary', asyncRoute(async (req, res) => {
  res.json(await getDashboardSummary());
}));

export default router;
