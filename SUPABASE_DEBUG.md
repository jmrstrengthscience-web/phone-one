# Supabase Configuration Checklist

If signup is not working, check these settings in your Supabase dashboard:

## 1. Authentication Settings
Go to: Authentication > Settings

### Email Confirmation
- **Disable "Enable email confirmations"** for testing
- Or set up email templates if you want confirmations

### Site URL
- Add your local development URL: `http://localhost:5175`
- Add any other URLs where your app will be hosted

### Redirect URLs  
- Add: `http://localhost:5175/**`
- This allows redirects after authentication

## 2. Database Settings
Go to: Database > Tables

### Check Tables Exist:
- organizations ✓
- profiles ✓  
- teams ✓
- exercises ✓
- workouts ✓

### Check RLS Policies:
- Each table should have RLS enabled
- Policies should allow authenticated users to access their organization's data

## 3. SQL Function
Go to: Database > Functions

### Verify Function Exists:
- `create_organization_and_user` should be listed
- Function should have correct parameters

## 4. Common Issues

### Email Confirmation Blocking:
- If email confirmation is enabled, user won't be logged in until they click email link
- **Solution**: Disable email confirmation in Auth settings for testing

### RLS Blocking Access:
- Row Level Security might be too restrictive
- **Solution**: Check that policies allow INSERT for authenticated users

### Function Permission Error:
- Database function might not have correct permissions
- **Solution**: Ensure function is marked as SECURITY DEFINER

## 5. Test Query
Run this in SQL Editor to test:
```sql
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

This will show if users are being created successfully.

## 6. Debug Console
Check browser console for:
- Network errors (red in Network tab)
- JavaScript errors (red in Console)
- Supabase error messages