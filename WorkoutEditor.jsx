
import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Box, MenuItem, InputLabel, Select, FormControl, 
  Chip, OutlinedInput, IconButton, Grid, Typography, Card, CardContent, 
  CardHeader, Divider, Paper, Stack, Autocomplete, Alert, Fab, Collapse
} from '@mui/material';
import { 
  Add, Delete, FitnessCenter, Visibility, VisibilityOff, 
  Timer, RepeatOne, Notes, Save, Cancel, DragIndicator,
  SportsMartialArts, Assignment, Group, Person
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../lib/DataContext';


export default function WorkoutEditor() {
  const { id } = useParams();
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading workout editor...</div>;
  }
  
  const { data, addOrUpdateWorkout } = contextData;
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([
    { 
      id: 1, 
      name: '', 
      sets: '', 
      reps: '', 
      weight: '', 
      restTime: '', 
      notes: '', 
      tempo: '',
      rpe: '',
      tier: 'A',
      tierColor: '#00e6a8'
    }
  ]);
  const [teamIds, setTeamIds] = useState([]);
  const [athleteIds, setAthleteIds] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [workoutType, setWorkoutType] = useState('strength');
  const navigate = useNavigate();

  // Athletic tier system
  const tierColors = {
    A: '#00e6a8', // primary green
    B: '#ff2d95', // secondary pink
    C: '#ffc107', // warning yellow
    D: '#ff5722', // orange
    E: '#f44336', // red
    F: '#9c27b0', // purple
    G: '#00bcd4', // cyan
    H: '#607d8b', // blue grey
  };

  const workoutTypes = [
    { value: 'strength', label: 'Strength Training', icon: '💪' },
    { value: 'cardio', label: 'Cardiovascular', icon: '🏃‍♂️' },
    { value: 'agility', label: 'Speed & Agility', icon: '⚡' },
    { value: 'recovery', label: 'Recovery/Mobility', icon: '🧘‍♂️' },
    { value: 'sport', label: 'Sport Specific', icon: '🏈' },
    { value: 'conditioning', label: 'Conditioning', icon: '🔥' },
  ];

  useEffect(() => {
    if (id && id !== 'new') {
      const w = (data.workouts || []).find(x => x.id === id);
      if (w) {
        setTitle(w.title || '');
        setDate(w.date || '');
        setDescription(w.description || '');
        setWorkoutType(w.workoutType || 'strength');
        setExercises((w.exercises && w.exercises.length > 0)
          ? w.exercises.map((e, idx) => ({
              id: e.id || idx + 1,
              name: e.name || '',
              sets: e.sets || '',
              reps: e.reps || '',
              weight: e.weight || '',
              restTime: e.restTime || '',
              notes: e.notes || '',
              tempo: e.tempo || '',
              rpe: e.rpe || '',
              tier: e.tier || 'A',
              tierColor: e.tierColor || tierColors[e.tier] || '#00e6a8'
            }))
          : [{ id: 1, name: '', sets: '', reps: '', weight: '', restTime: '', notes: '', tempo: '', rpe: '', tier: 'A', tierColor: '#00e6a8' }]);
        setTeamIds(w.teams || []);
        setAthleteIds(w.athletes || []);
      }
    } else {
      setTitle('');
      setDate('');
      setDescription('');
      setWorkoutType('strength');
      setExercises([{ id: 1, name: '', sets: '', reps: '', weight: '', restTime: '', notes: '', tempo: '', rpe: '', tier: 'A', tierColor: '#00e6a8' }]);
      setTeamIds([]);
      setAthleteIds([]);
    }
    // eslint-disable-next-line
  }, [id, data]);

  function save() {
    const filteredExercises = exercises.filter(e => e.name.trim() !== '');
    const workout = {
      id: id === 'new' ? undefined : id,
      title,
      date,
      description,
      workoutType,
      exercises: filteredExercises,
      teams: teamIds,
      athletes: athleteIds,
    };
    addOrUpdateWorkout(workout);
    navigate('/coach/workouts');
  }

  const addExercise = () => {
    const newId = Math.max(...exercises.map(e => e.id || 0)) + 1;
    setExercises([...exercises, { 
      id: newId, 
      name: '', 
      sets: '', 
      reps: '', 
      weight: '', 
      restTime: '', 
      notes: '', 
      tempo: '', 
      rpe: '',
      tier: 'A',
      tierColor: '#00e6a8'
    }]);
  };

  const removeExercise = (exerciseId) => {
    if (exercises.length === 1) {
      setExercises([{ id: 1, name: '', sets: '', reps: '', weight: '', restTime: '', notes: '', tempo: '', rpe: '', tier: 'A', tierColor: '#00e6a8' }]);
    } else {
      setExercises(exercises.filter(e => e.id !== exerciseId));
    }
  };

  const updateExercise = (exerciseId, field, value) => {
    setExercises(exercises.map(e => 
      e.id === exerciseId ? { ...e, [field]: value } : e
    ));
  };

  const getTotalVolume = () => {
    return exercises.reduce((total, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const reps = parseInt(ex.reps) || 0;
      const weight = parseInt(ex.weight) || 0;
      return total + (sets * reps * weight);
    }, 0);
  };

  const getEstimatedTime = () => {
    return exercises.reduce((total, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const rest = parseInt(ex.restTime) || 60;
      return total + (sets * 30) + ((sets - 1) * rest); // 30sec per set + rest
    }, 0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenter sx={{ fontSize: 40, color: 'primary.main' }} />
          {id === 'new' ? 'Create Workout' : 'Edit Workout'}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button variant="outlined" onClick={() => navigate('/coach/workouts')} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} startIcon={<Save />} disabled={!title.trim()}>
            Save Workout
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Main Editor */}
        <Grid item xs={12} md={showPreview ? 8 : 12}>
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(0,230,168,0.05), rgba(255,45,149,0.05))' }}>
            <CardHeader 
              title="Workout Details" 
              avatar={<Assignment sx={{ color: 'primary.main' }} />}
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Workout Title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required
                    placeholder="e.g., Upper Body Power Day"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    label="Date" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Workout Type</InputLabel>
                    <Select
                      value={workoutType}
                      label="Workout Type"
                      onChange={e => setWorkoutType(e.target.value)}
                    >
                      {workoutTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{type.icon}</span>
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Description / Focus" 
                    multiline 
                    rows={2}
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Describe the workout focus and goals..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Exercises Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title={`Exercises (${exercises.filter(e => e.name.trim()).length})`}
              avatar={<SportsMartialArts sx={{ color: 'primary.main' }} />}
              action={
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addExercise}
                  size="small"
                >
                  Add Exercise
                </Button>
              }
            />
            <CardContent>
              {exercises.map((exercise, idx) => (
                <Paper 
                  key={exercise.id} 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: exercise.name.trim() ? '2px solid' : '1px dashed',
                    borderColor: exercise.name.trim() ? 'primary.main' : 'grey.500',
                    background: exercise.name.trim() ? 'linear-gradient(135deg, rgba(0,230,168,0.02), rgba(255,45,149,0.02))' : 'transparent'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DragIndicator sx={{ color: 'grey.400', cursor: 'grab' }} />
                      Exercise #{idx + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeExercise(exercise.id)}
                      disabled={exercises.length === 1}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={(data.exercises || []).map(ex => ex.name)}
                        value={exercise.name}
                        onChange={(event, newValue) => updateExercise(exercise.id, 'name', newValue || '')}
                        freeSolo
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Exercise Name" 
                            placeholder="Search or type exercise name..."
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="Sets"
                        value={exercise.sets}
                        onChange={e => updateExercise(exercise.id, 'sets', e.target.value)}
                        type="number"
                        InputProps={{ startAdornment: <RepeatOne sx={{ color: 'grey.400', mr: 1 }} /> }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="Reps"
                        value={exercise.reps}
                        onChange={e => updateExercise(exercise.id, 'reps', e.target.value)}
                        fullWidth
                        placeholder="8-12"
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="Weight (lbs)"
                        value={exercise.weight}
                        onChange={e => updateExercise(exercise.id, 'weight', e.target.value)}
                        type="number"
                        fullWidth
                        placeholder="185"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Rest Time (sec)"
                        value={exercise.restTime}
                        onChange={e => updateExercise(exercise.id, 'restTime', e.target.value)}
                        type="number"
                        InputProps={{ startAdornment: <Timer sx={{ color: 'grey.400', mr: 1 }} /> }}
                        fullWidth
                        placeholder="60"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Tempo"
                        value={exercise.tempo}
                        onChange={e => updateExercise(exercise.id, 'tempo', e.target.value)}
                        fullWidth
                        placeholder="3-1-2-1"
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="RPE (1-10)"
                        value={exercise.rpe}
                        onChange={e => updateExercise(exercise.id, 'rpe', e.target.value)}
                        type="number"
                        inputProps={{ min: 1, max: 10 }}
                        fullWidth
                        placeholder="8"
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Tier</InputLabel>
                        <Select
                          value={exercise.tier || 'A'}
                          label="Tier"
                          onChange={e => {
                            const newTier = e.target.value;
                            updateExercise(exercise.id, 'tier', newTier);
                            updateExercise(exercise.id, 'tierColor', tierColors[newTier]);
                          }}
                        >
                          {Object.keys(tierColors).map(t => (
                            <MenuItem key={t} value={t}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box 
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    bgcolor: tierColors[t], 
                                    borderRadius: '50%' 
                                  }} 
                                />
                                {t}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Notes"
                        value={exercise.notes}
                        onChange={e => updateExercise(exercise.id, 'notes', e.target.value)}
                        InputProps={{ startAdornment: <Notes sx={{ color: 'grey.400', mr: 1 }} /> }}
                        fullWidth
                        placeholder="Focus on form..."
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {exercises.length === 0 && (
                <Alert severity="info" action={
                  <Button size="small" onClick={addExercise}>Add First Exercise</Button>
                }>
                  No exercises added yet. Start building your workout!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Assignment Section */}
          <Card>
            <CardHeader 
              title="Assignment"
              avatar={<Group sx={{ color: 'primary.main' }} />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assign to Teams</InputLabel>
                    <Select
                      multiple
                      value={teamIds}
                      onChange={e => setTeamIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      input={<OutlinedInput label="Assign to Teams" />}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => {
                            const t = (data.teams || []).find(tm => tm.id === id);
                            return <Chip key={id} label={t ? t.name : id} color="primary" size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {(data.teams || []).map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assign to Individual Athletes</InputLabel>
                    <Select
                      multiple
                      value={athleteIds}
                      onChange={e => setAthleteIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      input={<OutlinedInput label="Assign to Individual Athletes" />}
                      renderValue={selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => {
                            const a = (data.athletes || []).find(at => at.id === id);
                            return <Chip key={id} label={a ? a.name : id} color="secondary" size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {(data.athletes || []).map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Collapse in={showPreview} orientation="horizontal">
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Card sx={{ background: 'linear-gradient(135deg, rgba(0,230,168,0.1), rgba(255,45,149,0.1))' }}>
                <CardHeader 
                  title="Workout Preview"
                  avatar={<Visibility sx={{ color: 'primary.main' }} />}
                  subheader={`${exercises.filter(e => e.name.trim()).length} exercises • ~${Math.ceil(getEstimatedTime() / 60)}min`}
                />
                <CardContent>
                  {/* Workout Stats */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {title || 'Untitled Workout'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip 
                        label={workoutTypes.find(t => t.value === workoutType)?.label || workoutType} 
                        color="primary" 
                        size="small"
                      />
                      {exercises.filter(e => e.name.trim()).length > 0 && (
                        <Chip 
                          label={`${exercises.filter(e => e.name.trim()).length} exercises`}
                          color="secondary" 
                          size="small"
                        />
                      )}
                    </Stack>
                    {description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description}
                      </Typography>
                    )}
                    
                    {/* Stats */}
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                          <Typography variant="caption">Total Volume</Typography>
                          <Typography variant="h6">{getTotalVolume().toLocaleString()} lbs</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'secondary.main', color: 'white' }}>
                          <Typography variant="caption">Est. Time</Typography>
                          <Typography variant="h6">{Math.ceil(getEstimatedTime() / 60)}min</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Exercise List Preview */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Exercises</Typography>
                  {exercises.filter(e => e.name.trim()).length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No exercises added yet
                    </Typography>
                  ) : (
                    exercises.filter(e => e.name.trim()).map((exercise, idx) => (
                      <Paper key={exercise.id} sx={{ 
                        p: 2, 
                        mb: 1, 
                        bgcolor: 'background.default',
                        border: '2px solid',
                        borderColor: exercise.tierColor || '#00e6a8',
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {idx + 1}. {exercise.name}
                          </Typography>
                          <Chip 
                            label={`Tier ${exercise.tier || 'A'}`}
                            size="small"
                            sx={{ 
                              bgcolor: exercise.tierColor || '#00e6a8', 
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.sets && exercise.reps && `${exercise.sets} sets × ${exercise.reps} reps`}
                          {exercise.weight && ` @ ${exercise.weight}lbs`}
                          {exercise.restTime && ` • ${exercise.restTime}s rest`}
                          {exercise.rpe && ` • RPE ${exercise.rpe}`}
                          {exercise.tempo && ` • Tempo: ${exercise.tempo}`}
                        </Typography>
                        {exercise.notes && (
                          <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                            "{exercise.notes}"
                          </Typography>
                        )}
                      </Paper>
                    ))
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Collapse>
      </Grid>

      {/* Floating Save Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={save}
        disabled={!title.trim()}
      >
        <Save />
      </Fab>
    </Box>
  );
}
