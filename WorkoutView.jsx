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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Avatar,
  Paper
} from '@mui/material'
import {
  FitnessCenter,
  Assignment,
  CheckCircle
} from '@mui/icons-material'
import { useData } from '../lib/DataContext'
import { format, parseISO } from 'date-fns'

export function WorkoutView({ rackView = false, workoutId = null }) {
  const { data, currentUser } = useData()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [activeExercise, setActiveExercise] = useState(0)
  const [workoutStarted, setWorkoutStarted] = useState(false)

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
    setWorkoutStarted(false)
  }, [selectedDate])

  // Handle date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
  }

  // Start workout
  const startWorkout = () => {
    setWorkoutStarted(true)
  }

  // Get current exercise
  const currentExercise = selectedWorkout?.exercises?.[activeExercise]

  return (
    <Box sx={{ p: rackView ? 1 : 3 }}>
      {/* Date Selection Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isSelectedDateToday ? "Today's Workout" : "Workout"}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          {!isSelectedDateToday && (
            <Button 
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              variant="outlined"
              size="small"
            >
              Today
            </Button>
          )}
        </Box>
      </Box>

      {/* Available Workout Dates */}
      {athleteWorkouts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Available workout dates:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {athleteWorkouts.slice(0, 10).map(workout => {
              const isSelected = workout.date === selectedDate
              return (
                <Chip
                  key={workout.id}
                  label={format(parseISO(workout.date), 'MMM dd')}
                  onClick={() => setSelectedDate(workout.date)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                />
              )
            })}
          </Box>
        </Box>
      )}

      {!selectedWorkout ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Workout Scheduled
            </Typography>
            <Typography color="text.secondary">
              {isSelectedDateToday 
                ? "There's no workout scheduled for today. Check with your coach or select a different date."
                : `No workout scheduled for ${format(parseISO(selectedDate), 'MMMM dd, yyyy')}. Try selecting a different date.`
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Main Workout Display */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenter />
                    {selectedWorkout.name || `Workout for ${format(parseISO(selectedDate), 'MMM dd')}`}
                  </Box>
                }
                subheader={
                  <Box>
                    <Typography variant="h6">{currentExercise?.name || 'Ready to start'}</Typography>
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
                {!workoutStarted ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Ready to start your workout?
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large" 
                      onClick={startWorkout}
                      startIcon={<FitnessCenter />}
                    >
                      Start Workout
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Exercise {activeExercise + 1} of {selectedWorkout.exercises.length}
                    </Typography>
                    
                    {currentExercise && (
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
                            <Typography variant="h4">{currentExercise.sets}</Typography>
                            <Typography variant="caption" color="text.secondary">Sets</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        disabled={activeExercise === 0}
                        onClick={() => setActiveExercise(prev => prev - 1)}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="contained"
                        disabled={activeExercise >= selectedWorkout.exercises.length - 1}
                        onClick={() => setActiveExercise(prev => prev + 1)}
                      >
                        Next Exercise
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise List Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Exercise List" />
              <CardContent>
                <List dense>
                  {selectedWorkout.exercises.map((exercise, index) => {
                    const exerciseCompleted = index < activeExercise
                    return (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          bgcolor: index === activeExercise ? 'primary.light' : 'transparent',
                          borderRadius: 1,
                          mb: 0.5,
                          opacity: exerciseCompleted ? 0.7 : 1
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: exerciseCompleted ? 'success.main' : 'text.secondary',
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
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default WorkoutView