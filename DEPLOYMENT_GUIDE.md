# Supabase Database Deployment Guide

## Quick Setup Steps:

### 1. Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard/project/wjeefywvuuzpfttpaprm
- Navigate to: SQL Editor (left sidebar)

### 2. Deploy Main Schema
```sql
-- Copy and run the entire database-schema.sql file
-- This creates all tables, RLS policies, and sample data
```

### 3. Deploy Database Function
```sql
-- Copy and run the entire database-functions.sql file  
-- This creates the create_organization_and_user function
```

### 4. Verify Tables Created
After running both SQL files, check that these tables exist:
- organizations
- profiles  
- teams
- exercises
- workouts
- workout_assignments
- workout_logs
- wellness_checks
- injury_reports
- messages

### 5. Test Function
You can test the function exists by running:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_organization_and_user';
```

### 6. Verify RLS Policies
Check that Row Level Security is enabled:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

## Troubleshooting

If you get permission errors:
- Make sure you're logged into the correct Supabase project
- Verify you have admin access to the project
- Check that RLS policies aren't blocking the operations

If tables aren't created:
- Check for SQL syntax errors in the editor
- Run schema and functions separately
- Verify your project has sufficient storage

## After Deployment

Once deployed, your app will be able to:
1. Create new organizations during signup
2. Store teams, athletes, and workouts in the database
3. Enforce data isolation between organizations
4. Scale to multiple coaches and organizations

The error "Could not find function" will be resolved once you deploy database-functions.sql to your Supabase project.