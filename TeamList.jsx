
import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../lib/MultiTenantDataContext';

export default function TeamList() {
  const context = useData();
  const data = context?.data || { teams: [] };
  const deleteTeam = context?.deleteTeam || (() => {});
  const teams = data.teams || [];

  function handleDelete(id) {
    if (window.confirm('Delete this team?')) {
      deleteTeam(id);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Teams</Typography>
        <Button component={Link} to="/teams/new" variant="contained">New Team</Button>
      </Box>
      <List>
  {teams.map(team => (
          <ListItem
            key={team.id}
            secondaryAction={
              <>
                <Button component={Link} to={`/teams/${team.id}/edit`} sx={{ mr: 1 }}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(team.id)}>Delete</Button>
              </>
            }
          >
            <ListItemText primary={team.name} secondary={`Athletes: ${team.athletes?.length || 0}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
