import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  TextField,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Avatar,
  Paper
} from '@mui/material'
import {
  FitnessCenter,
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Timer as TimerIcon,
  Add,
  Remove,
  Speed,
  TrendingUp,
  Assignment
} from '@mui/icons-material'
import { useData } from '../lib/DataContext'
import { format, isToday, addMinutes, parseISO, isValid } from 'date-fns'

export function WorkoutView({ rackView = false, workoutId = null }) {
  const { data, currentUser, addWorkoutLog } = useData()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [activeExercise, setActiveExercise] = useState(0)
  const [currentSet, setCurrentSet] = useState(0)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [exerciseTimer, setExerciseTimer] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [performanceData, setPerformanceData] = useState({})
  const [notes, setNotes] = useState('')
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  
  // Find workout for selected date or use provided workoutId
  const selectedWorkout = useMemo(() => {
    if (workoutId) {
      return data.workouts.find(w => w.id === workoutId)
    }
    
    // Find workout scheduled for selected date for this athlete's teams
    const athleteTeams = currentUser?.teams || []
    
    return data.workouts.find(w => 
      w.date === selectedDate && 
      (w.teams || []).some(teamId => athleteTeams.includes(teamId))
    )
  }, [data.workouts, currentUser, workoutId, selectedDate])

  // Find all workouts assigned to this athlete (for date picker suggestions)
  const athleteWorkouts = useMemo(() => {
    const athleteTeams = currentUser?.teams || []
    return data.workouts.filter(w => 
      (w.teams || []).some(teamId => athleteTeams.includes(teamId))
    ).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [data.workouts, currentUser])

  // Check if selected date is today
  const isSelectedDateToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  // Reset workout state when date changes
  useEffect(() => {
    setActiveExercise(0)
    setCurrentSet(0)
    setWorkoutStarted(false)
    setWorkoutCompleted(false)
    setExerciseTimer(0)
    setRestTimer(0)
    setIsResting(false)
    setPerformanceData({})
    setNotes('')
  }, [selectedDate])

  // Timer effects
  useEffect(() => {
    let interval = null
    if (workoutStarted && !isResting && !workoutCompleted) {
      interval = setInterval(() => {
        setExerciseTimer(timer => timer + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [workoutStarted, isResting, workoutCompleted])

  useEffect(() => {
    let interval = null
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(timer => {
          if (timer <= 1) {
            setIsResting(false)
            return 0
          }
          return timer - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startWorkout = () => {
    setWorkoutStarted(true)
    setExerciseTimer(0)
  }

  const completeSet = () => {
    const exercise = selectedWorkout.exercises[activeExercise]
    if (!exercise) return

    // Log set performance
    const exerciseKey = `${activeExercise}_${currentSet}`
    const currentPerformance = performanceData[exerciseKey] || {}
    
    setPerformanceData(prev => ({
      ...prev,
      [exerciseKey]: {
        ...currentPerformance,
        completed: true,
        time: exerciseTimer
      }
    }))

    // Move to next set or exercise
    if (currentSet + 1 < exercise.sets) {
      setCurrentSet(prev => prev + 1)
      // Start rest timer
      setIsResting(true)
      setRestTimer(exercise.rest || 60) // Default 60 seconds rest
      setExerciseTimer(0)
    } else {
      // Move to next exercise
      if (activeExercise + 1 < selectedWorkout.exercises.length) {
        setActiveExercise(prev => prev + 1)
        setCurrentSet(0)
        setExerciseTimer(0)
      } else {
        // Workout complete
        setWorkoutCompleted(true)
        setLogDialogOpen(true)
      }
    }
  }

  const updatePerformance = (field, value) => {
    const exerciseKey = `${activeExercise}_${currentSet}`
    setPerformanceData(prev => ({
      ...prev,
      [exerciseKey]: {
        ...prev[exerciseKey],
        [field]: value
      }
    }))
  }

  const completeWorkout = async () => {
    try {
      await addWorkoutLog({
        athlete_id: currentUser.id,
        athlete_name: currentUser.name,
        workout_id: selectedWorkout.id,
        workout_name: selectedWorkout.name,
        date: format(new Date(), 'yyyy-MM-dd'),
        performance_data: performanceData,
        notes,
        duration: exerciseTimer,
        completed: true
      })
      setLogDialogOpen(false)
    } catch (error) {
      console.error('Failed to log workout:', error)
    }
  }
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Workout Scheduled
            </Typography>
            <Typography color="text.secondary">
              There's no workout scheduled for today. Check with your coach or view the calendar.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

      const currentExercise = selectedWorkout.exercises[activeExercise]
      const totalSets = selectedWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0)
      const completedSets = Object.keys(performanceData).filter(key => performanceData[key].completed).length
      const progress = (completedSets / totalSets) * 100

      return (
        <>
          {/* Workout Header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenter />
              {selectedWorkout.name}
            </Box>
          }
          subheader={format(new Date(), 'EEEE, MMMM do, yyyy')}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{formatTime(exerciseTimer)}</Typography>
                <Typography variant="caption" color="text.secondary">Workout Time</Typography>
              </Box>
              {!workoutStarted ? (
                <Button variant="contained" onClick={startWorkout} startIcon={<PlayArrow />}>
                  Start Workout
                </Button>
              ) : workoutCompleted ? (
                <Chip label="Completed" color="success" icon={<CheckCircle />} />
              ) : (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => setWorkoutCompleted(true)}
                  startIcon={<Stop />}
                >
                  End Workout
                </Button>
              )}
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progress: {completedSets}/{totalSets} sets completed
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          
          {isResting && (
            <Alert 
              severity="info" 
              icon={<TimerIcon />}
              sx={{ mb: 2 }}
            >
              Rest Time: {formatTime(restTimer)} remaining
            </Alert>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Current Exercise */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={`Exercise ${activeExercise + 1} of ${selectedWorkout.exercises.length}`}
              subheader={
                <Box>
                  <Typography variant="h6">{currentExercise?.name}</Typography>
                  {(() => {
                    const libraryExercise = data.exercises?.find(ex => ex.name === currentExercise?.name);
                    if (libraryExercise) {
                      return (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip label={libraryExercise.category} size="small" sx={{ mr: 1 }} />
                          <Chip label={libraryExercise.equipment} size="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="textSecondary">
                            Targets: {(libraryExercise.muscle_groups || []).join(', ')}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })()}
                </Box>
              }
            />
            <CardContent>
              {workoutStarted && currentExercise && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Set {currentSet + 1} of {currentExercise.sets}
                  </Typography>
                  
                  {/* Exercise Details */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{currentExercise.reps}</Typography>
                        <Typography variant="caption" color="text.secondary">Target Reps</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{currentExercise.weight || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">Weight (lbs)</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{formatTime(currentExercise.rest || 60)}</Typography>
                        <Typography variant="caption" color="text.secondary">Rest Time</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Performance Input */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Log Your Performance:</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Actual Reps"
                          value={performanceData[`${activeExercise}_${currentSet}`]?.reps || ''}
                          onChange={(e) => updatePerformance('reps', parseInt(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Weight Used (lbs)"
                          value={performanceData[`${activeExercise}_${currentSet}`]?.weight || ''}
                          onChange={(e) => updatePerformance('weight', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={completeSet}
                      disabled={isResting}
                      size="large"
                      startIcon={<CheckCircle />}
                    >
                      Complete Set
                    </Button>
                    {currentSet > 0 && (
                      <Button 
                        variant="outlined" 
                        onClick={() => setCurrentSet(prev => Math.max(0, prev - 1))}
                      >
                        Previous Set
                      </Button>
                    )}
                  </Box>
                </Box>
              )}

              {!workoutStarted && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Click "Start Workout" to begin your training session
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Workout Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Workout Overview" />
            <CardContent>
              <List dense>
                {selectedWorkout.exercises.map((exercise, index) => {
                  const exerciseCompleted = Array.from({ length: exercise.sets }, (_, setIndex) => 
                    performanceData[`${index}_${setIndex}`]?.completed
                  ).every(Boolean)
                  
                  return (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        bgcolor: index === activeExercise ? 'action.selected' : 'transparent',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: exerciseCompleted ? 'success.main' : 'grey.500',
                            width: 24,
                            height: 24,
                            fontSize: '0.75rem'
                          }}
                        >
                          {exerciseCompleted ? <CheckCircle /> : index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={exercise.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">{exercise.sets} sets × {exercise.reps} reps</Typography>
                            {(() => {
                              const libraryExercise = data.exercises?.find(ex => ex.name === exercise.name);
                              if (libraryExercise) {
                                return (
                                  <Typography variant="caption" color="textSecondary">
                                    {libraryExercise.category} • {libraryExercise.equipment} • {(libraryExercise.muscle_groups || []).join(', ')}
                                  </Typography>
                                );
                              }
                              return null;
                            })()}
                          </Box>
                        }
                      />
                    </ListItem>
                  )
                })}
              </List>
            </CardContent>
          </Card>

          {rackView && (
            <Card sx={{ mt: 2 }}>
              <CardHeader title="Quick Stats" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Time:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatTime(exerciseTimer)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Progress:</Typography>
                    <Typography variant="body2" fontWeight="bold">{Math.round(progress)}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Current:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {currentExercise?.name?.substring(0, 15)}...
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Workout Log Dialog */}
      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Complete Workout</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>Workout Summary</Typography>
            <Typography color="text.secondary" gutterBottom>
              Duration: {formatTime(exerciseTimer)} | Progress: {Math.round(progress)}%
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Workout Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any observations or achievements?"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={completeWorkout}>
            Save Workout
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  )
}

export default WorkoutView
