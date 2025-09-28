import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Rating
} from '@mui/material'
import {
  LocalHospital,
  Warning,
  TrendingUp,
  Person,
  Assessment,
  Add,
  Timeline
} from '@mui/icons-material'
import { useData } from '../lib/DataContext'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const INJURY_TYPES = [
  'Acute', 'Chronic', 'Overuse', 'Contact', 'Non-contact'
]

const SEVERITY_LEVELS = [
  { value: 1, label: 'Minor', color: '#4caf50' },
  { value: 2, label: 'Moderate', color: '#ff9800' },
  { value: 3, label: 'Severe', color: '#f44336' },
  { value: 4, label: 'Critical', color: '#d32f2f' }
]

const BODY_AREAS = [
  'Head', 'Neck', 'Upper Back', 'Lower Back', 'Chest', 'Shoulder', 'Upper Arm', 
  'Elbow', 'Forearm', 'Wrist', 'Hand', 'Hip', 'Thigh', 'Knee', 'Calf', 
  'Ankle', 'Foot', 'Core', 'Hamstring', 'Quadriceps', 'Groin'
]

export function InjuryReports() {
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading injury reports...</div>;
  }
  
  const { data, addInjuryReport, currentUser } = contextData;
  const [activeTab, setActiveTab] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newReport, setNewReport] = useState({
    athlete_id: '',
    body_area: '',
    injury_type: '',
    severity: 1,
    description: '',
    occurred_at: format(new Date(), 'yyyy-MM-dd'),
    pain_level: 5
  })
  const [loading, setLoading] = useState(false)

  // Filter injury reports for coach's teams
  const coachTeams = useMemo(() => {
    if (!currentUser || currentUser.role !== 'coach') return []
    return (data.teams || []).filter(t => t.coachId === currentUser.id)
  }, [data.teams, currentUser])

  const coachAthletes = useMemo(() => {
    const teamIds = coachTeams.map(t => t.id)
    return (data.athletes || []).filter(a => 
      (a.teams || []).some(tid => teamIds.includes(tid))
    )
  }, [data.athletes, coachTeams])

  const injuryReports = useMemo(() => {
    const athleteIds = coachAthletes.map(a => a.id)
    return (data.injuryReports || []).filter(report => 
      athleteIds.includes(report.athlete_id)
    )
  }, [data.injuryReports, coachAthletes])

  // Analytics data
  const injuryAnalytics = useMemo(() => {
    if (injuryReports.length === 0) return null

    // Most common injury areas
    const areaFrequency = {}
    injuryReports.forEach(report => {
      areaFrequency[report.body_area] = (areaFrequency[report.body_area] || 0) + 1
    })

    // Injury trends over time
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MM/dd')
      const count = injuryReports.filter(report => 
        format(new Date(report.occurred_at), 'MM/dd') === date
      ).length
      return { date, count }
    })

    // Severity distribution
    const severityCount = SEVERITY_LEVELS.reduce((acc, level) => {
      acc[level.label] = injuryReports.filter(r => r.severity === level.value).length
      return acc
    }, {})

    // Athlete injury frequency
    const athleteInjuries = {}
    injuryReports.forEach(report => {
      const athlete = coachAthletes.find(a => a.id === report.athlete_id)
      const name = athlete?.name || 'Unknown'
      athleteInjuries[name] = (athleteInjuries[name] || 0) + 1
    })

    return {
      areaFrequency,
      last30Days,
      severityCount,
      athleteInjuries
    }
  }, [injuryReports, coachAthletes])

  // Get wellness check ratings for injured athletes
  const wellnessData = useMemo(() => {
    const injuredAthleteIds = [...new Set(injuryReports.map(r => r.athlete_id))]
    return (data.wellnessChecks || []).filter(check => 
      injuredAthleteIds.includes(check.athlete_id)
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [data.wellnessChecks, injuryReports])

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const athlete = coachAthletes.find(a => a.id === newReport.athlete_id)
      await addInjuryReport({
        ...newReport,
        athlete_name: athlete?.name || 'Unknown',
        coach_id: currentUser.id,
        status: 'Active'
      })
      setDialogOpen(false)
      setNewReport({
        athlete_id: '',
        body_area: '',
        injury_type: '',
        severity: 1,
        description: '',
        occurred_at: format(new Date(), 'yyyy-MM-dd'),
        pain_level: 5
      })
    } catch (error) {
      console.error('Failed to submit injury report:', error)
    }
    setLoading(false)
  }

  if (currentUser?.role !== 'coach') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">This page is only available to coaches.</Alert>
      </Box>
    )
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true }
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="error" />
          Injury Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          New Report
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Athlete Wellness" />
          <Tab label="Reports List" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && injuryAnalytics && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Most Common Injury Areas" />
              <CardContent>
                <Bar
                  data={{
                    labels: Object.keys(injuryAnalytics.areaFrequency),
                    datasets: [{
                      label: 'Number of Injuries',
                      data: Object.values(injuryAnalytics.areaFrequency),
                      backgroundColor: '#f44336',
                      borderColor: '#d32f2f',
                      borderWidth: 1
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Injury Frequency by Body Area' }}}}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Injury Severity Distribution" />
              <CardContent>
                <Pie
                  data={{
                    labels: Object.keys(injuryAnalytics.severityCount),
                    datasets: [{
                      data: Object.values(injuryAnalytics.severityCount),
                      backgroundColor: SEVERITY_LEVELS.map(s => s.color),
                      borderWidth: 2
                    }]
                  }}
                  options={chartOptions}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Injury Trends (Last 30 Days)" />
              <CardContent>
                <Line
                  data={{
                    labels: injuryAnalytics.last30Days.map(d => d.date),
                    datasets: [{
                      label: 'New Injuries',
                      data: injuryAnalytics.last30Days.map(d => d.count),
                      borderColor: '#f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      tension: 0.3
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Daily Injury Reports' }}}}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Analytics Tab */}
      {activeTab === 1 && injuryAnalytics && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Athlete Injury Frequency" />
              <CardContent>
                <Bar
                  data={{
                    labels: Object.keys(injuryAnalytics.athleteInjuries),
                    datasets: [{
                      label: 'Number of Injuries',
                      data: Object.values(injuryAnalytics.athleteInjuries),
                      backgroundColor: '#ff9800',
                      borderColor: '#f57c00',
                      borderWidth: 1
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Injuries by Athlete' }}}}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Key Statistics" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="h4" color="error">{injuryReports.length}</Typography>
                    <Typography color="text.secondary">Total Reports</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {injuryReports.filter(r => r.status === 'Active').length}
                    </Typography>
                    <Typography color="text.secondary">Active Injuries</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {Math.round((injuryReports.filter(r => r.severity >= 3).length / injuryReports.length) * 100) || 0}%
                    </Typography>
                    <Typography color="text.secondary">High Severity</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Athlete Wellness Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Wellness Check Ratings for Injured Athletes" />
              <CardContent>
                {wellnessData.length === 0 ? (
                  <Typography color="text.secondary">No wellness data available</Typography>
                ) : (
                  <List>
                    {wellnessData.slice(0, 10).map(check => {
                      const athlete = coachAthletes.find(a => a.id === check.athlete_id)
                      const overallScore = check.ratings ? 
                        Object.values(check.ratings).reduce((a, b) => a + b, 0) / Object.values(check.ratings).length : 5
                      
                      return (
                        <ListItem key={check.id} divider>
                          <ListItemIcon>
                            <Avatar>{athlete?.name?.charAt(0) || '?'}</Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={`${athlete?.name || 'Unknown'} - ${format(new Date(check.date), 'MMM dd, yyyy')}`}
                            secondary={
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="body2">Overall Wellness:</Typography>
                                  <Rating value={overallScore / 2} precision={0.5} size="small" readOnly />
                                  <Typography variant="body2">({overallScore.toFixed(1)}/10)</Typography>
                                </Box>
                                {check.comments && (
                                  <Typography variant="body2" color="text.secondary">
                                    "{check.comments}"
                                  </Typography>
                                )}
                                {check.injury_areas && check.injury_areas.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    {check.injury_areas.map(area => (
                                      <Chip key={area} label={area} size="small" color="error" sx={{ mr: 0.5, mb: 0.5 }} />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Reports List Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="All Injury Reports" />
              <CardContent>
                <List>
                  {injuryReports.map(report => {
                    const athlete = coachAthletes.find(a => a.id === report.athlete_id)
                    const severity = SEVERITY_LEVELS.find(s => s.value === report.severity)
                    
                    return (
                      <ListItem key={report.id} divider>
                        <ListItemIcon>
                          <LocalHospital color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${athlete?.name || 'Unknown'} - ${report.body_area}`}
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                <Chip 
                                  label={severity?.label || 'Unknown'} 
                                  size="small" 
                                  sx={{ bgcolor: severity?.color, color: 'white' }}
                                />
                                <Chip label={report.injury_type} size="small" variant="outlined" />
                                <Typography variant="body2">
                                  {format(new Date(report.occurred_at), 'MMM dd, yyyy')}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                Pain Level: {report.pain_level}/10
                              </Typography>
                              {report.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {report.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    )
                  })}
                  {injuryReports.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No injury reports found" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* New Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report New Injury</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Athlete</InputLabel>
                  <Select
                    value={newReport.athlete_id}
                    onChange={(e) => setNewReport(prev => ({ ...prev, athlete_id: e.target.value }))}
                    label="Athlete"
                  >
                    {coachAthletes.map(athlete => (
                      <MenuItem key={athlete.id} value={athlete.id}>{athlete.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Body Area</InputLabel>
                  <Select
                    value={newReport.body_area}
                    onChange={(e) => setNewReport(prev => ({ ...prev, body_area: e.target.value }))}
                    label="Body Area"
                  >
                    {BODY_AREAS.map(area => (
                      <MenuItem key={area} value={area}>{area}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Injury Type</InputLabel>
                  <Select
                    value={newReport.injury_type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, injury_type: e.target.value }))}
                    label="Injury Type"
                  >
                    {INJURY_TYPES.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={newReport.severity}
                    onChange={(e) => setNewReport(prev => ({ ...prev, severity: e.target.value }))}
                    label="Severity"
                  >
                    {SEVERITY_LEVELS.map(level => (
                      <MenuItem key={level.value} value={level.value}>{level.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Occurred"
                  value={newReport.occurred_at}
                  onChange={(e) => setNewReport(prev => ({ ...prev, occurred_at: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography gutterBottom>Pain Level: {newReport.pain_level}/10</Typography>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newReport.pain_level}
                    onChange={(e) => setNewReport(prev => ({ ...prev, pain_level: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the injury, how it occurred, symptoms, etc."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InjuryReports
