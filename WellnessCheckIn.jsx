import React, { useState, useMemo } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Slider, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import { 
  FitnessCenter, 
  LocalHospital, 
  Psychology, 
  Restaurant, 
  Hotel,
  Favorite,
  TrendingUp,
  Warning
} from '@mui/icons-material'
import { useData } from '../lib/DataContext'
import { format, subDays } from 'date-fns'

const WELLNESS_CATEGORIES = [
  { key: 'energy', label: 'Energy Level', icon: <FitnessCenter />, color: '#4caf50' },
  { key: 'sleep', label: 'Sleep Quality', icon: <Hotel />, color: '#2196f3' },
  { key: 'nutrition', label: 'Nutrition', icon: <Restaurant />, color: '#ff9800' },
  { key: 'stress', label: 'Stress Level', icon: <Psychology />, color: '#f44336', inverse: true },
  { key: 'soreness', label: 'Muscle Soreness', icon: <LocalHospital />, color: '#9c27b0', inverse: true },
  { key: 'motivation', label: 'Motivation', icon: <Favorite />, color: '#e91e63' },
]

export function WellnessCheckIn({ userId }) {
  const contextData = useData()
  
  // Handle case where context might be null or data might not be loaded
  if (!contextData) {
    return <div>Loading...</div>
  }
  
  const { data, addWellnessCheck, currentUser, loading } = contextData
  
  // Show loading state if data is not ready
  if (loading || !data) {
    return <div>Loading wellness data...</div>
  }
  
  const [ratings, setRatings] = useState({
    energy: 5,
    sleep: 5,
    nutrition: 5,
    stress: 5,
    soreness: 5,
    motivation: 5,
  })
  const [comments, setComments] = useState('')
  const [injuryAreas, setInjuryAreas] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const athleteId = userId || currentUser?.id

  // Get recent wellness checks for this athlete
  const recentChecks = useMemo(() => {
    if (!athleteId) return []
    return (data.wellnessChecks || [])
      .filter(check => check.athlete_id === athleteId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 7) // Last 7 checks
  }, [data.wellnessChecks, athleteId])

  // Calculate readiness score (0-100)
  const readinessScore = useMemo(() => {
    const { energy, sleep, nutrition, stress, soreness, motivation } = ratings
    
    // Convert all ratings to a 0-10 scale where higher is better
    const adjustedStress = 11 - stress  // Invert stress (high stress = low readiness)
    const adjustedSoreness = 11 - soreness  // Invert soreness (high soreness = low readiness)
    
    // Calculate weighted average (all categories equal weight for now)
    const totalScore = energy + sleep + nutrition + adjustedStress + adjustedSoreness + motivation
    const maxPossible = 60  // 6 categories × 10 max points each
    
    return Math.round((totalScore / maxPossible) * 100)
  }, [ratings])

  // Get readiness color based on score
  const getReadinessColor = (score) => {
    if (score >= 80) return { color: '#4caf50', label: 'Excellent' }
    if (score >= 70) return { color: '#8bc34a', label: 'Good' }
    if (score >= 60) return { color: '#ffc107', label: 'Fair' }
    if (score >= 50) return { color: '#ff9800', label: 'Poor' }
    return { color: '#f44336', label: 'Very Poor' }
  }

  // Calculate wellness trends
  const wellnessTrends = useMemo(() => {
    if (recentChecks.length < 2) return {}
    
    const trends = {}
    WELLNESS_CATEGORIES.forEach(category => {
      const recent = recentChecks.slice(0, 3).map(check => {
        let value = check.ratings?.[category.key] || 5
        // Apply inversion for stress and soreness in trend calculation
        if (category.inverse) {
          value = 11 - value
        }
        return value
      })
      const older = recentChecks.slice(3, 6).map(check => {
        let value = check.ratings?.[category.key] || 5
        // Apply inversion for stress and soreness in trend calculation  
        if (category.inverse) {
          value = 11 - value
        }
        return value
      })
      
      if (recent.length && older.length) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
        trends[category.key] = recentAvg - olderAvg
      }
    })
    return trends
  }, [recentChecks])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!athleteId) return

    setSubmitting(true)
    try {
      await addWellnessCheck({
        athlete_id: athleteId,
        athlete_name: currentUser?.name || 'Unknown',
        ratings,
        comments,
        injury_areas: injuryAreas,
        date: format(new Date(), 'yyyy-MM-dd')
      })
      setSuccess(true)
      setComments('')
      setInjuryAreas([])
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to submit wellness check:', error)
    }
    setSubmitting(false)
  }

  const addInjuryArea = (area) => {
    if (area && !injuryAreas.includes(area)) {
      setInjuryAreas([...injuryAreas, area])
    }
  }

  const removeInjuryArea = (area) => {
    setInjuryAreas(injuryAreas.filter(a => a !== area))
  }

  const commonInjuryAreas = [
    'Lower Back', 'Knee', 'Shoulder', 'Ankle', 'Hip', 'Wrist', 
    'Hamstring', 'Quadriceps', 'Calf', 'Neck', 'Elbow', 'Upper Back'
  ]

  if (!athleteId) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Please log in to access wellness check-in.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Favorite color="primary" />
        Daily Wellness Check-In
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Wellness check submitted successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Readiness Score */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: getReadinessColor(readinessScore).color + '20', border: `2px solid ${getReadinessColor(readinessScore).color}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: getReadinessColor(readinessScore).color }}>
                    {readinessScore}%
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Readiness Score
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Chip 
                    label={getReadinessColor(readinessScore).label} 
                    sx={{ 
                      bgcolor: getReadinessColor(readinessScore).color,
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 1
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    Based on your wellness metrics
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wellness Ratings */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="How are you feeling today?" />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {WELLNESS_CATEGORIES.map((category) => {
                    const trend = wellnessTrends[category.key]
                    const trendIcon = trend > 0.5 ? <TrendingUp color="success" /> : 
                                   trend < -0.5 ? <TrendingUp color="error" style={{ transform: 'rotate(180deg)' }} /> : null

                    return (
                      <Grid item xs={12} sm={6} key={category.key}>
                        <Box sx={{ px: 2, py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ color: category.color }}>{category.icon}</Box>
                            <Typography variant="subtitle1">{category.label}</Typography>
                            {trendIcon}
                          </Box>
                          <Slider
                            value={ratings[category.key]}
                            onChange={(e, value) => setRatings(prev => ({ ...prev, [category.key]: value }))}
                            min={1}
                            max={10}
                            step={1}
                            marks
                            valueLabelDisplay="on"
                            sx={{ color: category.color }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
                            <span>{category.inverse ? 'High' : 'Poor'}</span>
                            <span>{category.inverse ? 'Low' : 'Excellent'}</span>
                          </Box>
                        </Box>
                      </Grid>
                    )
                  })}

                  {/* Injury Areas */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital />
                      Any pain or discomfort?
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Select area</InputLabel>
                        <Select
                          value=""
                          onChange={(e) => addInjuryArea(e.target.value)}
                          label="Select area"
                        >
                          {commonInjuryAreas.map(area => (
                            <MenuItem key={area} value={area}>{area}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {injuryAreas.map(area => (
                        <Chip 
                          key={area} 
                          label={area} 
                          onDelete={() => removeInjuryArea(area)}
                          color="secondary" 
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Comments */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Additional comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Any additional notes about how you're feeling today..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      disabled={submitting}
                      sx={{ mt: 2 }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Check-In'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent History */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Recent Check-Ins" />
            <CardContent>
              {recentChecks.length === 0 ? (
                <Typography color="text.secondary">No previous check-ins</Typography>
              ) : (
                <List dense>
                  {recentChecks.map((check, index) => {
                    // Calculate readiness score for historical check
                    let readinessScore = 50 // default
                    if (check.ratings) {
                      const { energy, sleep, nutrition, stress, soreness, motivation } = check.ratings
                      const adjustedStress = 11 - (stress || 5)
                      const adjustedSoreness = 11 - (soreness || 5)
                      const totalScore = (energy || 5) + (sleep || 5) + (nutrition || 5) + adjustedStress + adjustedSoreness + (motivation || 5)
                      readinessScore = Math.round((totalScore / 60) * 100)
                    }
                    const scoreColor = readinessScore >= 70 ? 'success' : readinessScore >= 50 ? 'warning' : 'error'
                    
                    return (
                      <ListItem key={check.id} divider>
                        <ListItemIcon>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: `${scoreColor}.main`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          >
                            {readinessScore}
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={format(new Date(check.date), 'MMM dd')}
                          secondary={check.comments ? check.comments.substring(0, 50) + '...' : 'No comments'}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Warning signs */}
          {recentChecks.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardHeader title="Wellness Alerts" />
              <CardContent>
                {(() => {
                  const alerts = []
                  const latest = recentChecks[0]
                  
                  // Note: stress and soreness are inverse - high values mean high stress/soreness
                  if (latest.ratings?.stress >= 8) alerts.push('High stress levels detected')
                  if (latest.ratings?.soreness >= 8) alerts.push('High muscle soreness reported')
                  if (latest.ratings?.sleep <= 3) alerts.push('Poor sleep quality')
                  if (latest.ratings?.energy <= 3) alerts.push('Very low energy levels')
                  if (latest.injury_areas?.length > 0) alerts.push('Pain/discomfort reported')
                  
                  if (alerts.length === 0) {
                    return <Typography color="success.main">No wellness concerns</Typography>
                  }
                  
                  return alerts.map((alert, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Warning color="warning" fontSize="small" />
                      <Typography variant="body2">{alert}</Typography>
                    </Box>
                  ))
                })()}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default WellnessCheckIn
