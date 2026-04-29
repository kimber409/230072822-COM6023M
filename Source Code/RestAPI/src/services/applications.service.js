import { query, transaction } from '../db/pool.js';
import { notFound } from '../utils/apiError.js';

// Lists applications with joined candidate/job names for the pipeline table.
export async function listApplications({ stage, jobId, candidateId, minFitScore, page = 1, limit = 10 }) {
  const filters = [];
  const values = [];

  if (stage) {
    values.push(stage);
    filters.push(`a.stage = $${values.length}`);
  }

  if (jobId) {
    values.push(jobId);
    filters.push(`a.job_id = $${values.length}`);
  }

  if (candidateId) {
    values.push(candidateId);
    filters.push(`a.candidate_id = $${values.length}`);
  }

  if (minFitScore !== undefined) {
    values.push(minFitScore);
    filters.push(`a.fit_score >= $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const result = await query(
    `SELECT a.*, c.full_name AS candidate_name, j.title AS job_title, j.department,
            COUNT(*) OVER()::int AS total_count
     FROM applications a
     JOIN candidates c ON c.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows.map(({ total_count, ...row }) => row),
    meta: { page, limit, total: result.rows[0]?.total_count ?? 0 }
  };
}

// Detail query includes both candidate skills and job requirements.
export async function getApplication(id) {
  const result = await query(
    `SELECT a.*, c.full_name AS candidate_name, c.skills AS candidate_skills,
            j.title AS job_title, j.required_skills
     FROM applications a
     JOIN candidates c ON c.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = $1`,
    [id]
  );

  if (!result.rows[0]) throw notFound('Application');
  return result.rows[0];
}

// Creation runs in a transaction because the fit score depends on related records.
export async function createApplication(application) {
  return transaction(async (client) => {
    const fitScore = await calculateFitScore(client, application.candidateId, application.jobId);
    const result = await client.query(
      `INSERT INTO applications (candidate_id, job_id, stage, fit_score, source, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [application.candidateId, application.jobId, application.stage, fitScore, application.source, application.notes]
    );
    return result.rows[0];
  });
}

// Allows pipeline stage changes and small edits without recreating the application.
export async function updateApplication(id, application) {
  const existing = await getApplication(id);
  const merged = {
    candidateId: existing.candidate_id,
    jobId: existing.job_id,
    stage: existing.stage,
    fitScore: existing.fit_score,
    source: existing.source,
    notes: existing.notes,
    ...application
  };

  const result = await query(
    `UPDATE applications
     SET candidate_id = $1, job_id = $2, stage = $3, fit_score = $4, source = $5, notes = $6, updated_at = now()
     WHERE id = $7
     RETURNING *`,
    [merged.candidateId, merged.jobId, merged.stage, merged.fitScore, merged.source, merged.notes, id]
  );

  return result.rows[0];
}

// Removes an application record from the pipeline.
export async function deleteApplication(id) {
  const result = await query('DELETE FROM applications WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Application');
}

// Basic matching score: 80% skills overlap and up to 20% experience.
async function calculateFitScore(client, candidateId, jobId) {
  const result = await client.query(
    `SELECT c.skills AS candidate_skills, c.years_experience, j.required_skills
     FROM candidates c
     CROSS JOIN jobs j
     WHERE c.id = $1 AND j.id = $2`,
    [candidateId, jobId]
  );

  const record = result.rows[0];
  if (!record) throw notFound('Candidate or job');

  const candidateSkills = new Set(record.candidate_skills);
  const matched = record.required_skills.filter((skill) => candidateSkills.has(skill)).length;
  const skillScore = record.required_skills.length ? (matched / record.required_skills.length) * 80 : 40;
  const experienceScore = Math.min(Number(record.years_experience) * 2, 20);

  return Math.round(skillScore + experienceScore);
}
