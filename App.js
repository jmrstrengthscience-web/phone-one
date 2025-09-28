// src/App.js
import React from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import Dashboard from './Dashboard';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TeamsList from './pages/TeamsList';
import TeamEditor from './pages/TeamEditor';
import AthletesList from './pages/AthletesList';
import AthleteEditor from './pages/AthleteEditor';
import WorkoutsList from './pages/WorkoutsList';
import WorkoutEditor from './pages/WorkoutEditor';
import CalendarView from './pages/CalendarView';
import CalendarFull from './pages/CalendarFull';
import Login from './pages/Login';

function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(180deg,#071029 0%, #08131f 60%, #02040a 100%)',
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
            background: 'linear-gradient(90deg,#ffffff,#00e6a8,#ff2d95)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            lineHeight: 1.02,
          }}
        >
          Welcome to Phorce 1
        </Typography>

        <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.125rem' }, color: 'rgba(255,255,255,0.85)', mb: 3 }}>
          Strength. Speed. Strategy. Built for coaches and athletes who push limits.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#00e6a8',
              color: '#001',
              fontWeight: 800,
              px: 4,
              '&:hover': { bgcolor: '#00c18a' },
            }}
            component={Link}
            to="/teams"
          >
            Get Started
          </Button>

          <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} component={Link} to="/teams">
            Coach Dashboard
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 1100, mt: 6, px: 2 }}>
        <Dashboard />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Toolbar sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} to="/" sx={{ color: '#fff', fontWeight: 800 }}>Phorce 1</Button>
          <Button component={Link} to="/teams" sx={{ color: 'rgba(255,255,255,0.8)' }}>Teams</Button>
          <Button component={Link} to="/athletes" sx={{ color: 'rgba(255,255,255,0.8)' }}>Athletes</Button>
          <Button component={Link} to="/workouts" sx={{ color: 'rgba(255,255,255,0.8)' }}>Workouts</Button>
          <Button component={Link} to="/calendar" sx={{ color: 'rgba(255,255,255,0.8)' }}>Calendar</Button>
          <Button component={Link} to="/calendar/full" sx={{ color: 'rgba(255,255,255,0.8)' }}>Full Calendar</Button>
          <Button component={Link} to="/login" sx={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.8)' }}>Login</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/new" element={<TeamEditor />} />
          <Route path="/teams/:id/edit" element={<TeamEditor />} />
          <Route path="/athletes" element={<AthletesList />} />
          <Route path="/athletes/new" element={<AthleteEditor />} />
          <Route path="/athletes/:id/edit" element={<AthleteEditor />} />
          <Route path="/workouts" element={<WorkoutsList />} />
          <Route path="/workouts/new" element={<WorkoutEditor />} />
          <Route path="/workouts/:id/edit" element={<WorkoutEditor />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/full" element={<CalendarFull />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
