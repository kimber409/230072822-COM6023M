import { query } from '../db/pool.js';
import { notFound } from '../utils/apiError.js';

// Returns interviews joined to candidate and job labels for the frontend table.
export async function listInterviews() {
  const result = await query(
    `SELECT i.*, c.full_name AS candidate_name, j.title AS job_title
     FROM interviews i
     JOIN applications a ON a.id = i.application_id
     JOIN candidates c ON c.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     ORDER BY i.scheduled_at ASC`
  );

  return { data: result.rows, meta: { page: 1, limit: result.rows.length, total: result.rows.length } };
}

// Adds a scheduled interview linked to an application.
export async function createInterview(interview) {
  const result = await query(
    `INSERT INTO interviews (application_id, scheduled_at, mode, interviewer, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [interview.applicationId, interview.scheduledAt, interview.mode, interview.interviewer, interview.notes]
  );
  return result.rows[0];
}

// Partial interview updates are useful for marking an interview as completed.
export async function updateInterview(id, interview) {
  const existing = await query('SELECT * FROM interviews WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Interview');
  const merged = {
    applicationId: existing.rows[0].application_id,
    scheduledAt: existing.rows[0].scheduled_at,
    mode: existing.rows[0].mode,
    interviewer: existing.rows[0].interviewer,
    status: existing.rows[0].status,
    notes: existing.rows[0].notes,
    ...interview
  };

  const result = await query(
    `UPDATE interviews
     SET application_id = $1, scheduled_at = $2, mode = $3, interviewer = $4, status = $5, notes = $6, updated_at = now()
     WHERE id = $7
     RETURNING *`,
    [merged.applicationId, merged.scheduledAt, merged.mode, merged.interviewer, merged.status, merged.notes, id]
  );
  return result.rows[0];
}

// Deletes an interview appointment.
export async function deleteInterview(id) {
  const result = await query('DELETE FROM interviews WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Interview');
}
