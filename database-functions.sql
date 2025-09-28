-- Add this function to your Supabase SQL Editor after running the main schema

CREATE OR REPLACE FUNCTION create_organization_and_user(
    org_name TEXT,
    org_slug TEXT,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_org_id UUID;
    auth_user_id UUID;
    result JSON;
BEGIN
    -- Get the authenticated user's ID
    auth_user_id := auth.uid();
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user';
    END IF;

    -- Create organization
    INSERT INTO organizations (name, slug, is_active, settings)
    VALUES (org_name, org_slug, true, '{"features": {"teams": true, "wellness": true, "injuries": true}}'::jsonb)
    RETURNING id INTO new_org_id;

    -- Create user profile
    INSERT INTO profiles (
        id,
        organization_id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        metadata
    ) VALUES (
        auth_user_id,
        new_org_id,
        user_email,
        user_first_name,
        user_last_name,
        'coach',
        true,
        '{"is_owner": true}'::jsonb
    );

    -- Return success result
    result := json_build_object(
        'success', true,
        'organization_id', new_org_id,
        'user_id', auth_user_id
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$;