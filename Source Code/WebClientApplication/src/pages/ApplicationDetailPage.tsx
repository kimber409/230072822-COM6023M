import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApplication } from '../hooks/useRecruitFlowQueries';

// Detail page for one application and its calculated fit score.
export function ApplicationDetailPage() {
  const id = Number(useParams().id);
  const { data, isLoading, error } = useApplication(id);
  if (isLoading) return <LoadingState label="Loading application" />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return null;
  return <div className="content-grid"><PageHeader title={`${data.candidate_name} for ${data.job_title}`} detail="Application detail and matching output." /><section className="detail-grid"><article className="panel"><span>Stage</span><StatusBadge value={data.stage} /></article><article className="panel"><span>Fit score</span><strong>{data.fit_score}%</strong></article><article className="panel"><span>Source</span><strong>{data.source}</strong></article></section><section className="panel"><h3>Notes</h3><p>{data.notes || 'No notes recorded.'}</p></section></div>;
}
