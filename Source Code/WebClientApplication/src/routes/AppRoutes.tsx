import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AboutSettingsPage } from '../pages/AboutSettingsPage';
import { ApplicationDetailPage } from '../pages/ApplicationDetailPage';
import { ApplicationFormPage } from '../pages/ApplicationFormPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { CandidateDetailPage } from '../pages/CandidateDetailPage';
import { CandidateFormPage } from '../pages/CandidateFormPage';
import { CandidatesPage } from '../pages/CandidatesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { InterviewsPage } from '../pages/InterviewsPage';
import { JobDetailPage } from '../pages/JobDetailPage';
import { JobFormPage } from '../pages/JobFormPage';
import { JobsPage } from '../pages/JobsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Route map for the single-page application.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/new" element={<CandidateFormPage />} />
          <Route path="candidates/:id" element={<CandidateDetailPage />} />
          <Route path="candidates/:id/edit" element={<CandidateFormPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/new" element={<JobFormPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="jobs/:id/edit" element={<JobFormPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/new" element={<ApplicationFormPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="settings" element={<AboutSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
