import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../lib/MultiTenantDataContext';

export default function AthleteList() {
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading athletes...</div>;
  }
  
  const { data } = contextData;
  const athletes = data?.athletes || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Athletes</Typography>
        <Button component={Link} to="/athletes/new" variant="contained">New Athlete</Button>
      </Box>

      <List>
        {athletes.map(a => (
          <ListItem key={a.id} secondaryAction={<Button component={Link} to={`/athletes/${a.id}/edit`}>Edit</Button>}>
            <ListItemText primary={a.name} secondary={a.position || ''} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
