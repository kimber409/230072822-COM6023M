import { Link, useParams } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { DataTable } from '../components/DataTable';
import { useCandidate } from '../hooks/useRecruitFlowQueries';
import { currency } from '../utils/format';

// Shows a single candidate with skills and related applications.
export function CandidateDetailPage() {
  const id = Number(useParams().id);
  const { data, isLoading, error } = useCandidate(id);

  if (isLoading) return <LoadingState label="Loading candidate" />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;

  return (
    <div className="content-grid">
      <PageHeader title={data.full_name} detail={`${data.current_title} / ${data.location}`} actions={<Link className="secondary-button" to={`/candidates/${id}/edit`}><Edit size={18} /> Edit</Link>} />
      <section className="detail-grid">
        <article className="panel"><span>Status</span><StatusBadge value={data.status} /></article>
        <article className="panel"><span>Experience</span><strong>{data.years_experience} years</strong></article>
        <article className="panel"><span>Salary expectation</span><strong>{currency(data.salary_expectation)}</strong></article>
      </section>
      <section className="panel"><h3>Skills</h3><div className="tag-list">{data.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
      <section className="panel">
        <h3>Applications</h3>
        <DataTable headers={['Job', 'Stage', 'Fit score']}>
          {(data.applications ?? []).map((application) => (
            <tr key={application.id}>
              <td>{application.jobTitle ?? application.job_title}</td>
              <td><StatusBadge value={application.stage} /></td>
              <td>{application.fitScore ?? application.fit_score}%</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
