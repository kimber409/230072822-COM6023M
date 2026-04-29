import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingState } from '../components/State';
import { useToast } from '../context/ToastContext';
import { useCrudMutations, useJob } from '../hooks/useRecruitFlowQueries';
import { jobSchema, type JobForm } from '../schemas/forms';

// Shared create/edit form for vacancies.
export function JobFormPage() {
  const id = Number(useParams().id);
  const editing = Number.isFinite(id);
  const { data, isLoading, error } = useJob(id);
  const { createJob, updateJob } = useCrudMutations();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      remote: false,
      salaryMin: 35000,
      salaryMax: 65000,
      status: 'open',
      closingDate: '',
      description: '',
      requiredSkills: ''
    }
  });

  // Populate the form from the API when editing an existing job.
  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        department: data.department,
        location: data.location,
        remote: data.remote,
        salaryMin: data.salary_min,
        salaryMax: data.salary_max,
        status: data.status,
        closingDate: data.closing_date ?? '',
        description: data.description,
        requiredSkills: data.required_skills.join(', ')
      });
    }
  }, [data, reset]);

  // Create or update based on whether an ID exists in the route.
  async function submit(values: JobForm) {
    if (editing) await updateJob.mutateAsync({ id, payload: values });
    else await createJob.mutateAsync(values);
    notify(editing ? 'Job updated' : 'Job created', 'success');
    navigate('/jobs');
  }

  if (editing && isLoading) return <LoadingState />;
  if (editing && error) return <ErrorState message={error.message} />;

  return (
    <div className="content-grid">
      <PageHeader title={editing ? 'Edit job' : 'Create job'} detail="Define role requirements used by the server-side matching score." />

      <section className="panel narrow-panel">
        <form className="form-grid" onSubmit={handleSubmit(submit)}>
          <Field label="Title" error={errors.title?.message}><input {...register('title')} /></Field>
          <Field label="Department" error={errors.department?.message}><input {...register('department')} /></Field>
          <Field label="Location" error={errors.location?.message}><input {...register('location')} /></Field>
          <label className="checkbox"><input type="checkbox" {...register('remote')} /> Remote role</label>
          <Field label="Salary min" error={errors.salaryMin?.message}><input type="number" {...register('salaryMin')} /></Field>
          <Field label="Salary max" error={errors.salaryMax?.message}><input type="number" {...register('salaryMax')} /></Field>
          <Field label="Closing date"><input type="date" {...register('closingDate')} /></Field>
          <Field label="Status">
            <select {...register('status')}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <Field label="Required skills" error={errors.requiredSkills?.message}>
            <input placeholder="React, TypeScript, Accessibility" {...register('requiredSkills')} />
          </Field>
          <Field label="Description" error={errors.description?.message}><textarea {...register('description')} /></Field>
          <button className="primary-button" type="submit">{editing ? 'Save changes' : 'Create job'}</button>
        </form>
      </section>
    </div>
  );
}

// Small helper keeps form labels and errors consistent.
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label>{label}{children}{error && <small>{error}</small>}</label>;
}
