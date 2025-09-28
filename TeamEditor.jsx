import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../lib/MultiTenantDataContext';

export default function TeamEditor() {
  const { id } = useParams();
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading team editor...</div>;
  }
  
  const { data, addOrUpdateTeam, addOrUpdateAthlete } = contextData;
  const [name, setName] = useState('');
  const [athleteIds, setAthleteIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id && id !== 'new') {
      const t = (data.teams || []).find(x => x.id === id);
      if (t) setName(t.name || '');
      // Find athletes assigned to this team
      const assigned = (data.athletes || []).filter(a => (a.teams || []).includes(id)).map(a => a.id);
      setAthleteIds(assigned);
    } else {
      setName('');
      setAthleteIds([]);
    }
  }, [id, data]);

  function toggleAthlete(aid) {
    setAthleteIds(prev => prev.includes(aid) ? prev.filter(x => x !== aid) : [...prev, aid]);
  }

  async function save() {
    const team = { id: id === 'new' ? undefined : id, name };
    await addOrUpdateTeam(team);
    // Update athletes' teams
    const athletes = data?.athletes || [];
    for (const athlete of athletes) {
      let teams = Array.isArray(athlete.teams) ? [...athlete.teams] : [];
      if (athleteIds.includes(athlete.id)) {
        if (!teams.includes(id)) teams.push(id);
      } else {
        teams = teams.filter(tid => tid !== id);
      }
      await addOrUpdateAthlete({ ...athlete, teams });
    }
    navigate('/coach/teams');
  }

  return (
    <Box maxWidth={600}>
      <TextField fullWidth label="Team name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Assign Athletes to Team</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        {(data.athletes || []).map(a => (
          <FormControlLabel
            key={a.id}
            control={<Checkbox checked={athleteIds.includes(a.id)} onChange={() => toggleAthlete(a.id)} />}
            label={a.name}
          />
        ))}
      </Box>
      <Button variant="contained" onClick={save}>Save</Button>
    </Box>
  );
}
