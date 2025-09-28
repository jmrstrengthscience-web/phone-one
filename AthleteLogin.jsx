import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Paper
} from '@mui/material'
import { useData } from '../lib/MultiTenantDataContext'

export default function AthleteLogin() {
  const { signIn, loading } = useData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // In demo mode, create athlete session
      await signIn(email, password, 'athlete')
      console.log('Athlete login successful')
    } catch (err) {
      console.error('Athlete login error:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #071029 0%, #1a1a2e 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', bgcolor: '#1e1e1e' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
              PHORCE ONE
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#bbb' }}>
              Athlete Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                style: { color: '#fff' }
              }}
              InputLabelProps={{
                style: { color: '#bbb' }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                style: { color: '#fff' }
              }}
              InputLabelProps={{
                style: { color: '#bbb' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 2,
                bgcolor: '#ff6b35',
                '&:hover': { bgcolor: '#e55a2b' },
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Need help? Contact your coach
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}