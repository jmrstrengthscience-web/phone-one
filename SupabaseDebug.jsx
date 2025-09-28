import React, { useState } from 'react'
import { Box, Button, Typography, Alert } from '@mui/material'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const checkUsers = async () => {
    setLoading(true)
    try {
      // Check current session
      const { data: session } = await supabase.auth.getSession()
      
      // Check organizations table
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
      
      // Check profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      const info = {
        currentSession: session?.session?.user || 'No session',
        organizations: orgsError ? `Error: ${orgsError.message}` : orgs?.length || 0,
        profiles: profilesError ? `Error: ${profilesError.message}` : profiles?.length || 0,
        organizationsData: orgs,
        profilesData: profiles
      }

      setDebugInfo(JSON.stringify(info, null, 2))
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testFunction = async () => {
    setLoading(true)
    try {
      // Test if the function exists
      const { data, error } = await supabase.rpc('create_organization_and_user', {
        org_name: 'Test Org',
        org_slug: 'test-org-debug',
        user_email: 'test@example.com',
        user_first_name: 'Test',
        user_last_name: 'User'
      })

      setDebugInfo(`Function test result: ${JSON.stringify({ data, error }, null, 2)}`)
    } catch (error) {
      setDebugInfo(`Function test error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Supabase Debug Panel</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button onClick={checkUsers} disabled={loading} variant="outlined">
          Check Database
        </Button>
        <Button onClick={testFunction} disabled={loading} variant="outlined">
          Test Function
        </Button>
      </Box>

      {debugInfo && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography component="pre" sx={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {debugInfo}
          </Typography>
        </Alert>
      )}
    </Box>
  )
}