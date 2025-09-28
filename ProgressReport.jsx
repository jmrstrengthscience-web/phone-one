import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  FitnessCenter,
  Speed,
  Timer,
  Assessment,
  EmojiEvents,
  Timeline
} from '@mui/icons-material'
import { useData } from '../lib/DataContext'
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement)

const METRICS = [
  { key: 'bench', label: 'Bench Press', unit: 'lbs', icon: <FitnessCenter /> },
  { key: 'squat', label: 'Squat', unit: 'lbs', icon: <FitnessCenter /> },
  { key: 'deadlift', label: 'Deadlift', unit: 'lbs', icon: <FitnessCenter /> },
  { key: 'fly10', label: '10 Yard Fly', unit: 'sec', icon: <Speed />, lower_is_better: true },
  { key: 'forty', label: '40 Yard Dash', unit: 'sec', icon: <Speed />, lower_is_better: true },
  { key: 'vertical', label: 'Vertical Jump', unit: 'in', icon: <TrendingUp /> },
]

const TIME_RANGES = [
  { key: '30d', label: 'Last 30 Days', days: 30 },
  { key: '3m', label: 'Last 3 Months', days: 90 },
  { key: '6m', label: 'Last 6 Months', days: 180 },
  { key: '1y', label: 'Last Year', days: 365 },
]

