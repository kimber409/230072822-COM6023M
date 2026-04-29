import { query } from '../db/pool.js';
import { notFound } from '../utils/apiError.js';

// Builds a filtered candidate query with pagination and application summary data.
export async function listCandidates({ search, status, skill, page = 1, limit = 10 }) {
  const filters = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    filters.push(`(c.full_name ILIKE $${values.length} OR c.email ILIKE $${values.length} OR c.current_title ILIKE $${values.length})`);
  }

  if (status) {
    values.push(status);
    filters.push(`c.status = $${values.length}`);
  }

  if (skill) {
    values.push(skill);
    filters.push(`$${values.length} = ANY(c.skills)`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const result = await query(
    `SELECT c.*,
            COUNT(a.id)::int AS application_count,
            COALESCE(ROUND(AVG(a.fit_score)::numeric, 1), 0)::float AS average_fit_score,
            COUNT(*) OVER()::int AS total_count
     FROM candidates c
     LEFT JOIN applications a ON a.candidate_id = c.id
     ${where}
     GROUP BY c.id
     ORDER BY c.updated_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows.map(({ total_count, ...row }) => row),
    meta: {
      page,
      limit,
      total: result.rows[0]?.total_count ?? 0
    }
  };
}

// Candidate detail joins applications so the frontend does not need extra requests.
export async function getCandidate(id) {
  const result = await query(
    `SELECT c.*,
            COALESCE(json_agg(
              json_build_object(
                'id', a.id,
                'jobId', j.id,
                'jobTitle', j.title,
                'stage', a.stage,
                'fitScore', a.fit_score,
                'appliedAt', a.applied_at
              )
            ) FILTER (WHERE a.id IS NOT NULL), '[]') AS applications
     FROM candidates c
     LEFT JOIN applications a ON a.candidate_id = c.id
     LEFT JOIN jobs j ON j.id = a.job_id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );

  if (!result.rows[0]) throw notFound('Candidate');
  return result.rows[0];
}

// Inserts a new candidate after route-level validation has already run.
export async function createCandidate(candidate) {
  const result = await query(
    `INSERT INTO candidates (full_name, email, phone, location, current_title, years_experience, skills, salary_expectation, status, notes)
     VALUES ($1, lower($2), $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      candidate.fullName,
      candidate.email,
      candidate.phone,
      candidate.location,
      candidate.currentTitle,
      candidate.yearsExperience,
      candidate.skills,
      candidate.salaryExpectation,
      candidate.status,
      candidate.notes
    ]
  );
  return result.rows[0];
}

// PATCH support is implemented by merging existing data with submitted fields.
export async function updateCandidate(id, candidate) {
  const existing = await getCandidate(id);
  const merged = { ...toCandidateInput(existing), ...candidate };

  const result = await query(
    `UPDATE candidates
     SET full_name = $1, email = lower($2), phone = $3, location = $4, current_title = $5,
         years_experience = $6, skills = $7, salary_expectation = $8, status = $9, notes = $10,
         updated_at = now()
     WHERE id = $11
     RETURNING *`,
    [
      merged.fullName,
      merged.email,
      merged.phone,
      merged.location,
      merged.currentTitle,
      merged.yearsExperience,
      merged.skills,
      merged.salaryExpectation,
      merged.status,
      merged.notes,
      id
    ]
  );

  return result.rows[0];
}

// Deletes the candidate and lets database cascade rules handle child records.
export async function deleteCandidate(id) {
  const result = await query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Candidate');
}

// Converts database column names back into the frontend/API input shape.
function toCandidateInput(row) {
  return {
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    currentTitle: row.current_title,
    yearsExperience: row.years_experience,
    skills: row.skills,
    salaryExpectation: row.salary_expectation,
    status: row.status,
    notes: row.notes
  };
}
