# Supabase Setup Instructions

Follow these steps to set up your Supabase backend:

## 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Choose your organization (or create one)
4. Enter project details:
   - Name: Phorce1 (or your choice)
   - Database Password: Generate a secure password
   - Region: Choose closest to your users
5. Wait for project to be ready (2-3 minutes)

## 2. Get Your Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy your Project URL and anon/public key
3. Update your `.env.local` file with these values:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute the schema
4. This will create all tables, RLS policies, and sample data

## 4. Configure Row Level Security (RLS)

The schema includes RLS policies, but verify they're active:

1. Go to Database > Tables
2. For each table, ensure RLS is enabled
3. Check that policies exist for each table

## 5. Test Authentication

1. Go to Authentication > Settings
2. Configure your site URL (for local development: http://localhost:5173)
3. Test signup/signin from your app

## 6. Database Functions

The schema includes a database function `create_organization_and_user` that:
- Creates a new organization
- Creates the user profile with coach role
- Sets up the relationship

This ensures atomic operations during signup.

## 7. Verify Setup

After setup, you should be able to:
- Sign up new organizations
- Sign in existing users
- Create teams, athletes, and workouts
- See data scoped to the correct organization

## Troubleshooting

### Authentication Issues
- Check your environment variables are correct
- Verify your site URL is configured in Supabase Auth settings
- Check browser console for CORS or network errors

### Database Issues  
- Verify RLS policies are active
- Check that your user has the correct organization_id
- Use the SQL editor to run test queries

### Connection Issues
- Verify your Supabase project URL and keys
- Check that your project is not paused (free tier limitation)
- Ensure your network allows connections to Supabase

## Next Steps

Once your backend is set up:
1. Test user registration and login
2. Create sample teams and athletes
3. Test workout creation and assignment
4. Verify data isolation between organizations
5. Set up email templates for user invitations

## Production Considerations

Before going live:
- Set up custom domain
- Configure email templates
- Set up monitoring and alerts  
- Review and update RLS policies
- Set up database backups
- Configure rate limiting