export function ProgressReport({ userId }) {
  const { data, currentUser } = useData()
  const [selectedMetric, setSelectedMetric] = useState('bench')
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState(0)

  const athleteId = userId || currentUser?.id

  // Get athlete data
  const athlete = useMemo(() => {
    return data.athletes?.find(a => a.id === athleteId)
  }, [data.athletes, athleteId])

  // Get workout logs for this athlete
  const workoutLogs = useMemo(() => {
    return (data.workoutLogs || [])
      .filter(log => log.athlete_id === athleteId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [data.workoutLogs, athleteId])

  // Get wellness checks for this athlete
  const wellnessChecks = useMemo(() => {
    return (data.wellnessChecks || [])
      .filter(check => check.athlete_id === athleteId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [data.wellnessChecks, athleteId])

  // Calculate progress analytics
  const progressAnalytics = useMemo(() => {
    const selectedRange = TIME_RANGES.find(r => r.key === timeRange)
    const startDate = subDays(new Date(), selectedRange.days)
    
    // Workout frequency and trends
    const recentLogs = workoutLogs.filter(log => new Date(log.date) >= startDate)
    const workoutFrequency = recentLogs.length
    
    // Performance trends for selected metric
    const metric = METRICS.find(m => m.key === selectedMetric)
    const performanceData = []
    
    // Simulate performance data from workout logs
    recentLogs.forEach(log => {
      if (log.performance_data) {
        Object.entries(log.performance_data).forEach(([key, performance]) => {
          if (performance.completed && performance.weight) {
            performanceData.push({
              date: log.date,
              value: performance.weight,
              reps: performance.reps
            })
          }
        })
      }
    })
    
    // Calculate PRs (Personal Records)
    const personalRecords = {}
    METRICS.forEach(m => {
      const values = performanceData
        .filter(p => new Date(p.date) >= startDate)
        .map(p => p.value)
        .filter(Boolean)
      
      if (values.length > 0) {
        personalRecords[m.key] = m.lower_is_better ? 
          Math.min(...values) : 
          Math.max(...values)
      }
    })

    // Wellness trends
    const recentWellness = wellnessChecks.filter(check => 
      new Date(check.created_at) >= startDate
    )
    
    const wellnessTrends = {}
    if (recentWellness.length > 0) {
      const categories = ['energy', 'sleep', 'nutrition', 'stress', 'soreness', 'motivation']
      categories.forEach(category => {
        const values = recentWellness
          .map(w => w.ratings?.[category])
          .filter(Boolean)
        
        if (values.length > 0) {
          wellnessTrends[category] = {
            current: values[0],
            average: values.reduce((a, b) => a + b, 0) / values.length,
            trend: values.length > 1 ? values[0] - values[values.length - 1] : 0
          }
        }
      })
    }

    return {
      workoutFrequency,
      performanceData,
      personalRecords,
      wellnessTrends,
      recentLogs: recentLogs.slice(0, 10),
      recentWellness: recentWellness.slice(0, 5)
    }
  }, [workoutLogs, wellnessChecks, selectedMetric, timeRange])

  // Chart data for performance trends
  const chartData = useMemo(() => {
    const selectedRange = TIME_RANGES.find(r => r.key === timeRange)
    const days = Array.from({ length: Math.min(30, selectedRange.days) }, (_, i) => {
      return format(subDays(new Date(), selectedRange.days - i - 1), 'MM/dd')
    })
    
    const values = days.map(date => {
      const logForDate = workoutLogs.find(log => format(new Date(log.date), 'MM/dd') === date)
      if (logForDate?.performance_data) {
        // Find best performance for the day
        const performances = Object.values(logForDate.performance_data)
          .filter(p => p.completed && p.weight)
          .map(p => p.weight)
        return performances.length > 0 ? Math.max(...performances) : null
      }
      return null
    })

    return {
      labels: days,
      datasets: [{
        label: METRICS.find(m => m.key === selectedMetric)?.label || selectedMetric,
        data: values,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.3,
        spanGaps: true
      }]
    }
  }, [workoutLogs, selectedMetric, timeRange])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true,
        text: `${METRICS.find(m => m.key === selectedMetric)?.label} Progress`
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }

  if (!athlete) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Athlete not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment color="primary" />
        Progress Report - {athlete.name}
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            {TIME_RANGES.map(range => (
              <MenuItem key={range.key} value={range.key}>{range.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Metric</InputLabel>
          <Select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            label="Metric"
          >
            {METRICS.map(metric => (
              <MenuItem key={metric.key} value={metric.key}>{metric.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Performance" />
          <Tab label="Wellness" />
          <Tab label="Activity Log" />
        </Tabs>
      </Box>

      {/* Performance Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Personal Records" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(progressAnalytics.personalRecords).map(([key, value]) => {
                    const metric = METRICS.find(m => m.key === key)
                    return (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {metric?.icon}
                          <Typography variant="body2">{metric?.label}</Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          {value} {metric?.unit}
                        </Typography>
                      </Box>
                    )
                  })}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FitnessCenter />
                      <Typography variant="body2">Workouts</Typography>
                    </Box>
                    <Typography variant="h6" color="primary">
                      {progressAnalytics.workoutFrequency}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Performance Trend" />
              <CardContent>
                <Line data={chartData} options={chartOptions} />
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Workouts */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Workouts" />
              <CardContent>
                {progressAnalytics.recentLogs.length === 0 ? (
                  <Typography color="text.secondary">No workout logs found</Typography>
                ) : (
                  <List>
                    {progressAnalytics.recentLogs.map(log => (
                      <ListItem key={log.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: log.completed ? 'success.main' : 'warning.main' }}>
                            <FitnessCenter />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${log.workout_name} - ${format(new Date(log.date), 'MMM dd, yyyy')}`}
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip 
                                  label={log.completed ? 'Completed' : 'Partial'} 
                                  size="small" 
                                  color={log.completed ? 'success' : 'warning'} 
                                />
                                <Chip 
                                  label={`${Math.floor(log.duration / 60)}m ${log.duration % 60}s`}
                                  size="small" 
                                  variant="outlined" 
                                />
                              </Box>
                              {log.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  {log.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Wellness Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Wellness Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Wellness Trends" />
              <CardContent>
                {Object.keys(progressAnalytics.wellnessTrends).length === 0 ? (
                  <Typography color="text.secondary">No wellness data available</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(progressAnalytics.wellnessTrends).map(([category, data]) => (
                      <Box key={category}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {category}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{data.current}/10</Typography>
                            {data.trend > 0 ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : data.trend < 0 ? (
                              <TrendingDown color="error" fontSize="small" />
                            ) : null}
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(data.current / 10) * 100} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Wellness Checks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Wellness Checks" />
              <CardContent>
                {progressAnalytics.recentWellness.length === 0 ? (
                  <Typography color="text.secondary">No wellness checks found</Typography>
                ) : (
                  <List dense>
                    {progressAnalytics.recentWellness.map(check => {
                      const overallScore = check.ratings ? 
                        Object.values(check.ratings).reduce((a, b) => a + b, 0) / Object.values(check.ratings).length : 5
                      const scoreColor = overallScore >= 7 ? 'success' : overallScore >= 5 ? 'warning' : 'error'
                      
                      return (
                        <ListItem key={check.id}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: `${scoreColor}.main`, width: 32, height: 32 }}>
                              {Math.round(overallScore)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={format(new Date(check.date), 'MMM dd, yyyy')}
                            secondary={check.comments || 'No comments'}
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

      {/* Activity Log Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Activity Timeline" />
              <CardContent>
                <List>
                  {/* Combine workouts and wellness checks */}
                  {[...progressAnalytics.recentLogs.map(log => ({ ...log, type: 'workout' })),
                    ...progressAnalytics.recentWellness.map(check => ({ ...check, type: 'wellness' }))]
                    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
                    .slice(0, 20)
                    .map((item, index) => (
                      <ListItem key={`${item.type}-${item.id}`} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: item.type === 'workout' ? 'primary.main' : 'secondary.main' }}>
                            {item.type === 'workout' ? <FitnessCenter /> : <Assessment />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            item.type === 'workout' ? 
                              `Workout: ${item.workout_name}` : 
                              'Wellness Check-in'
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(item.date || item.created_at), 'MMM dd, yyyy - h:mm a')}
                              </Typography>
                              {item.type === 'workout' && item.notes && (
                                <Typography variant="body2">{item.notes}</Typography>
                              )}
                              {item.type === 'wellness' && item.comments && (
                                <Typography variant="body2">{item.comments}</Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ProgressReport
