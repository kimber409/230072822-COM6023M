import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingState } from '../components/State';
import { useToast } from '../context/ToastContext';
import { useCandidates, useCrudMutations, useJobs } from '../hooks/useRecruitFlowQueries';
import { applicationSchema, type ApplicationForm } from '../schemas/forms';

// Creates an application between a candidate and a job.
export function ApplicationFormPage() {
  const candidates = useCandidates({ limit: 50 });
  const jobs = useJobs({ limit: 50 });
  const { createApplication } = useCrudMutations();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      candidateId: 0,
      jobId: 0,
      stage: 'applied',
      source: 'RecruitFlow',
      notes: ''
    }
  });

  // The backend calculates the fit score after this request is submitted.
  async function submit(values: ApplicationForm) {
    await createApplication.mutateAsync(values);
    notify('Application created with calculated fit score', 'success');
    navigate('/applications');
  }

  if (candidates.isLoading || jobs.isLoading) return <LoadingState />;
  if (candidates.error || jobs.error) return <ErrorState message={(candidates.error || jobs.error)?.message ?? 'Unable to load form data'} />;

  return (
    <div className="content-grid">
      <PageHeader title="Create application" detail="The backend calculates candidate-job fit from skills and experience." />

      <section className="panel narrow-panel">
        <form className="form-grid" onSubmit={handleSubmit(submit)}>
          <Field label="Candidate" error={errors.candidateId?.message}>
            <select {...register('candidateId')}>
              <option value={0}>Select candidate</option>
              {candidates.data?.data.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.full_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Job" error={errors.jobId?.message}>
            <select {...register('jobId')}>
              <option value={0}>Select job</option>
              {jobs.data?.data.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </Field>

          <Field label="Stage">
            <select {...register('stage')}>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>

          <Field label="Source" error={errors.source?.message}><input {...register('source')} /></Field>
          <Field label="Notes"><textarea {...register('notes')} /></Field>
          <button className="primary-button" type="submit">Create application</button>
        </form>
      </section>
    </div>
  );
}

// Shared form field wrapper for label, input and error text.
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label>{label}{children}{error && <small>{error}</small>}</label>;
}
