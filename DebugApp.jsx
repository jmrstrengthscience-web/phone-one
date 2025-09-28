import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function DebugApp() {
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    // Test basic functionality
    try {
      console.log('DebugApp loaded successfully');
    } catch (err) {
      setError(err.message);
      console.error('Error in DebugApp:', err);
    }
  }, []);

  const testDataContext = () => {
    try {
      // Test importing DataContext
      import('../lib/DataContext').then(() => {
        console.log('DataContext imported successfully');
      }).catch(err => {
        console.error('Error importing DataContext:', err);
        setError('DataContext import failed: ' + err.message);
      });
    } catch (err) {
      setError('Error testing DataContext: ' + err.message);
    }
  };

  const testSupabase = () => {
    try {
      import('../lib/supabaseClient').then(() => {
        console.log('Supabase client imported successfully');
      }).catch(err => {
        console.error('Error importing Supabase client:', err);
        setError('Supabase import failed: ' + err.message);
      });
    } catch (err) {
      setError('Error testing Supabase: ' + err.message);
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h4" color="error">Error Detected</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Debug Mode</Typography>
      <Typography mb={2}>App loaded successfully!</Typography>
      <Button variant="contained" onClick={testDataContext} sx={{ mr: 2 }}>
        Test DataContext
      </Button>
      <Button variant="contained" onClick={testSupabase}>
        Test Supabase
      </Button>
    </Box>
  );
}