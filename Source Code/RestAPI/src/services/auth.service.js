import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const publicUserFields = 'id, name, email, role, created_at';

// Creates a user account and returns the same session shape as login.
export async function registerUser({ name, email, password, role = 'recruiter' }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, lower($2), $3, $4)
     RETURNING ${publicUserFields}`,
    [name, email, passwordHash, role]
  );

  return createSession(result.rows[0]);
}

// Checks credentials and creates a signed JWT session.
export async function loginUser({ email, password }) {
  const result = await query('SELECT * FROM users WHERE email = lower($1)', [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }

  return createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  });
}

// JWT payload is kept small but includes role for authorization checks.
function createSession(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  return { token, user };
}
