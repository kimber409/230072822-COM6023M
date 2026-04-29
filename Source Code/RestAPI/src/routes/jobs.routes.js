import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { createJob, deleteJob, getJob, listJobs, updateJob } from '../services/jobs.service.js';
import { idParamsSchema, jobCreateSchema, jobQuerySchema, jobUpdateSchema } from './schemas.js';

const router = Router();

router.use(authenticate);

// Jobs can be searched and filtered so the client can pass meaningful parameters.
router.get('/', validate(jobQuerySchema, 'query'), asyncRoute(async (req, res) => {
  res.json(await listJobs(req.query));
}));

// Detail endpoint returns the job plus its linked applications.
router.get('/:id', validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  res.json(await getJob(req.params.id));
}));

// Job create/update routes share Zod validation for salary and required skills.
router.post('/', validate(jobCreateSchema), asyncRoute(async (req, res) => {
  res.status(201).json(await createJob(req.body));
}));

router.patch('/:id', validate(idParamsSchema, 'params'), validate(jobUpdateSchema), asyncRoute(async (req, res) => {
  res.json(await updateJob(req.params.id, req.body));
}));

// Delete requires admin permissions because it cascades to related applications.
router.delete('/:id', requireRole('admin'), validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  await deleteJob(req.params.id);
  res.status(204).send();
}));

export default router;
