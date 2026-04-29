import { query } from '../db/pool.js';

// Pulls all dashboard metrics in parallel to keep the endpoint responsive.
export async function getDashboardSummary() {
  const [totals, stages, departments, recent, interviews] = await Promise.all([
    query(`SELECT
      (SELECT COUNT(*)::int FROM candidates) AS candidates,
      (SELECT COUNT(*)::int FROM jobs WHERE status = 'open') AS open_jobs,
      (SELECT COUNT(*)::int FROM applications) AS applications,
      (SELECT COALESCE(ROUND(AVG(fit_score)::numeric, 1), 0)::float FROM applications) AS average_fit_score,
      (SELECT COUNT(*)::int FROM interviews WHERE scheduled_at >= now() AND status = 'scheduled') AS upcoming_interviews`),
    query(`SELECT stage, COUNT(*)::int AS total FROM applications GROUP BY stage ORDER BY total DESC`),
    query(`SELECT j.department, COUNT(a.id)::int AS applications
           FROM jobs j
           LEFT JOIN applications a ON a.job_id = j.id
           GROUP BY j.department
           ORDER BY applications DESC`),
    query(`SELECT a.id, a.stage, a.fit_score, a.updated_at, c.full_name AS candidate_name, j.title AS job_title
           FROM applications a
           JOIN candidates c ON c.id = a.candidate_id
           JOIN jobs j ON j.id = a.job_id
           ORDER BY a.updated_at DESC
           LIMIT 6`),
    query(`SELECT i.*, c.full_name AS candidate_name, j.title AS job_title
           FROM interviews i
           JOIN applications a ON a.id = i.application_id
           JOIN candidates c ON c.id = a.candidate_id
           JOIN jobs j ON j.id = a.job_id
           WHERE i.scheduled_at >= now() AND i.status = 'scheduled'
           ORDER BY i.scheduled_at ASC
           LIMIT 6`)
  ]);

  return {
    totals: totals.rows[0],
    pipelineByStage: stages.rows,
    applicationsByDepartment: departments.rows,
    recentApplications: recent.rows,
    upcomingInterviews: interviews.rows
  };
}
