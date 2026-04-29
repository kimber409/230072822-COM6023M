import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import {
  candidateCreateSchema,
  candidateQuerySchema,
  candidateUpdateSchema,
  idParamsSchema
} from './schemas.js';
import {
  createCandidate,
  deleteCandidate,
  getCandidate,
  listCandidates,
  updateCandidate
} from '../services/candidates.service.js';

const router = Router();

router.use(authenticate);

// List endpoint supports search/filter/pagination through query parameters.
router.get('/', validate(candidateQuerySchema, 'query'), asyncRoute(async (req, res) => {
  res.json(await listCandidates(req.query));
}));

// Detail endpoint includes application history for the candidate page.
router.get('/:id', validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  res.json(await getCandidate(req.params.id));
}));

// Create and update both validate the request before touching the database.
router.post('/', validate(candidateCreateSchema), asyncRoute(async (req, res) => {
  res.status(201).json(await createCandidate(req.body));
}));

router.patch('/:id', validate(idParamsSchema, 'params'), validate(candidateUpdateSchema), asyncRoute(async (req, res) => {
  res.json(await updateCandidate(req.params.id, req.body));
}));

// Delete is admin-only to demonstrate role-based access control.
router.delete('/:id', requireRole('admin'), validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  await deleteCandidate(req.params.id);
  res.status(204).send();
}));

export default router;
