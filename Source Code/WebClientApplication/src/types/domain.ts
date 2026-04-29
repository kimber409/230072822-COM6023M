// Shared TypeScript types for API responses and frontend state.
export type UserRole = 'admin' | 'recruiter';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
};

export type CandidateStatus = 'active' | 'placed' | 'archived';
export type JobStatus = 'draft' | 'open' | 'paused' | 'closed';
export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export type Candidate = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  location: string;
  current_title: string;
  years_experience: number;
  skills: string[];
  salary_expectation?: number | null;
  status: CandidateStatus;
  notes?: string | null;
  application_count?: number;
  average_fit_score?: number;
  created_at?: string;
  updated_at?: string;
};

export type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  remote: boolean;
  salary_min: number;
  salary_max: number;
  status: JobStatus;
  closing_date?: string | null;
  description: string;
  required_skills: string[];
  application_count?: number;
  average_fit_score?: number;
  created_at?: string;
  updated_at?: string;
};

export type Application = {
  id: number;
  candidate_id: number;
  job_id: number;
  stage: ApplicationStage;
  fit_score: number;
  source: string;
  notes?: string | null;
  applied_at?: string;
  updated_at?: string;
  candidate_name?: string;
  candidateName?: string;
  job_title?: string;
  jobTitle?: string;
  department?: string;
  fitScore?: number;
};

export type Interview = {
  id: number;
  application_id: number;
  candidate_name: string;
  job_title: string;
  scheduled_at: string;
  mode: 'video' | 'phone' | 'onsite';
  interviewer: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type DashboardSummary = {
  totals: {
    candidates: number;
    open_jobs: number;
    applications: number;
    average_fit_score: number;
    upcoming_interviews?: number;
  };
  pipelineByStage: Array<{ stage: ApplicationStage; total: number }>;
  applicationsByDepartment: Array<{ department: string; applications: number }>;
  recentApplications: Application[];
  upcomingInterviews?: Interview[];
};

export type Session = {
  token: string;
  user: User;
};
