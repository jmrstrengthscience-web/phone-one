import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, MenuItem, Select, FormControl, InputLabel, Chip, IconButton, Grid } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useData } from '../lib/DataContext';

const METRICS = [
  { key: 'weight', label: 'Weight (lbs)' },
  { key: 'reps', label: 'Reps' },
  { key: 'sets', label: 'Sets' },
  { key: 'distance', label: 'Distance (m)' },
  { key: 'time', label: 'Time (sec)' },
  { key: 'custom', label: 'Custom' },
];

const CATEGORIES = ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Plyometric', 'Rehabilitation'];
const EQUIPMENT = ['Barbell', 'Dumbbells', 'Bodyweight', 'Machine', 'Cable', 'Kettlebell', 'Resistance Band', 'Box', 'Medicine Ball', 'Other'];
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Forearms', 'Power'];

export default function ExerciseLibrary() {
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading exercise library...</div>;
  }
  
  const { data, addOrUpdateExercise, deleteExercise, loading } = contextData;
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [customMetric, setCustomMetric] = useState('');
  const [saving, setSaving] = useState(false);
  


  function handleOpen(exercise = null) {
    if (exercise) {
      // Edit mode
      setEditingId(exercise.id);
      setName(exercise.name || '');
      setCategory(exercise.category || '');
      setEquipment(exercise.equipment || '');
      setMuscleGroups(exercise.muscle_groups || []);
      setMetrics(exercise.metrics || []);
      setCustomMetric('');
    } else {
      // Add mode
      setEditingId(null);
      setName('');
      setCategory('');
      setEquipment('');
      setMuscleGroups([]);
      setMetrics([]);
      setCustomMetric('');
    }
    setOpen(true);
  }
  
  function handleClose() { 
    setOpen(false);
    setEditingId(null);
  }

  function handleMetricChange(key) {
    if (metrics.includes(key)) setMetrics(metrics.filter(m => m !== key));
    else setMetrics([...metrics, key]);
  }

  function handleMuscleGroupChange(group) {
    if (muscleGroups.includes(group)) setMuscleGroups(muscleGroups.filter(m => m !== group));
    else setMuscleGroups([...muscleGroups, group]);
  }

  async function handleSave() {
    if (!name.trim() || !category || !equipment || metrics.length === 0) {
      alert('Please fill in all required fields: Name, Category, Equipment, and at least one Metric');
      return;
    }
    
    setSaving(true);
    try {
      const finalMetrics = metrics.includes('custom') && customMetric 
        ? [...metrics.filter(m => m !== 'custom'), customMetric] 
        : metrics;
      
      const exerciseData = { 
        id: editingId || Date.now().toString(), 
        name: name.trim(), 
        category,
        equipment,
        muscle_groups: muscleGroups,
        metrics: finalMetrics 
      };
      
      await addOrUpdateExercise(exerciseData);
      handleClose();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Failed to save exercise.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;
    try {
      await deleteExercise(id);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  }

  return (
    <Box>
      <Typography variant="h4" mb={2}>Exercise Library</Typography>
      <Button variant="contained" onClick={() => handleOpen()} disabled={loading}>
        Add Exercise
      </Button>
      
      {loading ? (
        <Typography sx={{ mt: 2 }}>Loading exercises...</Typography>
      ) : (
        <List sx={{ mt: 2 }}>
          {(data.exercises || []).map(ex => (
            <ListItem key={ex.id} sx={{ border: '1px solid #333', borderRadius: 1, mb: 1, bgcolor: '#2a2a2a' }}>
              <ListItemText 
                primary={ex.name} 
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">Category: {ex.category}</Typography>
                    <Typography variant="body2" color="textSecondary">Equipment: {ex.equipment}</Typography>
                    <Typography variant="body2" color="textSecondary">Muscles: {(ex.muscle_groups || []).join(', ')}</Typography>
                    <Typography variant="body2" color="textSecondary">Metrics: {(ex.metrics || []).join(', ')}</Typography>
                  </Box>
                }
              />
              <Box>
                <IconButton onClick={() => handleOpen(ex)} size="small">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(ex.id)} size="small" color="error">
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
          {(!data.exercises || data.exercises.length === 0) && (
            <ListItem><ListItemText primary="No exercises yet. Add some to get started!" /></ListItem>
          )}
        </List>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
        <DialogContent>
          <TextField 
            label="Exercise Name" 
            fullWidth 
            value={name} 
            onChange={e => setName(e.target.value)} 
            sx={{ mb: 2, mt: 1 }} 
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={category} onChange={e => setCategory(e.target.value)} label="Category">
                  {CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Equipment</InputLabel>
                <Select value={equipment} onChange={e => setEquipment(e.target.value)} label="Equipment">
                  {EQUIPMENT.map(eq => <MenuItem key={eq} value={eq}>{eq}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Muscle Groups:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {MUSCLE_GROUPS.map(group => (
              <Chip
                key={group}
                label={group}
                onClick={() => handleMuscleGroupChange(group)}
                color={muscleGroups.includes(group) ? 'primary' : 'default'}
                variant={muscleGroups.includes(group) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Metrics to Track:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {METRICS.map(m => (
              <FormControlLabel
                key={m.key}
                control={<Checkbox checked={metrics.includes(m.key)} onChange={() => handleMetricChange(m.key)} />}
                label={m.label}
              />
            ))}
          </Box>
          {metrics.includes('custom') && (
            <TextField 
              label="Custom Metric" 
              fullWidth 
              value={customMetric} 
              onChange={e => setCustomMetric(e.target.value)} 
              sx={{ mt: 1 }} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!name.trim() || !category || !equipment || metrics.length === 0 || saving}
          >
            {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
