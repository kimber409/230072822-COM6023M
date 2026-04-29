import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable } from '../components/DataTable';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApplications, useCrudMutations, useInterviews } from '../hooks/useRecruitFlowQueries';
import { useToast } from '../context/ToastContext';
import { interviewSchema, type InterviewForm } from '../schemas/forms';
import { dateTime } from '../utils/format';

// Interview page schedules and tracks interviews for applications at interview stage.
export function InterviewsPage() {
  const interviews = useInterviews();
  const applications = useApplications({ stage: 'interview', limit: 50 });
  const { createInterview, deleteInterview, updateInterview } = useCrudMutations();
  const { notify } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InterviewForm>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      applicationId: 0,
      scheduledAt: '',
      mode: 'video',
      interviewer: '',
      notes: ''
    }
  });

  // Creates a new interview appointment for the selected application.
  async function submit(values: InterviewForm) {
    await createInterview.mutateAsync(values);
    notify('Interview scheduled', 'success');
    reset();
  }

  // Confirm before deleting an appointment from the schedule.
  async function remove(id: number) {
    if (!window.confirm('Delete this interview?')) return;
    await deleteInterview.mutateAsync(id);
    notify('Interview deleted', 'success');
  }

  if (interviews.isLoading || applications.isLoading) return <LoadingState />;
  if (interviews.error || applications.error) return <ErrorState message={(interviews.error || applications.error)?.message ?? 'Unable to load interviews'} />;

  const rows = interviews.data?.data ?? [];

  return (
    <div className="content-grid">
      <PageHeader title="Interviews" detail="Schedule, complete and monitor upcoming interview commitments." />

      <section className="split-view">
        <section className="panel">
          <h3>Schedule interview</h3>
          <form className="stacked-form" onSubmit={handleSubmit(submit)}>
            <label>
              Application
              <select {...register('applicationId')}>
                <option value={0}>Select application</option>
                {applications.data?.data.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.candidate_name} / {application.job_title}
                  </option>
                ))}
              </select>
              {errors.applicationId && <small>{errors.applicationId.message}</small>}
            </label>

            <label>
              Date and time
              <input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <small>{errors.scheduledAt.message}</small>}
            </label>

            <label>
              Mode
              <select {...register('mode')}>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="onsite">Onsite</option>
              </select>
            </label>

            <label>
              Interviewer
              <input {...register('interviewer')} />
              {errors.interviewer && <small>{errors.interviewer.message}</small>}
            </label>

            <label>
              Notes
              <textarea {...register('notes')} />
            </label>

            <button className="primary-button" type="submit">Schedule</button>
          </form>
        </section>

        <section className="panel">
          {!rows.length && <EmptyState title="No interviews scheduled" detail="Move applications to interview and schedule them here." />}
          {!!rows.length && (
            <DataTable headers={['Candidate', 'Job', 'When', 'Mode', 'Status', 'Actions']}>
              {rows.map((interview) => (
                <tr key={interview.id}>
                  <td>{interview.candidate_name}</td>
                  <td>{interview.job_title}</td>
                  <td>{dateTime(interview.scheduled_at)}</td>
                  <td>{interview.mode}</td>
                  <td>
                    <button
                      className="status-button"
                      onClick={() => updateInterview.mutate({
                        id: interview.id,
                        payload: { status: interview.status === 'completed' ? 'scheduled' : 'completed' }
                      })}
                    >
                      <StatusBadge value={interview.status} />
                    </button>
                  </td>
                  <td>
                    <button className="icon-button" aria-label="Delete interview" onClick={() => remove(interview.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </section>
      </section>
    </div>
  );
}
