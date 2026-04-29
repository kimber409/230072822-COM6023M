import { Link, useParams } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useJob } from '../hooks/useRecruitFlowQueries';
import { currency } from '../utils/format';

// Shows a single vacancy, required skills and matching applications.
export function JobDetailPage() {
  const id = Number(useParams().id);
  const { data, isLoading, error } = useJob(id);

  if (isLoading) return <LoadingState label="Loading job" />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;

  return (
    <div className="content-grid">
      <PageHeader
        title={data.title}
        detail={`${data.department} / ${data.location}`}
        actions={<Link className="secondary-button" to={`/jobs/${id}/edit`}><Edit size={18} /> Edit</Link>}
      />

      <section className="detail-grid">
        <article className="panel"><span>Status</span><StatusBadge value={data.status} /></article>
        <article className="panel"><span>Salary</span><strong>{currency(data.salary_min)} - {currency(data.salary_max)}</strong></article>
        <article className="panel"><span>Applications</span><strong>{data.applications?.length ?? 0}</strong></article>
      </section>

      <section className="panel">
        <h3>Description</h3>
        <p>{data.description}</p>
        <div className="tag-list">
          {data.required_skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </section>

      <section className="panel">
        <h3>Applications</h3>
        <DataTable headers={['Candidate', 'Stage', 'Fit score']}>
          {(data.applications ?? []).map((application) => (
            <tr key={application.id}>
              <td>{application.candidateName ?? application.candidate_name}</td>
              <td><StatusBadge value={application.stage} /></td>
              <td>{application.fitScore ?? application.fit_score}%</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
