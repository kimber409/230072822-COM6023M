import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { createInterview, deleteInterview, listInterviews, updateInterview } from '../services/interviews.service.js';
import { idParamsSchema, interviewCreateSchema, interviewUpdateSchema } from './schemas.js';

const router = Router();

router.use(authenticate);

// Interviews are separated from applications so scheduling can evolve independently.
router.get('/', asyncRoute(async (req, res) => {
  res.json(await listInterviews());
}));

router.post('/', validate(interviewCreateSchema), asyncRoute(async (req, res) => {
  res.status(201).json(await createInterview(req.body));
}));

// PATCH allows small status changes without resubmitting the whole interview.
router.patch('/:id', validate(idParamsSchema, 'params'), validate(interviewUpdateSchema), asyncRoute(async (req, res) => {
  res.json(await updateInterview(req.params.id, req.body));
}));

// Admin-only delete follows the same rule as other destructive endpoints.
router.delete('/:id', requireRole('admin'), validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  await deleteInterview(req.params.id);
  res.status(204).send();
}));

export default router;
