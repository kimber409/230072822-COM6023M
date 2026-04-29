import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useCandidates, useCrudMutations } from '../hooks/useRecruitFlowQueries';
import { useToast } from '../context/ToastContext';
import { currency } from '../utils/format';

// Candidate list page demonstrates search, filter, sort and delete workflows.
export function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('name');
  const { data, isLoading, error } = useCandidates({ search, status, limit: 50 });
  const { deleteCandidate } = useCrudMutations();
  const { notify } = useToast();

  // Sorting is done client-side after the API returns the filtered list.
  const rows = useMemo(() => {
    const candidates = [...(data?.data ?? [])];
    return candidates.sort((a, b) => {
      if (sort === 'fit') return (b.average_fit_score ?? 0) - (a.average_fit_score ?? 0);
      if (sort === 'applications') return (b.application_count ?? 0) - (a.application_count ?? 0);
      return a.full_name.localeCompare(b.full_name);
    });
  }, [data, sort]);

  // Confirm before delete because this is a destructive action.
  async function remove(id: number) {
    if (!window.confirm('Delete this candidate and related applications?')) return;
    await deleteCandidate.mutateAsync(id);
    notify('Candidate deleted', 'success');
  }

  return (
    <div className="content-grid">
      <PageHeader title="Candidates" detail="Search, rank and manage candidate records." actions={<Link className="primary-button" to="/candidates/new"><Plus size={18} /> New candidate</Link>} />
      <section className="toolbar">
        <label><Search size={16} /> Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email or title" /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All</option><option value="active">Active</option><option value="placed">Placed</option><option value="archived">Archived</option></select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Name</option><option value="applications">Applications</option><option value="fit">Fit score</option></select></label>
      </section>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {!isLoading && !rows.length && <EmptyState title="No candidates found" detail="Try a different search or create a new candidate." />}
      {!!rows.length && (
        <section className="panel">
          <DataTable headers={['Name', 'Title', 'Skills', 'Salary', 'Applications', 'Status', '']}>
            {rows.map((candidate) => (
              <tr key={candidate.id}>
                <td><Link to={`/candidates/${candidate.id}`}><strong>{candidate.full_name}</strong><span>{candidate.email}</span></Link></td>
                <td>{candidate.current_title}</td>
                <td>{candidate.skills.join(', ')}</td>
                <td>{currency(candidate.salary_expectation)}</td>
                <td>{candidate.application_count ?? 0}</td>
                <td><StatusBadge value={candidate.status} /></td>
                <td><button className="icon-button" aria-label="Delete candidate" onClick={() => remove(candidate.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}
    </div>
  );
}
