import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeaderWrapper as CardHeader, CardContentWrapper as CardContent, Card as MUICard } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Label } from '../ui/label'
import { Dumbbell, Trophy } from 'lucide-react'
import { useData } from '../lib/DataContext'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function AuthPage({ onLogin: onLoginProp, isLoading = false }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('') // '' until selected
  const { login } = useData()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && password && role) {
      const user = login(email, password, role)
      if (onLoginProp) onLoginProp(user.email, password, role)
      // redirect based on role
      if (role === 'coach') navigate('/coach')
      else navigate('/athlete')
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(45deg, rgba(0,230,168,0.03), rgba(255,45,149,0.06))' }}>
      <MUICard style={{ width: '100%', maxWidth: 520 }}>
        <CardHeader title={<Box style={{ textAlign: 'center' }}><img src="/logo.png" alt="logo" style={{ width: 72, height: 72 }} /><Typography variant="h6">Phorce</Typography><Typography variant="caption">Sign in to access your training platform</Typography></Box>} />
        <CardContent>
          {!role && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Select your role:</Typography>
              <Button variant="contained" color="primary" onClick={() => setRole('coach')} sx={{ width: '100%' }}><Trophy style={{ marginRight: 8 }} /> Coach</Button>
              <Button variant="contained" color="secondary" onClick={() => setRole('athlete')} sx={{ width: '100%' }}><Dumbbell style={{ marginRight: 8 }} /> Athlete</Button>
            </Box>
          )}
          {role && (
            <form onSubmit={handleSubmit}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Sign in as <b>{role.charAt(0).toUpperCase() + role.slice(1)}</b></Typography>
              <div style={{ marginBottom: 12 }}>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder={role === 'coach' ? 'coach@example.com' : 'athlete@example.com'} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" style={{ width: '100%' }}>{isLoading ? 'Signing in...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</Button>
              <Button variant="text" color="inherit" onClick={() => setRole('')} sx={{ mt: 1, width: '100%' }}>Back</Button>
            </form>
          )}
        </CardContent>
      </MUICard>
    </div>
  )
}
