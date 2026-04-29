import { z } from 'zod';

// Shared primitive schemas keep route validation consistent.
const id = z.coerce.number().int().positive();
const page = z.coerce.number().int().positive().default(1);
const limit = z.coerce.number().int().min(1).max(50).default(10);
const blankToUndefined = (value) => value === '' ? undefined : value;
const optionalText = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());
const optionalEnum = (values) => z.preprocess(blankToUndefined, z.enum(values).optional());

export const idParamsSchema = z.object({ id });

// Authentication schemas validate login/register forms.
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'recruiter']).default('recruiter')
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128)
});

// Candidate schemas mirror the form fields in the frontend.
export const candidateQuerySchema = z.object({
  search: optionalText,
  status: optionalEnum(['active', 'placed', 'archived']),
  skill: optionalText,
  page,
  limit
});

export const candidateCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  location: z.string().trim().min(2).max(120),
  currentTitle: z.string().trim().min(2).max(160),
  yearsExperience: z.coerce.number().min(0).max(60),
  skills: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
  salaryExpectation: z.coerce.number().int().min(0).max(500000).optional().nullable(),
  status: z.enum(['active', 'placed', 'archived']).default('active'),
  notes: z.string().trim().max(2000).optional().nullable()
});

export const candidateUpdateSchema = candidateCreateSchema.partial();

// Job validation includes a cross-field salary check.
export const jobQuerySchema = z.object({
  search: optionalText,
  status: optionalEnum(['draft', 'open', 'paused', 'closed']),
  department: optionalText,
  remote: z.preprocess(blankToUndefined, z.enum(['true', 'false']).transform((value) => value === 'true').optional()),
  page,
  limit
});

const jobBaseSchema = z.object({
  title: z.string().trim().min(2).max(160),
  department: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  remote: z.boolean().default(false),
  salaryMin: z.coerce.number().int().min(0).max(500000),
  salaryMax: z.coerce.number().int().min(0).max(500000),
  status: z.enum(['draft', 'open', 'paused', 'closed']).default('open'),
  closingDate: z.string().date().optional().nullable(),
  description: z.string().trim().min(20).max(4000),
  requiredSkills: z.array(z.string().trim().min(1).max(60)).min(1).max(20)
});

export const jobCreateSchema = jobBaseSchema.refine((data) => data.salaryMax >= data.salaryMin, {
  path: ['salaryMax'],
  message: 'Salary maximum must be greater than or equal to salary minimum'
});

export const jobUpdateSchema = jobBaseSchema.partial().refine((data) => {
  if (data.salaryMin === undefined || data.salaryMax === undefined) return true;
  return data.salaryMax >= data.salaryMin;
}, {
  path: ['salaryMax'],
  message: 'Salary maximum must be greater than or equal to salary minimum'
});

// Application validation protects the pipeline and matching score inputs.
export const applicationQuerySchema = z.object({
  stage: optionalEnum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']),
  jobId: z.preprocess(blankToUndefined, id.optional()),
  candidateId: z.preprocess(blankToUndefined, id.optional()),
  minFitScore: z.preprocess(blankToUndefined, z.coerce.number().int().min(0).max(100).optional()),
  page,
  limit
});

export const applicationCreateSchema = z.object({
  candidateId: id,
  jobId: id,
  stage: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).default('applied'),
  source: z.string().trim().min(2).max(120).default('RecruitFlow'),
  notes: z.string().trim().max(2000).optional().nullable()
});

export const applicationUpdateSchema = applicationCreateSchema.extend({
  fitScore: z.coerce.number().int().min(0).max(100).optional()
}).partial();

// Interview validation keeps scheduling fields predictable.
export const interviewCreateSchema = z.object({
  applicationId: id,
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  mode: z.enum(['video', 'phone', 'onsite']).default('video'),
  interviewer: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(2000).optional().nullable()
});

export const interviewUpdateSchema = interviewCreateSchema.extend({
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional()
}).partial();
