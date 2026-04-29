import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// PostgreSQL connection pool reused by all services.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});

// Small wrapper keeps database calls consistent and easy to mock in future tests.
export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

// Used when multiple database changes must succeed or fail together.
export async function transaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
