import React, { useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useData } from '../lib/MultiTenantDataContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import SupabaseDebug from '../components/SupabaseDebug'

export default function AuthFlow() {
  const { signIn, signUp, loading } = useData()
  const [userType, setUserType] = useState(null) // null | 'coach' | 'athlete'
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    organizationSlug: ''
  })
  const [errors, setErrors] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugMessages, setDebugMessages] = useState([])

  const addDebugMessage = (msg) => {
    const timestamp = new Date().toLocaleTimeString()
    const message = `${timestamp}: ${msg}`
    setDebugMessages(prev => [...prev.slice(-4), message]) // Keep last 5 messages
    console.log(message)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors) setErrors('')
  }

  const validateForm = () => {
    addDebugMessage('Starting form validation...')
    
    if (!formData.email || !formData.password) {
      addDebugMessage('Validation failed: missing email or password')
      setErrors('Email and password are required')
      return false
    }

    if (mode === 'signup' && userType === 'athlete') {
      addDebugMessage('Validation failed: athletes cannot sign up')
      setErrors('Athletes cannot create organizations. Please contact your coach.')
      return false
    }

    if (mode === 'signup' && userType === 'coach' && (!formData.organizationName || !formData.organizationSlug)) {
      addDebugMessage('Validation failed: missing organization info')
      setErrors('Organization name and slug are required')
      return false
    }

    if (formData.password.length < 6) {
      addDebugMessage('Validation failed: password too short')
      setErrors('Password must be at least 6 characters')
      return false
    }

    addDebugMessage('Form validation passed!')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    addDebugMessage('Form submission started!')
    
    console.log('Form submitted with data:', formData)
    addDebugMessage(`Form data: email=${formData.email}, password=${formData.password ? '[SET]' : '[EMPTY]'}`)
    
    if (!validateForm()) {
      addDebugMessage('Form validation failed - stopping here')
      console.log('Form validation failed')
      return
    }

    addDebugMessage('Validation passed, starting authentication...')
    setIsLoading(true)
    setErrors('')

    try {
      console.log('Attempting authentication...', mode)
      addDebugMessage(`Starting ${mode}...`)
      if (mode === 'signin') {
        console.log('Signing in...')
        addDebugMessage('Calling signIn function...')
        const result = await signIn(formData.email, formData.password, userType || 'coach')
        addDebugMessage('SignIn completed successfully')
        console.log('SignIn completed:', result)
      } else {
        console.log('Signing up with org data:', {
          name: formData.organizationName,
          slug: formData.organizationSlug
        })
        addDebugMessage('Calling signUp function...')
        const result = await signUp(formData.email, formData.password, {
          name: formData.organizationName,
          slug: formData.organizationSlug
        })
        addDebugMessage('SignUp completed successfully')
        console.log('SignUp completed:', result)
      }
      console.log('Authentication successful!')
      addDebugMessage('Authentication process complete!')
      // Give a moment for the context to update before clearing loading
      setTimeout(() => {
        addDebugMessage('Clearing loading state...')
        setIsLoading(false)
      }, 100)
    } catch (error) {
      console.error('Auth error:', error)
      addDebugMessage(`Error: ${error.message}`)
      setErrors(error.message || 'Authentication failed. Please try again.')
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setErrors('')
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Show configuration message if Supabase is not set up
  if (!isSupabaseConfigured) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0d1117',
          backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
          px: 2
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            bgcolor: '#21262d',
            border: '1px solid #30363d'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#f0f6fc',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Phorce1
            </Typography>
            
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                bgcolor: '#f59e0b',
                color: '#000',
                '& .MuiAlert-icon': {
                  color: '#000'
                }
              }}
            >
              Database not configured
            </Alert>
            
            <Typography sx={{ color: '#8b949e', mb: 3 }}>
              To get started, you need to set up your Supabase backend:
            </Typography>
            
            <Box sx={{ textAlign: 'left', color: '#f0f6fc' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Setup Steps:</Typography>
              <Typography component="div" sx={{ mb: 1 }}>1. Create a Supabase project at supabase.com</Typography>
              <Typography component="div" sx={{ mb: 1 }}>2. Copy your project URL and anon key</Typography>
              <Typography component="div" sx={{ mb: 1 }}>3. Update .env.local with your credentials</Typography>
              <Typography component="div" sx={{ mb: 1 }}>4. Run the database-schema.sql in your Supabase SQL editor</Typography>
              <Typography component="div" sx={{ mb: 3 }}>5. Restart the development server</Typography>
              
              <Typography variant="body2" sx={{ color: '#58a6ff' }}>
                See SUPABASE_SETUP.md for detailed instructions
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    )
  }

  // User type selection screen
  if (!userType) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0d1117',
          backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
          px: 2
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            bgcolor: '#21262d',
            border: '1px solid #30363d'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#f0f6fc',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Phorce1
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#8b949e',
                mb: 4
              }}
            >
              Choose Your Portal
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper
              onClick={() => setUserType('coach')}
              sx={{
                p: 3,
                bgcolor: '#0d1117',
                border: '2px solid #30363d',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#58a6ff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(88, 166, 255, 0.15)'
                }
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#f0f6fc',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                🏃‍♂️ Coach Portal
              </Typography>
              <Typography sx={{ color: '#8b949e' }}>
                Full access to athlete management, workout creation, team organization, and performance analytics
              </Typography>
            </Paper>

            <Paper
              onClick={() => {
                setUserType('athlete')
                setMode('signin') // Athletes can only sign in
              }}
              sx={{
                p: 3,
                bgcolor: '#0d1117',
                border: '2px solid #30363d',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#f85149',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(248, 81, 73, 0.15)'
                }
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#f0f6fc',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                💪 Athlete Portal
              </Typography>
              <Typography sx={{ color: '#8b949e' }}>
                View assigned workouts, complete wellness check-ins, and track your training progress
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#8b949e' }}>
              Select your portal to continue
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0d1117',
        backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        px: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          bgcolor: '#21262d',
          border: '1px solid #30363d'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#f0f6fc',
              fontWeight: 'bold',
              mb: 1
            }}
          >
            Phorce1
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#8b949e',
              mb: 1
            }}
          >
            {userType === 'athlete' ? '💪 Athlete Portal' : '🏃‍♂️ Coach Portal'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#58a6ff',
              mb: 2
            }}
          >
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Organization'}
          </Typography>
        </Box>

        {errors && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: '#da3633',
              color: '#f85149',
              '& .MuiAlert-icon': {
                color: '#f85149'
              }
            }}
          >
            {errors}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0d1117',
                color: '#f0f6fc',
                '& fieldset': { borderColor: '#30363d' },
                '&:hover fieldset': { borderColor: '#58a6ff' },
                '&.Mui-focused fieldset': { borderColor: '#58a6ff' }
              },
              '& .MuiInputLabel-root': { color: '#8b949e' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#58a6ff' }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0d1117',
                color: '#f0f6fc',
                '& fieldset': { borderColor: '#30363d' },
                '&:hover fieldset': { borderColor: '#58a6ff' },
                '&.Mui-focused fieldset': { borderColor: '#58a6ff' }
              },
              '& .MuiInputLabel-root': { color: '#8b949e' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#58a6ff' }
            }}
          />

          {mode === 'signup' && userType === 'coach' && (
            <>
              <TextField
                fullWidth
                label="Organization Name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="e.g. Elite Athletics"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0d1117',
                    color: '#f0f6fc',
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#58a6ff' },
                    '&.Mui-focused fieldset': { borderColor: '#58a6ff' }
                  },
                  '& .MuiInputLabel-root': { color: '#8b949e' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#58a6ff' }
                }}
              />

              <TextField
                fullWidth
                label="Organization Slug"
                name="organizationSlug"
                value={formData.organizationSlug}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="e.g. elite-athletics"
                helperText="This will be part of your organization URL"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0d1117',
                    color: '#f0f6fc',
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#58a6ff' },
                    '&.Mui-focused fieldset': { borderColor: '#58a6ff' }
                  },
                  '& .MuiInputLabel-root': { color: '#8b949e' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#58a6ff' },
                  '& .MuiFormHelperText-root': { color: '#8b949e' }
                }}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: '#238636',
              '&:hover': { bgcolor: '#2ea043' },
              '&:disabled': { bgcolor: '#21262d', color: '#8b949e' }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : userType === 'athlete' ? (
              'Sign In to Athlete Portal'
            ) : mode === 'signin' ? (
              'Sign In to Coach Portal'
            ) : (
              'Create Organization'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              onClick={() => setUserType(null)}
              sx={{ 
                color: '#8b949e',
                textTransform: 'none',
                fontSize: '0.9rem',
                mb: 1,
                '&:hover': { bgcolor: 'rgba(139, 148, 158, 0.1)' }
              }}
            >
              ← Back to portal selection
            </Button>
            
            {userType === 'coach' && (
              <Button
                onClick={switchMode}
                sx={{ 
                  color: '#58a6ff',
                  textTransform: 'none',
                  display: 'block',
                  mx: 'auto',
                  '&:hover': { bgcolor: 'rgba(88, 166, 255, 0.1)' }
                }}
              >
                {mode === 'signin' 
                  ? "Don't have an account? Create one" 
                  : 'Already have an account? Sign in'
                }
              </Button>
            )}
            
            {userType === 'athlete' && (
              <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
                Need an account? Contact your coach
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Debug Messages Panel - Only in development */}
      {debugMessages.length > 0 && import.meta.env.DEV && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: '#1a1a1a', border: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>Debug Messages:</Typography>
          {debugMessages.map((msg, index) => (
            <Typography key={index} sx={{ color: '#00ff00', fontSize: '0.8rem', fontFamily: 'Eurostile Bold Extended, Orbitron, Consolas, monospace' }}>
              {msg}
            </Typography>
          ))}
        </Paper>
      )}

      {/* Debug Panel - Only in development */}
      {import.meta.env.DEV && <SupabaseDebug />}
    </Box>
  )
}