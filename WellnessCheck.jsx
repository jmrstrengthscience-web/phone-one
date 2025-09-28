import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';

export default function WellnessCheck() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>Wellness Check</Typography>
      <form>
        <TextField label="How do you feel today?" fullWidth margin="normal" />
        <TextField label="Any pain or injury?" fullWidth margin="normal" />
        {/* Body map UI will go here */}
        <Button variant="contained" type="submit">Submit</Button>
      </form>
    </Box>
  );
}
