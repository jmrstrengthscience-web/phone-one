import React, { useState } from 'react'
import { useData } from './lib/MultiTenantDataContext'
import { Box, Typography, Button, AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton, Tooltip, CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Dashboard from './Dashboard'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom'
import AuthFlow from './pages/AuthFlow'

import TeamEditor from './pages/TeamEditor'
import AthleteList from './pages/AthleteList'
import TeamList from './pages/TeamList'
import AthleteEditor from './pages/AthleteEditor.jsx'
import WorkoutsList from './pages/WorkoutsList'
import WorkoutEditor from './pages/WorkoutEditor'
import CalendarView from './pages/CalendarView'
import CalendarFull from './pages/CalendarFull'
import AthleteDashboard from './pages/AthleteDashboard'
import Leaderboard from './pages/Leaderboard'
import WellnessCheck from './pages/WellnessCheck';
import WellnessCheckIn from './pages/WellnessCheckIn';
import InjuryReports from './pages/InjuryReports';
import Messaging from './pages/Messaging';
import AthleteOverview from './pages/AthleteOverview';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Workouts from './pages/Workouts';
import WorkoutView from './pages/WorkoutView';

function LogoImage() {
  return (
    <img src="/logo.png" alt="Phorce 1" style={{ height: 36 }} />
  );
}

function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#000',
        color: '#fff',
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 1100 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#fff',
            mb: 2,
            lineHeight: 1.02,
          }}
        >
          Phorce 1
        </Typography>
        <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.125rem' }, color: 'rgba(255,255,255,0.85)', mb: 3 }}>
          Strength. Speed. Strategy. Built for coaches and athletes who push limits.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          <Button component={Link} to="/teams" variant="outlined">Teams</Button>
          <Button component={Link} to="/athletes" variant="outlined">Athletes</Button>
          <Button component={Link} to="/workouts" variant="outlined">Workouts</Button>
          <Button component={Link} to="/calendar" variant="outlined">Calendar</Button>
          <Button component={Link} to="/athlete-overview" variant="outlined">Athlete Overview</Button>
          <Button component={Link} to="/wellness" variant="outlined">Wellness Check</Button>
          <Button component={Link} to="/messaging" variant="outlined">Messaging</Button>
          <Button component={Link} to="/injury-reports" variant="outlined">Injury Reports</Button>
        </Box>
      </Box>
      <Box sx={{ width: '100%', maxWidth: 1100, mt: 6, px: 2 }}>
        <Dashboard />
      </Box>
    </Box>
  )
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff', contrastText: '#222' },
    secondary: { main: '#888' },
    background: {
      default: '#181818',
      paper: '#232323'
    },
    text: {
      primary: '#fff',
      secondary: '#bdbdbd'
    }
  },
  typography: {
    fontFamily: 'Eurostile Bold Extended, Eurostile, Orbitron, Exo 2, Impact, Arial Black, sans-serif',
    fontWeightBold: 900,
    h1: { fontWeight: 900 },
    h4: { fontWeight: 800 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'uppercase', borderRadius: 8, fontWeight: 900, letterSpacing: 1 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'linear-gradient(90deg,#232323 60%,#181818 100%)', borderBottom: '2px solid #444' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { background: '#232323', borderRadius: 16, boxShadow: '0 4px 24px #000a' },
      },
    },
  },
})

function App() {
  const { currentUser, user, profile, organization, logout, loading } = useData()

  console.log('App render state:', { user: !!user, profile: !!profile, organization: !!organization, loading })

  // Show auth flow if not logged in
  if (!user) {
    console.log('No user, showing AuthFlow')
    return <AuthFlow />
  }

  // Show organization setup if user exists but no profile/organization
  if (user && (!profile || !organization)) {
    console.log('User exists but missing profile/organization, showing AuthFlow for setup')
    return <AuthFlow />
  }

  // If we have user, profile, and organization - show the main app!
  console.log('Showing main app')

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: 64 }}>
            <LogoImage />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 800,
                letterSpacing: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Phorce 1
            </Typography>
            {(currentUser || profile) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {organization && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {organization.name}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {(currentUser?.name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user?.email)} ({profile?.role || 'athlete'})
                </Typography>
                <Button onClick={logout} color="inherit" size="small">
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<TeamList />} />
            <Route path="/teams/new" element={<TeamEditor />} />
            <Route path="/teams/:id/edit" element={<TeamEditor />} />
            <Route path="/athletes" element={<AthleteList />} />
            <Route path="/athletes/new" element={<AthleteEditor />} />
            <Route path="/athletes/:id/edit" element={<AthleteEditor />} />
            <Route path="/workouts" element={<WorkoutsList />} />
            <Route path="/workouts/new" element={<WorkoutEditor />} />
            <Route path="/workouts/:id/edit" element={<WorkoutEditor />} />
            <Route path="/calendar" element={<CalendarFull />} />
            <Route path="/injury-reports" element={<InjuryReports />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/athlete-overview" element={<AthleteOverview />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/exercise-library" element={<ExerciseLibrary />} />
            <Route path="/wellness" element={<WellnessCheckIn />} />
            <Route path="/workout-view" element={<WorkoutView />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App