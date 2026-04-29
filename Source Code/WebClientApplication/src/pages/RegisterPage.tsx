import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserRoundPlus } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registerSchema, type RegisterForm } from '../schemas/forms';

// Register page allows a new recruiter account to be created.
export function RegisterPage() {
  const { isAuthenticated, signIn } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'recruiter' }
  });
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      signIn(session);
      notify('Account created', 'success');
      navigate('/');
    },
    onError: (error) => notify(error.message, 'error')
  });

  // Redirect logged-in users back into the main application.
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="eyebrow">RecruitFlow</p>
        <h1 id="register-title">Create recruiter account</h1>
        <form className="stacked-form" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <label>Name<input {...register('name')} />{errors.name && <small>{errors.name.message}</small>}</label>
          <label>Email<input type="email" {...register('email')} />{errors.email && <small>{errors.email.message}</small>}</label>
          <label>Password<input type="password" {...register('password')} />{errors.password && <small>{errors.password.message}</small>}</label>
          <label>Role<select {...register('role')}><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></label>
          <button className="primary-button" type="submit" disabled={mutation.isPending}><UserRoundPlus size={18} /> Register</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
