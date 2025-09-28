import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

function Dashboard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Coach Dashboard</Typography>
        <Typography variant="body2">Manage teams, workouts, and athletes here.</Typography>
      </CardContent>
    </Card>
  )
}

export default Dashboard
