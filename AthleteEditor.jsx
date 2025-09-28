import React, { useEffect, useState } from 'react'
import { Box, TextField, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../lib/MultiTenantDataContext'
import { v4 as uuidv4 } from 'uuid'

export default function AthleteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const contextData = useData()
  
  if (!contextData || contextData.loading) {
    return <div>Loading athlete editor...</div>;
  }
  
  const { data, addOrUpdateAthlete } = contextData
  const [athlete, setAthlete] = useState({ id: null, name: '', age: '', position: '', teams: [] })

  useEffect(() => {
    if (data) {
      if (id && id !== 'new') {
        const a = (data.athletes || []).find((x) => x.id === id)
        if (a) setAthlete(a)
      } else {
        setAthlete({ id: null, name: '', age: '', position: '', teams: [] })
      }
    }
  }, [id, data])

  function toggleTeam(teamId) {
    const teams = athlete.teams || []
    const idx = teams.indexOf(teamId)
    let next = []
    if (idx === -1) next = [...teams, teamId]
    else next = teams.filter((t) => t !== teamId)
    setAthlete({ ...athlete, teams: next })
  }

  function save() {
    addOrUpdateAthlete(athlete)
    navigate('/athletes')
  }

  return (
    <Box>
      <Typography variant="h6">{athlete.id ? 'Edit Athlete' : 'New Athlete'}</Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
        <TextField label="Name" value={athlete.name} onChange={(e) => setAthlete({ ...athlete, name: e.target.value })} />
        <TextField label="Age" value={athlete.age} onChange={(e) => setAthlete({ ...athlete, age: e.target.value })} />
        <TextField label="Position" value={athlete.position} onChange={(e) => setAthlete({ ...athlete, position: e.target.value })} />

        <Box>
          <Typography variant="subtitle2">Assign Teams</Typography>
          {data.teams.map((t) => (
            <FormControlLabel
              key={t.id}
              control={<Checkbox checked={athlete.teams?.includes(t.id) || false} onChange={() => toggleTeam(t.id)} />}
              label={t.name}
            />
          ))}
        </Box>

        <Button variant="contained" onClick={save}>Save Athlete</Button>
      </Box>
    </Box>
  )
}
