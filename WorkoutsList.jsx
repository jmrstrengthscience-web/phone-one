
import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, CardHeader, Chip, Stack, 
  Grid, IconButton, Menu, MenuItem, Fab, InputAdornment, TextField,
  Paper, Divider, Avatar, Tooltip
} from '@mui/material';
import { 
  Add, FitnessCenter, MoreVert, Edit, Delete, FilterList,
  Search, CalendarToday, Group, Person, Timer, TrendingUp,
  SportsMartialArts, Assignment, Visibility
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../lib/MultiTenantDataContext';
import { format, parseISO, isValid } from 'date-fns';

export function WorkoutsList() {
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading workouts...</div>;
  }
  
  const { data, deleteWorkout } = contextData;
  const workouts = data.workouts || [];
  const { teams = [], athletes = [] } = data;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const workoutTypes = [
    { value: 'all', label: 'All Workouts' },
    { value: 'strength', label: 'Strength Training', icon: '💪' },
    { value: 'cardio', label: 'Cardiovascular', icon: '🏃‍♂️' },
    { value: 'agility', label: 'Speed & Agility', icon: '⚡' },
    { value: 'recovery', label: 'Recovery/Mobility', icon: '🧘‍♂️' },
    { value: 'sport', label: 'Sport Specific', icon: '🏈' },
    { value: 'conditioning', label: 'Conditioning', icon: '🔥' },
  ];

  const tierColors = {
    A: '#00e6a8', B: '#ff2d95', C: '#ffc107', D: '#ff5722', 
    E: '#f44336', F: '#9c27b0', G: '#00bcd4', H: '#607d8b',
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || workout.workoutType === filterType;
    return matchesSearch && matchesType;
  });

  const handleMenuOpen = (event, workout) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkout(workout);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkout(null);
  };

  const handleDelete = (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      deleteWorkout(workoutId);
    }
    handleMenuClose();
  };

  const getWorkoutStats = (workout) => {
    const exercises = workout.exercises || [];
    const totalVolume = exercises.reduce((total, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const reps = parseInt(ex.reps) || 0;
      const weight = parseInt(ex.weight) || 0;
      return total + (sets * reps * weight);
    }, 0);

    const estimatedTime = exercises.reduce((total, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const rest = parseInt(ex.restTime) || 60;
      return total + (sets * 30) + ((sets - 1) * rest);
    }, 0);

    return { totalVolume, estimatedTime: Math.ceil(estimatedTime / 60) };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenter sx={{ fontSize: 40, color: 'primary.main' }} />
          Workout Library
        </Typography>
        <Button 
          component={Link} 
          to="/coach/workouts/new" 
          variant="contained"
          size="large"
          startIcon={<Add />}
          sx={{ px: 3 }}
        >
          Create Workout
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, rgba(0,230,168,0.05), rgba(255,45,149,0.05))' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            >
              {workoutTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon && <span>{type.icon}</span>}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,230,168,0.02), rgba(255,45,149,0.02))' }}>
          <SportsMartialArts sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {searchTerm || filterType !== 'all' ? 'No workouts match your search' : 'No workouts created yet'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first workout to get started building training programs'
            }
          </Typography>
          <Button 
            component={Link} 
            to="/coach/workouts/new" 
            variant="contained"
            startIcon={<Add />}
          >
            Create First Workout
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkouts.map((workout) => {
            const stats = getWorkoutStats(workout);
            const workoutTypeInfo = workoutTypes.find(t => t.value === workout.workoutType);
            const workoutDate = workout.date && isValid(parseISO(workout.date)) 
              ? format(parseISO(workout.date), 'MMM dd, yyyy') 
              : 'No date set';

            return (
              <Grid item xs={12} md={6} lg={4} key={workout.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    background: 'linear-gradient(135deg, rgba(0,230,168,0.02), rgba(255,45,149,0.02))',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <FitnessCenter />
                      </Avatar>
                    }
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {workout.title}
                      </Typography>
                    }
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{workoutDate}</Typography>
                      </Box>
                    }
                    action={
                      <IconButton onClick={(e) => handleMenuOpen(e, workout)}>
                        <MoreVert />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ pt: 0 }}>
                    {/* Workout Type & Description */}
                    {workoutTypeInfo && (
                      <Chip 
                        label={workoutTypeInfo.label}
                        size="small"
                        color="primary"
                        sx={{ mb: 2 }}
                        icon={<span>{workoutTypeInfo.icon}</span>}
                      />
                    )}
                    
                    {workout.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 2, lineHeight: 1.4 }}
                      >
                        {workout.description.length > 100 
                          ? `${workout.description.substring(0, 100)}...` 
                          : workout.description
                        }
                      </Typography>
                    )}

                    {/* Exercise Count */}
                    <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment sx={{ fontSize: 16 }} />
                      {(workout.exercises || []).length} exercise{(workout.exercises || []).length !== 1 ? 's' : ''}
                    </Typography>

                    {/* Stats */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
                          <Typography variant="caption">Volume</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {stats.totalVolume.toLocaleString()}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, bgcolor: 'secondary.main', color: 'white', textAlign: 'center' }}>
                          <Typography variant="caption">~Duration</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {stats.estimatedTime}min
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />

                    {/* Assignments */}
                    <Box>
                      {workout.teams && workout.teams.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                          <Group sx={{ fontSize: 14, color: 'text.secondary' }} />
                          {workout.teams.slice(0, 2).map(tid => {
                            const team = teams.find(tm => tm.id === tid);
                            return (
                              <Chip 
                                key={tid} 
                                label={team ? team.name : tid} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            );
                          })}
                          {workout.teams.length > 2 && (
                            <Chip 
                              label={`+${workout.teams.length - 2} more`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      )}
                      
                      {workout.athletes && workout.athletes.length > 0 && (
                        <Stack direction="row" spacing={0.5}>
                          <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                          {workout.athletes.slice(0, 2).map(aid => {
                            const athlete = athletes.find(at => at.id === aid);
                            return (
                              <Chip 
                                key={aid} 
                                label={athlete ? athlete.name : aid} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                              />
                            );
                          })}
                          {workout.athletes.length > 2 && (
                            <Chip 
                              label={`+${workout.athletes.length - 2} more`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/coach/workouts/${selectedWorkout.id}/edit`);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Workout
        </MenuItem>
        <MenuItem onClick={() => {
          // Add view/preview functionality here
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDelete(selectedWorkout.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Workout
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        component={Link}
        to="/coach/workouts/new"
      >
        <Add />
      </Fab>
    </Box>
  );
}

export default WorkoutsList;
