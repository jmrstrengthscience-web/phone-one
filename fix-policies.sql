-- =====================================================
-- FIX INFINITE RECURSION IN POLICIES
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create fixed policies without recursion
CREATE POLICY "Users can view organizations" ON public.organizations
    FOR SELECT USING (true);

CREATE POLICY "Users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Allow organization updates for coaches
CREATE POLICY "Coaches can update organizations" ON public.organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND organization_id = organizations.id 
            AND role = 'coach'
        )
    );