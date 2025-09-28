-- =====================================================
-- PHORCE ONE - MULTI-TENANT DATABASE SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- =====================================================
-- 1. ORGANIZATIONS (Multi-Tenancy)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    max_athletes INTEGER DEFAULT 25,
    max_coaches INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 2. USER PROFILES (Extends Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'athlete', -- coach, assistant_coach, athlete
    avatar_url TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    position VARCHAR(100), -- For athletes
    jersey_number INTEGER,
    height VARCHAR(20),
    weight INTEGER,
    grade INTEGER, -- For student athletes
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 3. TEAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sport VARCHAR(100),
    season VARCHAR(100),
    color VARCHAR(7) DEFAULT '#00e6a8', -- Hex color
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 4. TEAM MEMBERSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- coach, assistant_coach, captain, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, profile_id)
);

-- =====================================================
-- 5. EXERCISES LIBRARY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- strength, cardio, agility, etc.
    muscle_groups TEXT[], -- Array of muscle groups
    equipment TEXT[], -- Array of equipment needed
    instructions TEXT[],
    video_url TEXT,
    image_url TEXT,
    difficulty_level INTEGER DEFAULT 1, -- 1-10 scale
    is_public BOOLEAN DEFAULT false, -- Can other orgs see this exercise
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 6. WORKOUTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    workout_type VARCHAR(50) DEFAULT 'strength', -- strength, cardio, agility, etc.
    date DATE,
    estimated_duration INTEGER, -- in minutes
    difficulty_level INTEGER DEFAULT 1, -- 1-10 scale
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of exercise objects
    notes TEXT,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft' -- draft, published, archived
);

-- =====================================================
-- 7. WORKOUT ASSIGNMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Individual athlete
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- Or entire team
    assigned_by UUID REFERENCES public.profiles(id),
    scheduled_date DATE NOT NULL,
    due_date DATE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, in_progress, completed, skipped
    CHECK ((assigned_to IS NOT NULL) OR (team_id IS NOT NULL))
);

-- =====================================================
-- 8. WORKOUT LOGS (Athlete Performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    exercises_completed JSONB DEFAULT '[]'::jsonb, -- Array with actual performance
    notes TEXT,
    rpe_overall INTEGER, -- Rate of Perceived Exertion (1-10)
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, abandoned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 9. WELLNESS CHECKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wellness_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_hours DECIMAL(3,1),
    sleep_quality INTEGER, -- 1-10 scale
    energy_level INTEGER, -- 1-10 scale
    mood INTEGER, -- 1-10 scale
    stress_level INTEGER, -- 1-10 scale
    soreness_level INTEGER, -- 1-10 scale
    hydration_level INTEGER, -- 1-10 scale
    nutrition_quality INTEGER, -- 1-10 scale
    readiness_score INTEGER, -- Calculated field
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(athlete_id, check_date)
);

-- =====================================================
-- 10. INJURY REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.injury_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reported_by UUID REFERENCES public.profiles(id),
    injury_date DATE NOT NULL,
    injury_type VARCHAR(100),
    body_part VARCHAR(100),
    severity VARCHAR(50), -- minor, moderate, major, severe
    description TEXT,
    treatment TEXT,
    expected_recovery_days INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- active, recovering, cleared
    return_to_play_date DATE,
    medical_clearance BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 11. COMMUNICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- For team broadcasts
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'direct', -- direct, team_broadcast, announcement
    is_read BOOLEAN DEFAULT false,
    parent_message_id UUID REFERENCES public.messages(id), -- For threading
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_teams_org ON public.teams(organization_id);
CREATE INDEX idx_exercises_org ON public.exercises(organization_id);
CREATE INDEX idx_workouts_org ON public.workouts(organization_id);
CREATE INDEX idx_workout_assignments_athlete ON public.workout_assignments(assigned_to);
CREATE INDEX idx_workout_assignments_team ON public.workout_assignments(team_id);
CREATE INDEX idx_workout_logs_athlete ON public.workout_logs(athlete_id);
CREATE INDEX idx_wellness_checks_athlete_date ON public.wellness_checks(athlete_id, check_date);
CREATE INDEX idx_injury_reports_athlete ON public.injury_reports(athlete_id);
CREATE INDEX idx_messages_org ON public.messages(organization_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE organization_id = organizations.id
    ));

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view teams in their organization" ON public.teams
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));
CREATE POLICY "Coaches can manage teams in their organization" ON public.teams
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('coach', 'assistant_coach')
        )
    );

-- Exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view exercises in their organization or public ones" ON public.exercises
    FOR SELECT USING (
        is_public = true OR 
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );
CREATE POLICY "Coaches can manage exercises in their organization" ON public.exercises
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('coach', 'assistant_coach')
        )
    );

-- Similar policies for other tables...
-- (Add more policies as needed for workouts, wellness_checks, etc.)

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create organization and first user
CREATE OR REPLACE FUNCTION public.create_organization_and_user(
    org_name TEXT,
    org_slug TEXT,
    user_email TEXT,
    user_first_name TEXT DEFAULT NULL,
    user_last_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    org_id UUID;
    user_id UUID;
BEGIN
    -- Get the authenticated user ID
    user_id := auth.uid();
    
    -- Create organization
    INSERT INTO public.organizations (name, slug)
    VALUES (org_name, org_slug)
    RETURNING id INTO org_id;
    
    -- Create/update user profile
    INSERT INTO public.profiles (id, organization_id, email, first_name, last_name, role)
    VALUES (user_id, org_id, user_email, user_first_name, user_last_name, 'coach')
    ON CONFLICT (id) DO UPDATE SET
        organization_id = org_id,
        first_name = user_first_name,
        last_name = user_last_name,
        role = 'coach';
    
    RETURN org_id;
END;
$$;

-- Function to calculate readiness score
CREATE OR REPLACE FUNCTION public.calculate_readiness_score(
    sleep_quality INTEGER,
    energy_level INTEGER,
    mood INTEGER,
    stress_level INTEGER,
    soreness_level INTEGER,
    hydration_level INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Invert stress and soreness (higher values = worse)
    RETURN ROUND((
        COALESCE(sleep_quality, 5) +
        COALESCE(energy_level, 5) +
        COALESCE(mood, 5) +
        (11 - COALESCE(stress_level, 5)) + -- Inverted
        (11 - COALESCE(soreness_level, 5)) + -- Inverted
        COALESCE(hydration_level, 5)
    ) / 6.0);
END;
$$;

-- Trigger to update readiness score
CREATE OR REPLACE FUNCTION public.update_readiness_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.readiness_score := public.calculate_readiness_score(
        NEW.sleep_quality,
        NEW.energy_level,
        NEW.mood,
        NEW.stress_level,
        NEW.soreness_level,
        NEW.hydration_level
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_readiness_score
    BEFORE INSERT OR UPDATE ON public.wellness_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_readiness_score();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample organization
INSERT INTO public.organizations (id, name, slug, plan, max_athletes) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo High School Athletics', 'demo-athletics', 'pro', 100)
ON CONFLICT (id) DO NOTHING;

-- Insert sample exercises
INSERT INTO public.exercises (organization_id, name, description, category, muscle_groups, equipment) VALUES
('00000000-0000-0000-0000-000000000001', 'Barbell Bench Press', 'Compound chest exercise', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench']),
('00000000-0000-0000-0000-000000000001', 'Back Squat', 'Fundamental lower body exercise', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['barbell', 'squat rack']),
('00000000-0000-0000-0000-000000000001', 'Deadlift', 'Full body compound movement', 'strength', ARRAY['hamstrings', 'glutes', 'lower back', 'traps'], ARRAY['barbell']),
('00000000-0000-0000-0000-000000000001', 'Pull-ups', 'Upper body pulling exercise', 'strength', ARRAY['lats', 'biceps', 'rhomboids'], ARRAY['pull-up bar']),
('00000000-0000-0000-0000-000000000001', '40-Yard Sprint', 'Speed and acceleration test', 'agility', ARRAY['legs', 'core'], ARRAY['cones', 'timer'])
ON CONFLICT DO NOTHING;