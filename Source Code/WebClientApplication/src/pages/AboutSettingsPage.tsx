import { PageHeader } from '../components/PageHeader';
import { API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Simple page for configuration details and assessment coverage notes.
export function AboutSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="content-grid">
      <PageHeader title="Settings and about" detail="Deployment configuration, current user and assessment-facing project notes." />
      <section className="panel settings-grid">
        <div><span>Signed in as</span><strong>{user?.name}</strong><p>{user?.email} / {user?.role}</p></div>
        <div><span>API base URL</span><strong>{API_BASE_URL}</strong><p>Configured through VITE_API_BASE_URL for deployment.</p></div>
        <div><span>Project mode</span><strong>Recruitment management system</strong><p>REST API plus browser client with CRUD, analytics and protected workflows.</p></div>
      </section>
    </div>
  );
}
