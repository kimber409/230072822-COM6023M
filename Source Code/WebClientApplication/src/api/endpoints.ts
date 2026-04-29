import { apiClient } from './client';
import type { Application, Candidate, DashboardSummary, Interview, Job, Paginated, Session } from '../types/domain';
import type { ApplicationForm, CandidateForm, InterviewForm, JobForm, LoginForm, RegisterForm } from '../schemas/forms';
import { splitCsv } from '../utils/format';

type QueryParams = Record<string, string | number | boolean | undefined>;

// Endpoint wrappers keep HTTP details out of the React pages.
export const authApi = {
  login: async (payload: LoginForm) => (await apiClient.post<Session>('/api/auth/login', payload)).data,
  register: async (payload: RegisterForm) => (await apiClient.post<Session>('/api/auth/register', payload)).data
};

// Dashboard endpoint returns all chart/card data in one request.
export const dashboardApi = {
  summary: async () => (await apiClient.get<DashboardSummary>('/api/dashboard/summary')).data
};

// Candidate CRUD calls convert form fields into the API payload shape.
export const candidatesApi = {
  list: async (params: QueryParams) => (await apiClient.get<Paginated<Candidate>>('/api/candidates', { params: cleanParams(params) })).data,
  get: async (id: number) => (await apiClient.get<Candidate & { applications?: Application[] }>(`/api/candidates/${id}`)).data,
  create: async (payload: CandidateForm) => (await apiClient.post<Candidate>('/api/candidates', normalizeCandidate(payload))).data,
  update: async (id: number, payload: Partial<CandidateForm>) => (await apiClient.patch<Candidate>(`/api/candidates/${id}`, normalizeCandidate(payload))).data,
  remove: async (id: number) => apiClient.delete(`/api/candidates/${id}`)
};

// Job CRUD calls include required skills used by backend matching.
export const jobsApi = {
  list: async (params: QueryParams) => (await apiClient.get<Paginated<Job>>('/api/jobs', { params: cleanParams(params) })).data,
  get: async (id: number) => (await apiClient.get<Job & { applications?: Application[] }>(`/api/jobs/${id}`)).data,
  create: async (payload: JobForm) => (await apiClient.post<Job>('/api/jobs', normalizeJob(payload))).data,
  update: async (id: number, payload: Partial<JobForm>) => (await apiClient.patch<Job>(`/api/jobs/${id}`, normalizeJob(payload))).data,
  remove: async (id: number) => apiClient.delete(`/api/jobs/${id}`)
};

// Application calls handle pipeline creation and stage updates.
export const applicationsApi = {
  list: async (params: QueryParams) => (await apiClient.get<Paginated<Application>>('/api/applications', { params: cleanParams(params) })).data,
  get: async (id: number) => (await apiClient.get<Application>(`/api/applications/${id}`)).data,
  create: async (payload: ApplicationForm) => (await apiClient.post<Application>('/api/applications', payload)).data,
  update: async (id: number, payload: Partial<ApplicationForm> & { stage?: string }) => (await apiClient.patch<Application>(`/api/applications/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/api/applications/${id}`)
};

// Interview calls support scheduling and status changes.
export const interviewsApi = {
  list: async () => (await apiClient.get<Paginated<Interview>>('/api/interviews')).data,
  create: async (payload: InterviewForm) => (await apiClient.post<Interview>('/api/interviews', payload)).data,
  update: async (id: number, payload: Partial<InterviewForm> & { status?: string }) => (await apiClient.patch<Interview>(`/api/interviews/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/api/interviews/${id}`)
};

// Converts the comma-separated skills input into the array expected by the API.
function normalizeCandidate(payload: Partial<CandidateForm>) {
  return {
    ...payload,
    skills: typeof payload.skills === 'string' ? splitCsv(payload.skills) : undefined,
    salaryExpectation: payload.salaryExpectation === '' ? null : payload.salaryExpectation
  };
}

// Converts job form fields into API naming and array formats.
function normalizeJob(payload: Partial<JobForm>) {
  return {
    ...payload,
    requiredSkills: typeof payload.requiredSkills === 'string' ? splitCsv(payload.requiredSkills) : undefined,
    closingDate: payload.closingDate || null
  };
}

// Avoid sending empty filter values like status=, which the API treats as omitted.
function cleanParams(params: QueryParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}
