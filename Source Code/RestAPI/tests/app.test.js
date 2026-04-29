import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { authenticate } from '../src/middleware/auth.js';
import { validate } from '../src/middleware/validate.js';
import { candidateCreateSchema } from '../src/routes/schemas.js';
import { env } from '../src/config/env.js';

// These tests cover core API behaviour without needing a live PostgreSQL database.
test('createApp registers the expected Express routes', () => {
  const app = createApp();
  const routePaths = app._router.stack
    .filter((layer) => layer.route)
    .map((layer) => layer.route.path);

  assert.ok(routePaths.includes('/health'));
});

// Missing tokens should fail before a protected route can run.
test('authenticate rejects missing bearer tokens', () => {
  const req = { headers: {} };
  const res = {};

  authenticate(req, res, (error) => {
    assert.equal(error.statusCode, 401);
    assert.equal(error.message, 'Authentication token is required');
  });
});

// Valid JWTs should add the user payload to the request object.
test('authenticate accepts a valid JWT', () => {
  const token = jwt.sign({ id: 1, email: 'admin@recruitflow.dev', role: 'admin' }, env.jwtSecret);
  const req = { headers: { authorization: `Bearer ${token}` } };

  authenticate(req, {}, (error) => {
    assert.equal(error, undefined);
    assert.equal(req.user.email, 'admin@recruitflow.dev');
  });
});

// Zod validation should reject invalid candidate form data.
test('candidate validation returns Zod errors for invalid data', () => {
  const req = { body: { fullName: 'A', email: 'bad-email', skills: [] } };

  validate(candidateCreateSchema)(req, {}, (error) => {
    assert.equal(error.name, 'ZodError');
    assert.ok(error.issues.length > 0);
  });
});
