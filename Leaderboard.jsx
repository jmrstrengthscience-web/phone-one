
import React, { useState, useMemo } from 'react'
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'
import { useData } from '../lib/DataContext'

const METRICS = [
  { key: 'bench', label: 'Bench Press (lbs)' },
  { key: 'squat', label: 'Squat (lbs)' },
  { key: 'deadlift', label: 'Deadlift (lbs)' },
  { key: 'fly10', label: '10 Yard Fly (sec)' },
  // Add more metrics as needed
]

export function Leaderboard() {
  const { data, currentUser } = useData();
  const [selectedMetric, setSelectedMetric] = useState('bench');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Filter teams for this coach or athlete's teams
  const coachTeams = useMemo(() => {
    if (!currentUser || !data.teams) return [];
    
    if (currentUser.role === 'coach') {
      // If coach, show only their teams
      return data.teams.filter(t => !t.coachId || t.coachId === currentUser.id);
    } else {
      // If athlete, show their teams
      const athleteTeams = currentUser.teams || [];
      return data.teams.filter(t => athleteTeams.includes(t.id));
    }
  }, [data.teams, currentUser]);

  // Filter athletes by selected team(s) and user role
  const filteredAthletes = useMemo(() => {
    if (!data.athletes) return [];
    
    let athletesToShow = [];
    
    if (selectedTeam === 'all') {
      // All athletes under accessible teams
      const teamIds = coachTeams.map(t => t.id);
      athletesToShow = data.athletes.filter(a => (a.teams || []).some(tid => teamIds.includes(tid)));
    } else {
      athletesToShow = data.athletes.filter(a => (a.teams || []).includes(selectedTeam));
    }
    
    // For athletes viewing, include themselves even if not in a team for demo purposes
    if (currentUser?.role === 'athlete' && !athletesToShow.find(a => a.id === currentUser.id)) {
      const currentAthlete = data.athletes.find(a => a.id === currentUser.id);
      if (currentAthlete) {
        athletesToShow.push(currentAthlete);
      }
    }
    
    return athletesToShow;
  }, [data.athletes, coachTeams, selectedTeam, currentUser]);

  // Sort athletes by selected metric (descending, except for 10 yard fly which is ascending)
  const sortedAthletes = useMemo(() => {
    const metric = selectedMetric;
    const isTime = metric === 'fly10';
    return [...filteredAthletes].sort((a, b) => {
      const av = Number(a[metric] || 0);
      const bv = Number(b[metric] || 0);
      if (isNaN(av) && isNaN(bv)) return 0;
      if (isNaN(av)) return 1;
      if (isNaN(bv)) return -1;
      return isTime ? av - bv : bv - av;
    });
  }, [filteredAthletes, selectedMetric]);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Leaderboard</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl>
          <InputLabel id="metric-label">Metric</InputLabel>
          <Select
            labelId="metric-label"
            value={selectedMetric}
            label="Metric"
            onChange={e => setSelectedMetric(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {METRICS.map(m => (
              <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="team-label">Team</InputLabel>
          <Select
            labelId="team-label"
            value={selectedTeam}
            label="Team"
            onChange={e => setSelectedTeam(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Teams</MenuItem>
            {coachTeams.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Athlete</TableCell>
              <TableCell>Team(s)</TableCell>
              <TableCell align="right">{METRICS.find(m => m.key === selectedMetric)?.label}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAthletes.map((a, i) => (
              <TableRow key={a.id} sx={{ bgcolor: a.id === currentUser?.id ? 'action.selected' : 'inherit' }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {a.name}
                    {a.id === currentUser?.id && (
                      <Chip label="You" size="small" color="primary" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{(a.teams || []).map(tid => (data.teams.find(t => t.id === tid)?.name || tid)).join(', ')}</TableCell>
                <TableCell align="right">{a[selectedMetric] ?? '—'}</TableCell>
              </TableRow>
            ))}
            {sortedAthletes.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No athletes found for this selection.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Leaderboard
