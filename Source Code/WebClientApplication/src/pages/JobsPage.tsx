import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useCrudMutations, useJobs } from '../hooks/useRecruitFlowQueries';
import { useToast } from '../context/ToastContext';
import { currency } from '../utils/format';

// Job list page manages vacancies and demonstrates table filtering/sorting.
export function JobsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const { data, isLoading, error } = useJobs({ search, status, limit: 50 });
  const { deleteJob } = useCrudMutations();
  const { notify } = useToast();

  // Sorting is kept local so changing it does not refetch from the API.
  const rows = useMemo(() => {
    const jobs = [...(data?.data ?? [])];
    return jobs.sort((a, b) => sort === 'applications' ? (b.application_count ?? 0) - (a.application_count ?? 0) : a.title.localeCompare(b.title));
  }, [data, sort]);

  // Confirm deletion because jobs can have linked applications.
  async function remove(id: number) {
    if (!window.confirm('Delete this job and related applications?')) return;
    await deleteJob.mutateAsync(id);
    notify('Job deleted', 'success');
  }

  return (
    <div className="content-grid">
      <PageHeader title="Jobs" detail="Manage live roles, salary bands and matching criteria." actions={<Link className="primary-button" to="/jobs/new"><Plus size={18} /> New job</Link>} />
      <section className="toolbar">
        <label><Search size={16} /> Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title or description" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All</option><option value="open">Open</option><option value="paused">Paused</option><option value="closed">Closed</option></select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Name</option><option value="applications">Applications</option></select></label>
      </section>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {!isLoading && !rows.length && <EmptyState title="No jobs found" detail="Create a role or adjust the filter." />}
      {!!rows.length && <section className="panel"><DataTable headers={['Role', 'Department', 'Salary', 'Required skills', 'Applications', 'Status', '']}>{rows.map((job) => <tr key={job.id}><td><Link to={`/jobs/${job.id}`}><strong>{job.title}</strong><span>{job.location}{job.remote ? ' / Remote' : ''}</span></Link></td><td>{job.department}</td><td>{currency(job.salary_min)} - {currency(job.salary_max)}</td><td>{job.required_skills.join(', ')}</td><td>{job.application_count ?? 0}</td><td><StatusBadge value={job.status} /></td><td><button className="icon-button" aria-label="Delete job" onClick={() => remove(job.id)}><Trash2 size={16} /></button></td></tr>)}</DataTable></section>}
    </div>
  );
}
