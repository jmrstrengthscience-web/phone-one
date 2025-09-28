import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Collapse
} from '@mui/material'
import { 
  FitnessCenter, 
  Timer, 
  TrendingUp, 
  Today, 
  CalendarToday,
  ExpandMore,
  ExpandLess,
  PlayArrow,
  CheckCircle
} from '@mui/icons-material'
import { useData } from '../lib/MultiTenantDataContext'

export default function AthleteWorkouts() {
  const contextData = useData()
  const [currentTab, setCurrentTab] = useState(0)
  const [expandedWorkout, setExpandedWorkout] = useState(null)
  
  if (!contextData || contextData.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#071029' }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>Loading workouts...</Typography>
      </Box>
    )
  }
  
  const { data, currentUser } = contextData

  // Filter workouts assigned to this athlete
  const myWorkouts = data?.workouts || []

  // Categorize workouts
  const today = new Date().toISOString().split('T')[0]
  const todaysWorkouts = myWorkouts.filter(workout => workout.date === today)
  const upcomingWorkouts = myWorkouts.filter(workout => workout.date && workout.date > today)
  const pastWorkouts = myWorkouts.filter(workout => workout.date && workout.date < today)
  const unscheduledWorkouts = myWorkouts.filter(workout => !workout.date)

  const getWorkoutsByTab = () => {
    switch(currentTab) {
      case 0: return todaysWorkouts
      case 1: return upcomingWorkouts
      case 2: return unscheduledWorkouts
      case 3: return pastWorkouts
      default: return todaysWorkouts
    }
  }

  const getDifficultyColor = (level) => {
    if (level <= 2) return '#4caf50' // Easy - Green
    if (level <= 3) return '#ff9800' // Medium - Orange  
    return '#f44336' // Hard - Red
  }

  const getDifficultyLabel = (level) => {
    if (level <= 2) return 'Easy'
    if (level <= 3) return 'Medium'
    return 'Hard'
  }

  const handleExpandWorkout = (workoutId) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId)
  }

  const workoutsToShow = getWorkoutsByTab()

  return (
    <Box sx={{ p: 3, bgcolor: '#071029', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e1e1e' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FitnessCenter sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
          <Box>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
              My Workouts
            </Typography>
            <Typography sx={{ color: '#bbb' }}>
              Coach-assigned training programs
            </Typography>
          </Box>
        </Box>
        
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                {todaysWorkouts.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Today</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {upcomingWorkouts.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Upcoming</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                {unscheduledWorkouts.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Available</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#888', fontWeight: 'bold' }}>
                {pastWorkouts.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Completed</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Workout Tabs */}
      <Paper sx={{ bgcolor: '#1e1e1e', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ 
            '& .MuiTab-root': { color: '#bbb', fontWeight: 'bold' },
            '& .Mui-selected': { color: '#ff6b35' },
            '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
          }}
        >
          <Tab icon={<Today />} label={`Today (${todaysWorkouts.length})`} />
          <Tab icon={<CalendarToday />} label={`Upcoming (${upcomingWorkouts.length})`} />
          <Tab icon={<FitnessCenter />} label={`Available (${unscheduledWorkouts.length})`} />
          <Tab icon={<CheckCircle />} label={`Past (${pastWorkouts.length})`} />
        </Tabs>
      </Paper>

      {/* Workout List */}
      {workoutsToShow.length === 0 ? (
        <Card sx={{ bgcolor: '#1e1e1e', textAlign: 'center', py: 6 }}>
          <CardContent>
            <FitnessCenter sx={{ fontSize: 80, color: '#555', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 'bold' }}>
              {currentTab === 0 && 'No Workouts Today'}
              {currentTab === 1 && 'No Upcoming Workouts'}
              {currentTab === 2 && 'No Available Workouts'}
              {currentTab === 3 && 'No Past Workouts'}
            </Typography>
            <Typography sx={{ color: '#bbb', mb: 3 }}>
              {currentTab === 0 && 'Enjoy your rest day! Check back tomorrow.'}
              {currentTab === 1 && 'Your coach will schedule more workouts soon.'}
              {currentTab === 2 && 'Your coach will assign workouts for you.'}
              {currentTab === 3 && 'Complete some workouts to see them here.'}
            </Typography>
            {currentTab !== 3 && (
              <Button
                variant="outlined"
                sx={{ 
                  color: '#ff6b35',
                  borderColor: '#ff6b35',
                  '&:hover': { 
                    borderColor: '#e55a2b',
                    bgcolor: 'rgba(255, 107, 53, 0.1)'
                  }
                }}
              >
                Contact Your Coach
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {workoutsToShow.map((workout) => (
            <Grid item xs={12} key={workout.id}>
              <Card 
                sx={{ 
                  bgcolor: '#1e1e1e',
                  border: currentTab === 0 ? '2px solid #ff6b35' : '1px solid #333',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#ff6b35',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mr: 2 }}>
                          {workout.title}
                        </Typography>
                        <Chip
                          label={getDifficultyLabel(workout.difficulty_level)}
                          size="small"
                          sx={{
                            bgcolor: getDifficultyColor(workout.difficulty_level),
                            color: '#fff',
                            fontWeight: 'bold',
                            mr: 1
                          }}
                        />
                        {currentTab === 0 && (
                          <Chip
                            label="TODAY"
                            size="small"
                            sx={{
                              bgcolor: '#ff6b35',
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>

                      <Typography variant="body1" sx={{ color: '#bbb', mb: 2 }}>
                        {workout.description || 'Coach-designed workout program'}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Timer sx={{ fontSize: 18, color: '#ff6b35', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {workout.estimated_duration || 45} min
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp sx={{ fontSize: 18, color: '#ff6b35', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {workout.workout_type || 'General'}
                            </Typography>
                          </Box>
                        </Grid>
                        {workout.date && (
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday sx={{ fontSize: 18, color: '#2196f3', mr: 1 }} />
                              <Typography variant="body2" sx={{ color: '#2196f3' }}>
                                {new Date(workout.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        sx={{
                          bgcolor: currentTab === 0 ? '#ff6b35' : '#2196f3',
                          '&:hover': { bgcolor: currentTab === 0 ? '#e55a2b' : '#1976d2' },
                          fontWeight: 'bold',
                          mb: 1,
                          minWidth: '140px'
                        }}
                      >
                        {currentTab === 3 ? 'Review' : 'Start'}
                      </Button>
                      
                      <IconButton
                        onClick={() => handleExpandWorkout(workout.id)}
                        sx={{ color: '#bbb' }}
                      >
                        {expandedWorkout === workout.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expanded Exercise Details */}
                  <Collapse in={expandedWorkout === workout.id}>
                    <Divider sx={{ my: 2, borderColor: '#333' }} />
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 'bold' }}>
                      Exercise Breakdown:
                    </Typography>
                    {workout.exercises && workout.exercises.length > 0 ? (
                      <Grid container spacing={2}>
                        {workout.exercises.map((exercise, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper sx={{ p: 2, bgcolor: '#2a2a2a' }}>
                              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                                {exercise.name || `Exercise ${index + 1}`}
                              </Typography>
                              {exercise.sets && exercise.reps && (
                                <Typography variant="body2" sx={{ color: '#ff6b35' }}>
                                  {exercise.sets} sets × {exercise.reps} reps
                                </Typography>
                              )}
                              {exercise.weight && (
                                <Typography variant="body2" sx={{ color: '#2196f3' }}>
                                  Weight: {exercise.weight} lbs
                                </Typography>
                              )}
                              {exercise.restTime && (
                                <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                  Rest: {exercise.restTime}s
                                </Typography>
                              )}
                              {exercise.notes && (
                                <Typography variant="body2" sx={{ color: '#bbb', mt: 1, fontStyle: 'italic' }}>
                                  "{exercise.notes}"
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography sx={{ color: '#bbb', textAlign: 'center', py: 2 }}>
                        Exercise details will be available when you start the workout
                      </Typography>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}