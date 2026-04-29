-- Drop dependent tables first so the script can be rerun during development.
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS users;

-- Recruiter/admin accounts used for authentication.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate profile data. Skills are stored as a PostgreSQL text array for matching.
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(40),
  location VARCHAR(120) NOT NULL,
  current_title VARCHAR(160) NOT NULL,
  years_experience NUMERIC(4, 1) NOT NULL CHECK (years_experience >= 0),
  skills TEXT[] NOT NULL DEFAULT '{}',
  salary_expectation INTEGER CHECK (salary_expectation IS NULL OR salary_expectation >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'placed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job vacancy records. Required skills are used by the application matching score.
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  department VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  remote BOOLEAN NOT NULL DEFAULT false,
  salary_min INTEGER NOT NULL CHECK (salary_min >= 0),
  salary_max INTEGER NOT NULL CHECK (salary_max >= salary_min),
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  closing_date DATE,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications link candidates to jobs and hold pipeline stage/fit score data.
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  stage VARCHAR(30) NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  source VARCHAR(120) NOT NULL DEFAULT 'RecruitFlow',
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);

-- Interviews are linked to applications so they inherit candidate and job context.
CREATE TABLE interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode VARCHAR(30) NOT NULL DEFAULT 'video' CHECK (mode IN ('video', 'phone', 'onsite')),
  interviewer VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes support common search, filtering and dashboard queries.
CREATE INDEX idx_candidates_search ON candidates USING GIN (to_tsvector('english', full_name || ' ' || email || ' ' || current_title));
CREATE INDEX idx_candidates_skills ON candidates USING GIN (skills);
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN (required_skills);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_fit_score ON applications(fit_score);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Password for the sample user is: RecruitFlow2026!
INSERT INTO users (name, email, password_hash, role) VALUES
('Oliver Recruiter', 'admin@recruitflow.dev', '$2a$12$32QkJNhCnVlZHtbIrQZfp.MGg6yYv0i1irdzzOSkl7ghkqchHAo4u', 'admin');

INSERT INTO candidates (full_name, email, phone, location, current_title, years_experience, skills, salary_expectation, status, notes) VALUES
('Aisha Khan', 'aisha.khan@example.com', '07700 900111', 'Leeds', 'Frontend Engineer', 4.5, ARRAY['React', 'TypeScript', 'Accessibility', 'CSS'], 52000, 'active', 'Strong portfolio and excellent communication.'),
('Daniel Brooks', 'daniel.brooks@example.com', '07700 900222', 'Manchester', 'Backend Developer', 6, ARRAY['Node.js', 'PostgreSQL', 'Docker', 'REST'], 61000, 'active', 'Interested in platform engineering roles.'),
('Mia Roberts', 'mia.roberts@example.com', '07700 900333', 'York', 'Product Designer', 5, ARRAY['Figma', 'User Research', 'Design Systems'], 48000, 'active', 'Available after four weeks notice.'),
('Sam Taylor', 'sam.taylor@example.com', '07700 900444', 'Remote', 'Full Stack Developer', 7.5, ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS'], 72000, 'placed', 'Placed with prior client in March.'),
('Nadia Ali', 'nadia.ali@example.com', '07700 900555', 'Birmingham', 'Data Analyst', 3, ARRAY['SQL', 'Python', 'Power BI', 'Statistics'], 43000, 'active', 'Prefers hybrid roles.');

INSERT INTO jobs (title, department, location, remote, salary_min, salary_max, status, closing_date, description, required_skills) VALUES
('Senior React Engineer', 'Engineering', 'Leeds', true, 60000, 78000, 'open', '2026-06-15', 'Build accessible recruitment workflow tools with React and a modern API platform.', ARRAY['React', 'TypeScript', 'Accessibility']),
('Platform API Developer', 'Engineering', 'Manchester', false, 55000, 70000, 'open', '2026-06-01', 'Own REST API design, PostgreSQL query performance and deployment automation.', ARRAY['Node.js', 'PostgreSQL', 'REST', 'Docker']),
('UX Product Designer', 'Design', 'York', true, 42000, 56000, 'open', '2026-05-30', 'Research, prototype and validate workflow improvements for recruiter productivity.', ARRAY['Figma', 'User Research', 'Design Systems']),
('Business Intelligence Analyst', 'Operations', 'Birmingham', true, 40000, 52000, 'paused', '2026-06-20', 'Create operational dashboards and data quality reports for recruitment leaders.', ARRAY['SQL', 'Power BI', 'Statistics']);

INSERT INTO applications (candidate_id, job_id, stage, fit_score, source, notes) VALUES
(1, 1, 'interview', 100, 'LinkedIn', 'Technical interview booked.'),
(2, 2, 'screening', 100, 'Referral', 'Meets all core platform skills.'),
(3, 3, 'offer', 100, 'Portfolio', 'Final offer under review.'),
(5, 4, 'applied', 87, 'RecruitFlow', 'Good fit but role currently paused.'),
(4, 1, 'hired', 73, 'Previous client', 'Historical placement record.');

INSERT INTO interviews (application_id, scheduled_at, mode, interviewer, status, notes) VALUES
(1, now() + interval '2 days', 'video', 'Oliver Recruiter', 'scheduled', 'Assess React architecture and accessibility experience.'),
(2, now() + interval '4 days', 'phone', 'Engineering Lead', 'scheduled', 'Platform API screening call.'),
(3, now() - interval '1 day', 'video', 'Design Director', 'completed', 'Strong design systems discussion.');
