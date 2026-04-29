import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarClock } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useDashboard } from '../hooks/useRecruitFlowQueries';
import { dateTime } from '../utils/format';

const chartColors = ['#0f766e', '#2563eb', '#b45309', '#7c3aed', '#b42318', '#475569'];

// Dashboard combines API aggregates into cards, charts and recent activity tables.
export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;

  return (
    <div className="content-grid">
      <PageHeader title="Dashboard analytics" detail="Live overview of pipeline health, matching quality and upcoming interview work." />
      <section className="metric-grid">
        <Metric label="Candidates" value={data.totals.candidates} />
        <Metric label="Open jobs" value={data.totals.open_jobs} />
        <Metric label="Applications" value={data.totals.applications} />
        <Metric label="Avg. fit score" value={`${data.totals.average_fit_score}%`} />
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <h3>Pipeline by stage</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.pipelineByStage}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="panel">
          <h3>Applications by department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.applicationsByDepartment} dataKey="applications" nameKey="department" outerRadius={86} label>
                {data.applicationsByDepartment.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>
      <section className="panel">
        <h3>Recent applications</h3>
        <DataTable headers={['Candidate', 'Job', 'Stage', 'Fit score']}>
          {data.recentApplications.map((application) => (
            <tr key={application.id}>
              <td>{application.candidate_name}</td>
              <td>{application.job_title}</td>
              <td><StatusBadge value={application.stage} /></td>
              <td>{application.fit_score}%</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <section className="panel">
        <h3><CalendarClock size={18} /> Upcoming interviews</h3>
        <DataTable headers={['Candidate', 'Role', 'When', 'Interviewer']}>
          {(data.upcomingInterviews ?? []).map((interview) => (
            <tr key={interview.id}>
              <td>{interview.candidate_name}</td>
              <td>{interview.job_title}</td>
              <td>{dateTime(interview.scheduled_at)}</td>
              <td>{interview.interviewer}</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

// Small card component for the headline dashboard numbers.
function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}
