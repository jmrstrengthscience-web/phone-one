import React from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Typography, Button, Paper } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import AuthFlow from './pages/AuthFlow'
import { useData } from './lib/MultiTenantDataContext'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff', contrastText: '#222' },
    background: {
      default: '#181818',
      paper: '#232323'
    }
  },
  typography: {
    fontFamily: 'Eurostile Bold Extended, Eurostile, Orbitron, Exo 2, Impact, Arial Black, sans-serif',
    fontWeightBold: 900,
    allVariants: {
      fontWeight: 'bold'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFamily: 'Eurostile Bold Extended, Eurostile, Orbitron, Exo 2, Impact, Arial Black, sans-serif !important',
          fontWeight: 'bold !important'
        }
      }
    }
  }
})

function DebugInfo({ user, profile, organization, loading }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Debug Info</Typography>
      <Typography>Loading: {loading ? 'Yes' : 'No'}</Typography>
      <Typography>User: {user ? user.email : 'None'}</Typography>
      <Typography>Profile: {profile ? `${profile.first_name} ${profile.last_name}` : 'None'}</Typography>
      <Typography>Organization: {organization ? organization.name : 'None'}</Typography>
    </Paper>
  )
}

function SimpleApp() {
  const { user, profile, organization, loading, logout } = useData()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ p: 3, minHeight: '100vh' }}>
          <Typography variant="h4" gutterBottom>Phorce1 Debug Mode</Typography>
          
          <DebugInfo user={user} profile={profile} organization={organization} loading={loading} />
          
          {!user ? (
            <Box>
              <Typography variant="h6" gutterBottom>No User - Showing Auth</Typography>
              <AuthFlow />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>User Authenticated</Typography>
              <Button onClick={logout} variant="outlined" sx={{ mb: 2 }}>
                Logout
              </Button>
              
              {!profile || !organization ? (
                <Box>
                  <Typography>Missing profile or organization - should show setup</Typography>
                  <AuthFlow />
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Welcome to {organization.name}!
                  </Typography>
                  <Typography>
                    Hello {profile.first_name} {profile.last_name} ({profile.role})
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    🎉 SUCCESS! Your app is working!
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default SimpleApp