import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, candidatesApi, dashboardApi, interviewsApi, jobsApi } from '../api/endpoints';
import type { ApplicationForm, CandidateForm, InterviewForm, JobForm } from '../schemas/forms';

// Query hooks centralise server state so pages stay focused on UI.
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.summary });
}

export function useCandidates(params: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ['candidates', params], queryFn: () => candidatesApi.list(params) });
}

export function useCandidate(id: number) {
  return useQuery({ queryKey: ['candidate', id], queryFn: () => candidatesApi.get(id), enabled: Number.isFinite(id) });
}

export function useJobs(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: ['jobs', params], queryFn: () => jobsApi.list(params) });
}

export function useJob(id: number) {
  return useQuery({ queryKey: ['job', id], queryFn: () => jobsApi.get(id), enabled: Number.isFinite(id) });
}

export function useApplications(params: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ['applications', params], queryFn: () => applicationsApi.list(params) });
}

export function useApplication(id: number) {
  return useQuery({ queryKey: ['application', id], queryFn: () => applicationsApi.get(id), enabled: Number.isFinite(id) });
}

export function useInterviews() {
  return useQuery({ queryKey: ['interviews'], queryFn: interviewsApi.list });
}

// Mutations invalidate related queries so dashboard and tables refresh after edits.
export function useCrudMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['interviews'] });
  };

  return {
    createCandidate: useMutation({ mutationFn: (payload: CandidateForm) => candidatesApi.create(payload), onSuccess: invalidate }),
    updateCandidate: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<CandidateForm> }) => candidatesApi.update(id, payload), onSuccess: invalidate }),
    deleteCandidate: useMutation({ mutationFn: (id: number) => candidatesApi.remove(id), onSuccess: invalidate }),
    createJob: useMutation({ mutationFn: (payload: JobForm) => jobsApi.create(payload), onSuccess: invalidate }),
    updateJob: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<JobForm> }) => jobsApi.update(id, payload), onSuccess: invalidate }),
    deleteJob: useMutation({ mutationFn: (id: number) => jobsApi.remove(id), onSuccess: invalidate }),
    createApplication: useMutation({ mutationFn: (payload: ApplicationForm) => applicationsApi.create(payload), onSuccess: invalidate }),
    updateApplication: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<ApplicationForm> & { stage?: string } }) => applicationsApi.update(id, payload), onSuccess: invalidate }),
    deleteApplication: useMutation({ mutationFn: (id: number) => applicationsApi.remove(id), onSuccess: invalidate }),
    createInterview: useMutation({ mutationFn: (payload: InterviewForm) => interviewsApi.create(payload), onSuccess: invalidate }),
    updateInterview: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: Partial<InterviewForm> & { status?: string } }) => interviewsApi.update(id, payload), onSuccess: invalidate }),
    deleteInterview: useMutation({ mutationFn: (id: number) => interviewsApi.remove(id), onSuccess: invalidate })
  };
}
