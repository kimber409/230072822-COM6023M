import { Router } from 'express';
import { asyncRoute } from '../utils/asyncRoute.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from './schemas.js';
import { loginUser, registerUser } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Registration is included so the marker can create a new recruiter account.
router.post('/register', validate(registerSchema), asyncRoute(async (req, res) => {
  const session = await registerUser(req.body);
  res.status(201).json(session);
}));

// Login returns the JWT used by the protected API and frontend routes.
router.post('/login', validate(loginSchema), asyncRoute(async (req, res) => {
  res.json(await loginUser(req.body));
}));

// Simple protected endpoint to prove the current token is valid.
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
