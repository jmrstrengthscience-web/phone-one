
import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../lib/DataContext';


type DataContextType = {
  data: { teams: any[]; athletes: any[] };
  deleteTeam: (id: string) => void;
};

export default function TeamList() {
  const context = useData() as unknown as DataContextType | undefined;
  const data = context?.data || { teams: [], athletes: [] };
  const deleteTeam = context?.deleteTeam || (() => {});
  const teams = data.teams || [];
  const athletes = data.athletes || [];

  function handleDelete(id: string) {
    if (window.confirm('Delete this team?')) {
      deleteTeam(id);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Teams</Typography>
  <Button component={Link} to="/coach/teams/new" variant="contained">New Team</Button>
      </Box>
      <List>
        {teams.map((team: any) => (
          <ListItem
            key={team.id}
            secondaryAction={
              <>
                <Button component={Link} to={`/coach/teams/${team.id}/edit`} sx={{ mr: 1 }}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(team.id)}>Delete</Button>
              </>
            }
          >
            <ListItemText
              primary={team.name}
              secondary={`Athletes: ${athletes.filter(a => (a.teams || []).includes(team.id)).length}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
