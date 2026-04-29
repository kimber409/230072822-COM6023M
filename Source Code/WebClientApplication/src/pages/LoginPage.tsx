import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginSchema, type LoginForm } from '../schemas/forms';

// Login page authenticates the user and stores the returned session.
export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@recruitflow.dev', password: 'RecruitFlow2026!' }
  });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      signIn(session);
      notify('Signed in successfully', 'success');
      navigate('/');
    },
    onError: (error) => notify(error.message, 'error')
  });

  // Already-authenticated users should not see the login form again.
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">RecruitFlow</p>
        <h1 id="login-title">Recruitment operations workspace</h1>
        <form className="stacked-form" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <label>Email<input type="email" {...register('email')} />{errors.email && <small>{errors.email.message}</small>}</label>
          <label>Password<input type="password" {...register('password')} />{errors.password && <small>{errors.password.message}</small>}</label>
          <button className="primary-button" type="submit" disabled={mutation.isPending}><Send size={18} /> Sign in</button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Register a recruiter</Link></p>
      </section>
    </main>
  );
}
