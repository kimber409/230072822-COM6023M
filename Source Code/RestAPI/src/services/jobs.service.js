import { query } from '../db/pool.js';
import { notFound } from '../utils/apiError.js';

// Lists jobs with optional filters plus application counts for table display.
export async function listJobs({ search, status, department, remote, page = 1, limit = 10 }) {
  const filters = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    filters.push(`(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length})`);
  }

  if (status) {
    values.push(status);
    filters.push(`j.status = $${values.length}`);
  }

  if (department) {
    values.push(department);
    filters.push(`j.department = $${values.length}`);
  }

  if (remote !== undefined) {
    values.push(remote);
    filters.push(`j.remote = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const result = await query(
    `SELECT j.*,
            COUNT(a.id)::int AS application_count,
            COALESCE(ROUND(AVG(a.fit_score)::numeric, 1), 0)::float AS average_fit_score,
            COUNT(*) OVER()::int AS total_count
     FROM jobs j
     LEFT JOIN applications a ON a.job_id = j.id
     ${where}
     GROUP BY j.id
     ORDER BY j.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows.map(({ total_count, ...row }) => row),
    meta: { page, limit, total: result.rows[0]?.total_count ?? 0 }
  };
}

// Job detail includes related applications for the detail page.
export async function getJob(id) {
  const result = await query(
    `SELECT j.*,
            COALESCE(json_agg(
              json_build_object(
                'id', a.id,
                'candidateId', c.id,
                'candidateName', c.full_name,
                'stage', a.stage,
                'fitScore', a.fit_score
              )
            ) FILTER (WHERE a.id IS NOT NULL), '[]') AS applications
     FROM jobs j
     LEFT JOIN applications a ON a.job_id = j.id
     LEFT JOIN candidates c ON c.id = a.candidate_id
     WHERE j.id = $1
     GROUP BY j.id`,
    [id]
  );

  if (!result.rows[0]) throw notFound('Job');
  return result.rows[0];
}

// Creates a job record with required skills used later by matching.
export async function createJob(job) {
  const result = await query(
    `INSERT INTO jobs (title, department, location, remote, salary_min, salary_max, status, closing_date, description, required_skills)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [job.title, job.department, job.location, job.remote, job.salaryMin, job.salaryMax, job.status, job.closingDate, job.description, job.requiredSkills]
  );
  return result.rows[0];
}

// Merges partial updates so PATCH requests can change only one field.
export async function updateJob(id, job) {
  const existing = await getJob(id);
  const merged = {
    title: existing.title,
    department: existing.department,
    location: existing.location,
    remote: existing.remote,
    salaryMin: existing.salary_min,
    salaryMax: existing.salary_max,
    status: existing.status,
    closingDate: existing.closing_date,
    description: existing.description,
    requiredSkills: existing.required_skills,
    ...job
  };

  const result = await query(
    `UPDATE jobs
     SET title = $1, department = $2, location = $3, remote = $4, salary_min = $5, salary_max = $6,
         status = $7, closing_date = $8, description = $9, required_skills = $10, updated_at = now()
     WHERE id = $11
     RETURNING *`,
    [merged.title, merged.department, merged.location, merged.remote, merged.salaryMin, merged.salaryMax, merged.status, merged.closingDate, merged.description, merged.requiredSkills, id]
  );

  return result.rows[0];
}

// Deletes a job and relies on foreign-key cascade for linked applications.
export async function deleteJob(id) {
  const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Job');
}
