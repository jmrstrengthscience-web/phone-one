import React, { useState } from 'react'
import { useData } from './lib/DataContext'
import { Box, Typography, Button, AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton, Tooltip, CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Dashboard from './Dashboard'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom'

// Protected route for role-based access
function ProtectedRoute({ role, children }) {
  const { currentUser } = useData();
  if (!currentUser) return <Navigate to="/" replace />;
  if (role && currentUser.role !== role) return <Navigate to={currentUser.role === 'coach' ? '/' : '/'} replace />;
  return children || <Outlet />;
}
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

function HeaderProfile({ currentUser, onLogout }) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  if (!currentUser) return null;

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const go = (path) => {
    handleClose()
    navigate(path)
  }

  const initials = (name = '') => name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()

  return (
    <Box sx={{ marginLeft: 'auto' }}>
      <Tooltip title={currentUser.name}>
        <IconButton onClick={handleOpen} size="small" sx={{ ml: 1 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{initials(currentUser.name)}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { minWidth: 200 } }}>
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 800 }}>{currentUser.name}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{currentUser.role || 'athlete'}</Typography>
        </Box>
        <MenuItem onClick={() => go('/')}>Home</MenuItem>
        <MenuItem onClick={() => go('/teams')}>Teams</MenuItem>
        <MenuItem onClick={() => go('/workouts')}>Workouts</MenuItem>
        <MenuItem onClick={() => go('/calendar')}>Calendar</MenuItem>
        <MenuItem onClick={() => { handleClose(); onLogout(); }}>Logout</MenuItem>
      </Menu>
    </Box>
  )
}

function CoachDashboard() {
  // Coach-only navigation and features
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button component={Link} to="/coach/teams" color="inherit">Teams</Button>
        <Button component={Link} to="/coach/athletes" color="inherit">Athletes</Button>
        <Button component={Link} to="/coach/workouts" color="inherit">Workouts</Button>
        <Button component={Link} to="/coach/calendar" color="inherit">Calendar</Button>
        <Button component={Link} to="/coach/injury-reports" color="inherit">Injury Reports</Button>
        <Button component={Link} to="/coach/messaging" color="inherit">Messaging</Button>
        <Button component={Link} to="/coach/analytics" color="inherit">Analytics</Button>
        <Button component={Link} to="/coach/leaderboard" color="inherit">Leaderboard</Button>
        <Button component={Link} to="/coach/exercise-library" color="inherit">Exercise Library</Button>
      </Box>
      <Outlet />
    </>
  );
}

function AthleteDashboardWrapper() {
  // Athlete-only navigation and features
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button component={Link} to="/athlete/workouts" color="inherit">Today's Workout</Button>
        <Button component={Link} to="/athlete/wellness" color="inherit">Wellness Check</Button>
        <Button component={Link} to="/athlete/progress" color="inherit">My Progress</Button>
        <Button component={Link} to="/athlete/leaderboard" color="inherit">Leaderboard</Button>
      </Box>
      <Outlet />
    </>
  );
}

function App() {
  const { currentUser, logout } = useData()

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
            <HeaderProfile currentUser={currentUser} onLogout={logout} />
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Public routes */}
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
              Phorce1
            </Typography>
            <HeaderProfile profile={profile} onLogout={signOut} />
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/auth" element={<AuthFlow />} />

            {/* Coach routes */}
            <Route element={<ProtectedRoute role="coach"><CoachDashboard /></ProtectedRoute>}>
              <Route path="/coach" element={<Dashboard />} />
              <Route path="/coach/teams" element={<TeamList />} />
              <Route path="/coach/teams/new" element={<TeamEditor />} />
              <Route path="/coach/teams/:id/edit" element={<TeamEditor />} />
              <Route path="/coach/athletes" element={<AthleteList />} />
  export default App
