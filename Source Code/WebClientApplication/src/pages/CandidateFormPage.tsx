import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingState } from '../components/State';
import { useToast } from '../context/ToastContext';
import { useCandidate, useCrudMutations } from '../hooks/useRecruitFlowQueries';
import { candidateSchema, type CandidateForm } from '../schemas/forms';

// Shared create/edit form for candidate records.
export function CandidateFormPage() {
  const id = Number(useParams().id);
  const editing = Number.isFinite(id);
  const { data, isLoading, error } = useCandidate(id);
  const { createCandidate, updateCandidate } = useCrudMutations();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { fullName: '', email: '', phone: '', location: '', currentTitle: '', yearsExperience: 0, skills: '', salaryExpectation: '', status: 'active', notes: '' }
  });

  // When editing, load the API record into the form fields.
  useEffect(() => {
    if (data) reset({
      fullName: data.full_name,
      email: data.email,
      phone: data.phone ?? '',
      location: data.location,
      currentTitle: data.current_title,
      yearsExperience: data.years_experience,
      skills: data.skills.join(', '),
      salaryExpectation: data.salary_expectation ?? '',
      status: data.status,
      notes: data.notes ?? ''
    });
  }, [data, reset]);

  // The same form handles both create and update based on the route.
  async function submit(values: CandidateForm) {
    if (editing) await updateCandidate.mutateAsync({ id, payload: values });
    else await createCandidate.mutateAsync(values);
    notify(editing ? 'Candidate updated' : 'Candidate created', 'success');
    navigate('/candidates');
  }

  if (editing && isLoading) return <LoadingState />;
  if (editing && error) return <ErrorState message={error.message} />;

  return (
    <div className="content-grid">
      <PageHeader title={editing ? 'Edit candidate' : 'Create candidate'} detail="Validated with React Hook Form and Zod before reaching the API." />
      <section className="panel narrow-panel">
        <form className="form-grid" onSubmit={handleSubmit(submit)}>
          <Field label="Full name" error={errors.fullName?.message}><input {...register('fullName')} /></Field>
          <Field label="Email" error={errors.email?.message}><input type="email" {...register('email')} /></Field>
          <Field label="Phone"><input {...register('phone')} /></Field>
          <Field label="Location" error={errors.location?.message}><input {...register('location')} /></Field>
          <Field label="Current title" error={errors.currentTitle?.message}><input {...register('currentTitle')} /></Field>
          <Field label="Years experience" error={errors.yearsExperience?.message}><input type="number" step="0.5" {...register('yearsExperience')} /></Field>
          <Field label="Skills" error={errors.skills?.message}><input placeholder="React, Node.js, SQL" {...register('skills')} /></Field>
          <Field label="Salary expectation"><input type="number" {...register('salaryExpectation')} /></Field>
          <Field label="Status"><select {...register('status')}><option value="active">Active</option><option value="placed">Placed</option><option value="archived">Archived</option></select></Field>
          <Field label="Notes"><textarea {...register('notes')} /></Field>
          <button className="primary-button" type="submit">{editing ? 'Save changes' : 'Create candidate'}</button>
        </form>
      </section>
    </div>
  );
}

// Keeps field markup consistent and shows validation messages below inputs.
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label>{label}{children}{error && <small>{error}</small>}</label>;
}
