import { z } from 'zod';

// Client-side schemas match the API validation rules where possible.
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'recruiter']).default('recruiter')
});

export const candidateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  currentTitle: z.string().min(2, 'Current title is required'),
  yearsExperience: z.coerce.number().min(0).max(60),
  skills: z.string().min(2, 'Add at least one skill'),
  salaryExpectation: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.enum(['active', 'placed', 'archived']).default('active'),
  notes: z.string().optional()
});

export const jobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().min(2, 'Location is required'),
  remote: z.boolean().default(false),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  status: z.enum(['draft', 'open', 'paused', 'closed']).default('open'),
  closingDate: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requiredSkills: z.string().min(2, 'Add at least one required skill')
}).refine((data) => data.salaryMax >= data.salaryMin, {
  path: ['salaryMax'],
  message: 'Maximum salary must be greater than minimum salary'
});

export const applicationSchema = z.object({
  candidateId: z.coerce.number().positive('Select a candidate'),
  jobId: z.coerce.number().positive('Select a job'),
  stage: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).default('applied'),
  source: z.string().min(2, 'Source is required'),
  notes: z.string().optional()
});

export const interviewSchema = z.object({
  applicationId: z.coerce.number().positive('Select an application'),
  scheduledAt: z.string().min(1, 'Date and time is required'),
  mode: z.enum(['video', 'phone', 'onsite']).default('video'),
  interviewer: z.string().min(2, 'Interviewer is required'),
  notes: z.string().optional()
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CandidateForm = z.infer<typeof candidateSchema>;
export type JobForm = z.infer<typeof jobSchema>;
export type ApplicationForm = z.infer<typeof applicationSchema>;
export type InterviewForm = z.infer<typeof interviewSchema>;
