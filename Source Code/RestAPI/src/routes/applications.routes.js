import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication
} from '../services/applications.service.js';
import {
  applicationCreateSchema,
  applicationQuerySchema,
  applicationUpdateSchema,
  idParamsSchema
} from './schemas.js';

const router = Router();

router.use(authenticate);

// Application list supports pipeline filters such as stage and minimum fit score.
router.get('/', validate(applicationQuerySchema, 'query'), asyncRoute(async (req, res) => {
  res.json(await listApplications(req.query));
}));

// Detail endpoint is used by the application detail page in the client.
router.get('/:id', validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  res.json(await getApplication(req.params.id));
}));

// Creating an application triggers the service-level matching score calculation.
router.post('/', validate(applicationCreateSchema), asyncRoute(async (req, res) => {
  res.status(201).json(await createApplication(req.body));
}));

router.patch('/:id', validate(idParamsSchema, 'params'), validate(applicationUpdateSchema), asyncRoute(async (req, res) => {
  res.json(await updateApplication(req.params.id, req.body));
}));

// Delete is protected by role checks because it removes pipeline evidence.
router.delete('/:id', requireRole('admin'), validate(idParamsSchema, 'params'), asyncRoute(async (req, res) => {
  await deleteApplication(req.params.id);
  res.status(204).send();
}));

export default router;
