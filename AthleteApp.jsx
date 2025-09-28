import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useData } from './lib/MultiTenantDataContext'
import AthleteLogin from './pages/AthleteLogin'
import AthleteDashboard from './pages/AthleteDashboard'
import AthleteWorkouts from './pages/AthleteWorkouts'
import { WellnessCheckIn } from './pages/WellnessCheckIn'

// Athletic/Performance Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35',
      dark: '#e55a2b',
      light: '#ff8a65'
    },
    secondary: {
      main: '#1e88e5',
      dark: '#1565c0',
      light: '#42a5f5'
    },
    background: {
      default: '#071029',
      paper: '#1e1e1e'
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
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFamily: 'Eurostile Bold Extended, Eurostile, Orbitron, Exo 2, Impact, Arial Black, sans-serif !important',
          fontWeight: 'bold !important'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
          letterSpacing: '0.02em'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 12
        }
      }
    }
  }
})

function AthleteApp() {
  const contextData = useData()
  
  if (!contextData) {
    return <div>Loading...</div>
  }
  
  const { user, profile, loading } = contextData

  console.log('AthleteApp render state:', { user: !!user, profile: !!profile, loading })

  if (loading) {
    return <div>Loading athlete app...</div>
  }

  // Check if user is logged in and is an athlete
  const isAthleteLoggedIn = user && profile && profile.role === 'athlete'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAthleteLoggedIn ? <Navigate to="/dashboard" replace /> : <AthleteLogin />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAthleteLoggedIn ? <AthleteDashboard /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/workouts" 
            element={
              isAthleteLoggedIn ? <AthleteWorkouts /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/wellness" 
            element={
              isAthleteLoggedIn ? <WellnessCheckIn userId={profile?.id} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAthleteLoggedIn ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default AthleteApp