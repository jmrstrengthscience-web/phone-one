import React from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material'
import { FitnessCenter, Assessment, Person, ExitToApp, Today, TrendingUp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useData } from '../lib/MultiTenantDataContext'

export default function AthleteDashboard() {
  const navigate = useNavigate()
  const contextData = useData()
  
  if (!contextData || contextData.loading) {
    return <div>Loading athlete dashboard...</div>
  }
  
  const { currentUser, logout, data } = contextData

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/athlete/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get today's assigned workouts for this athlete
  const todaysWorkouts = data?.workouts?.filter(workout => {
    const today = new Date().toISOString().split('T')[0]
    return workout.date === today
  }) || []

  // Get recent wellness check (just the most recent one)
  const recentWellnessCheck = data?.wellnessChecks?.filter(check => 
    check.athlete_id === currentUser?.id
  ).sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  // Check if wellness check done today
  const today = new Date().toISOString().split('T')[0]
  const wellnessCompletedToday = recentWellnessCheck && recentWellnessCheck.date === today

  return (
    <Box sx={{ p: 3, bgcolor: '#071029', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 3, bgcolor: '#ff6b35', width: 56, height: 56 }}>
            <Person sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
              PHORCE ONE
            </Typography>
            <Typography variant="h5" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
              Welcome, {currentUser?.first_name || 'Athlete'}!
            </Typography>
            <Typography sx={{ color: '#bbb', mt: 1 }}>
              Ready to dominate today's training?
            </Typography>
          </Box>
        </Box>
        <Button 
          onClick={handleLogout}
          variant="outlined"
          startIcon={<ExitToApp />}
          sx={{ 
            color: '#fff', 
            borderColor: '#fff',
            '&:hover': { 
              borderColor: '#ff6b35',
              color: '#ff6b35',
              bgcolor: 'rgba(255, 107, 53, 0.1)'
            }
          }}
        >
          Logout
        </Button>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Action Cards */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              bgcolor: '#1e1e1e', 
              height: '100%',
              border: wellnessCompletedToday ? '2px solid #4caf50' : '2px solid transparent',
              transition: 'transform 0.2s, border-color 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ fontSize: 40, color: '#ff6b35', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Wellness Check-In
                  </Typography>
                  <Typography sx={{ color: '#bbb' }}>
                    {wellnessCompletedToday ? 'Completed today ✅' : 'Complete your daily assessment'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: '#333' }} />

              {recentWellnessCheck && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#bbb', mb: 2 }}>
                    Last Check-In: {new Date(recentWellnessCheck.date).toLocaleDateString()}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {recentWellnessCheck.energy_level}/10
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#bbb' }}>Energy</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                          {recentWellnessCheck.sleep_hours}h
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#bbb' }}>Sleep</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                          {recentWellnessCheck.soreness_level}/10
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#bbb' }}>Soreness</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/athlete/wellness')}
                sx={{ 
                  bgcolor: wellnessCompletedToday ? '#4caf50' : '#ff6b35',
                  '&:hover': { bgcolor: wellnessCompletedToday ? '#388e3c' : '#e55a2b' },
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {wellnessCompletedToday ? 'Update Check-In' : 'Start Wellness Check-In'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Workout Viewer */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              bgcolor: '#1e1e1e', 
              height: '100%',
              border: todaysWorkouts.length > 0 ? '2px solid #2196f3' : '2px solid transparent',
              transition: 'transform 0.2s, border-color 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FitnessCenter sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    My Workouts
                  </Typography>
                  <Typography sx={{ color: '#bbb' }}>
                    View coach-assigned training
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: '#333' }} />

              {todaysWorkouts.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Today sx={{ color: '#4caf50', mr: 1 }} />
                    <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {todaysWorkouts.length} workout{todaysWorkouts.length !== 1 ? 's' : ''} scheduled today
                    </Typography>
                  </Box>
                  {todaysWorkouts.slice(0, 2).map((workout) => (
                    <Paper key={workout.id} sx={{ p: 2, mb: 1, bgcolor: '#2a2a2a' }}>
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {workout.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb', fontSize: '0.9rem' }}>
                        {workout.estimated_duration || 45} min • {workout.workout_type || 'Training'}
                      </Typography>
                    </Paper>
                  ))}
                  {todaysWorkouts.length > 2 && (
                    <Typography variant="body2" sx={{ color: '#888', textAlign: 'center' }}>
                      +{todaysWorkouts.length - 2} more workouts
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ mb: 3, textAlign: 'center', py: 2 }}>
                  <TrendingUp sx={{ fontSize: 48, color: '#555', mb: 1 }} />
                  <Typography sx={{ color: '#bbb' }}>
                    No workouts scheduled for today
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Check back later or view all assigned workouts
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/athlete/workouts')}
                sx={{ 
                  bgcolor: '#2196f3',
                  '&:hover': { bgcolor: '#1976d2' },
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                View All My Workouts
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats Footer */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: '#1e1e1e' }}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Keep up the great work! 💪
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                {data?.wellnessChecks?.filter(c => c.athlete_id === currentUser?.id)?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Total Check-Ins
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                {data?.workouts?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Available Workouts
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {Math.round(((data?.wellnessChecks?.filter(c => c.athlete_id === currentUser?.id)?.reduce((sum, c) => sum + c.energy_level, 0) || 0) / Math.max(data?.wellnessChecks?.filter(c => c.athlete_id === currentUser?.id)?.length || 1, 1)) * 10) / 10 || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Avg Energy Level
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
