import React from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText } from '@mui/material';

export default function Workouts() {
  // Placeholder for workouts list and assignment
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>Workouts</Typography>
      <form>
        <TextField label="Workout Name" fullWidth margin="normal" />
        <TextField label="Assign to Team" fullWidth margin="normal" />
        <Button variant="contained" type="submit">Create Workout</Button>
      </form>
      <List>
        {/* Workouts will be listed here */}
        <ListItem>
          <ListItemText primary="No workouts yet." />
        </ListItem>
      </List>
    </Box>
  );
}
