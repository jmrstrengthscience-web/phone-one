import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../lib/DataContext';

type Athlete = {
  id: string | number;
  name?: string;
  position?: string;
};

type DataContextType = {
  data?: {
    athletes?: Athlete[];
    // add other properties if needed
  };
};

export default function AthletesList() {
  const context = useData() as unknown as DataContextType;
  const data = context?.data || {};
  const athletes = data.athletes || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h4">Athletes</Typography>
        <Button
          component={Link}
          to="/coach/athletes/new"
          variant="contained"
          color="primary"
        >
          New Athlete
        </Button>
      </Box>

      {/* List of Athletes */}
      <List>
        {athletes.length > 0 ? (
          athletes.map((a) => (
            <ListItem
              key={a.id}
              divider
              secondaryAction={
                <Button
                  component={Link}
                  to={`/coach/athletes/${a.id}/edit`}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              }
            >
              <ListItemText
                primary={a.name || "Unnamed Athlete"}
                secondary={a.position || ""}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No athletes found.
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
