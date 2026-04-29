import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApplications, useCrudMutations } from '../hooks/useRecruitFlowQueries';
import { useToast } from '../context/ToastContext';
import type { ApplicationStage } from '../types/domain';

// Application list page shows the recruitment pipeline.
export function ApplicationsPage() {
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('fit');
  const { data, isLoading, error } = useApplications({ stage, limit: 50 });
  const { deleteApplication, updateApplication } = useCrudMutations();
  const { notify } = useToast();

  // Sort after fetching so the API filter and client sort can work together.
  const rows = useMemo(() => {
    const applications = [...(data?.data ?? [])];

    return applications.sort((a, b) => {
      if (sort === 'fit') return b.fit_score - a.fit_score;
      return a.stage.localeCompare(b.stage);
    });
  }, [data, sort]);

  // Delete is confirmed because applications are part of the audit trail.
  async function remove(id: number) {
    if (!window.confirm('Delete this application record?')) return;
    await deleteApplication.mutateAsync(id);
    notify('Application deleted', 'success');
  }

  // Moves an application one step forward in the normal hiring pipeline.
  async function advance(id: number, current: string) {
    const stages = ['applied', 'screening', 'interview', 'offer', 'hired'];
    const next = stages[Math.min(stages.indexOf(current) + 1, stages.length - 1)] || 'screening';
    await updateApplication.mutateAsync({ id, payload: { stage: next as ApplicationStage } });
    notify(`Application moved to ${next}`, 'success');
  }

  return (
    <div className="content-grid">
      <PageHeader
        title="Applications"
        detail="Track candidate progress through the hiring pipeline."
        actions={<Link className="primary-button" to="/applications/new"><Plus size={18} /> New application</Link>}
      />

      <section className="toolbar">
        <label>
          Stage
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="">All stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="fit">Fit score</option>
            <option value="stage">Stage</option>
          </select>
        </label>
      </section>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {!isLoading && !rows.length && (
        <EmptyState title="No applications found" detail="Create an application to start tracking the pipeline." />
      )}

      {!!rows.length && (
        <section className="panel">
          <DataTable headers={['Candidate', 'Job', 'Stage', 'Fit score', 'Actions']}>
            {rows.map((application) => (
              <tr key={application.id}>
                <td><Link to={`/applications/${application.id}`}>{application.candidate_name}</Link></td>
                <td>{application.job_title}</td>
                <td><StatusBadge value={application.stage} /></td>
                <td>{application.fit_score}%</td>
                <td className="actions">
                  <button className="secondary-button compact" onClick={() => advance(application.id, application.stage)}>
                    Advance
                  </button>
                  <button className="icon-button" aria-label="Delete application" onClick={() => remove(application.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}
    </div>
  );
}
