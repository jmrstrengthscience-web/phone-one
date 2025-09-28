import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'
import { supabase, db, auth, isSupabaseConfigured } from './supabaseClient'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Data state - matching original Phorce 1 structure
  const [data, setData] = useState({
    teams: [],
    athletes: [],
    workouts: [],
    exercises: [],
    wellnessChecks: [],
    injuryReports: [],
    workoutLogs: []
  })

  // For backward compatibility - expose currentUser
  const currentUser = profile ? {
    id: profile.id,
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    email: profile.email,
    role: profile.role,
    ...profile
  } : null

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // If Supabase is not configured, skip auth initialization
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, setting loading to false')
      setLoading(false)
      return
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Loading timeout reached, forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        const { data: { session } } = await auth.getSession()
        console.log('Got session:', session?.user?.email)
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            console.log('No user session found')
          }
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        if (mounted) {
          console.log('Auth initialization complete')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          console.log('Loading user profile after auth change...')
          await loadUserProfile(session.user.id)
          console.log('Profile loading completed')
        } catch (error) {
          console.error('Error loading profile after auth change:', error)
        }
      } else {
        console.log('No user, clearing profile and org data')
        setProfile(null)
        setOrganization(null)
        setData({
          teams: [],
          athletes: [],
          workouts: [],
          exercises: [],
          wellnessChecks: [],
          injuryReports: [],
          workoutLogs: []
        })
      }
      console.log('Setting loading to false after auth change')
      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile and organization
  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading profile for user:', userId)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (*)
        `)
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        // If profile doesn't exist, that's ok - they need to create an organization
        setProfile(null)
        setOrganization(null)
        return
      }

      console.log('Profile loaded:', profileData)
      setProfile(profileData)
      setOrganization(profileData.organizations)
      
      // Load organization data only if we have an organization
      if (profileData.organization_id && profileData.organizations) {
        await loadOrganizationData(profileData.organization_id)
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      setProfile(null)
      setOrganization(null)
    }
  }

  // Load sample data for demo mode
  const loadSampleData = async () => {
    console.log('🟡 Loading sample demo data...')
    
    const sampleData = {
      teams: [
        {
          id: 'team-1',
          name: 'Varsity Football',
          description: 'Main varsity football team',
          sport: 'Football',
          season: 'Fall 2025',
          color: '#ff6b35',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'team-2', 
          name: 'JV Basketball',
          description: 'Junior varsity basketball',
          sport: 'Basketball',
          season: 'Winter 2025',
          color: '#1e88e5',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      athletes: [
        {
          id: 'athlete-1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@demo.com',
          position: 'Quarterback',
          jersey_number: 12,
          height: "6'2\"",
          weight: 195,
          grade: 12,
          is_active: true
        },
        {
          id: 'athlete-2',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@demo.com',
          position: 'Point Guard',
          jersey_number: 23,
          height: "5'7\"",
          weight: 140,
          grade: 11,
          is_active: true
        },
        {
          id: 'athlete-3',
          first_name: 'Mike',
          last_name: 'Davis',
          email: 'mike.davis@demo.com',
          position: 'Running Back',
          jersey_number: 21,
          height: "5'10\"",
          weight: 180,
          grade: 12,
          is_active: true
        }
      ],
      workouts: [
        {
          id: 'workout-1',
          title: 'Strength Training - Upper Body',
          description: 'Focus on chest, shoulders, and arms',
          workout_type: 'Strength',
          date: new Date().toISOString().split('T')[0],
          estimated_duration: 60,
          difficulty_level: 3,
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 8, weight: '185 lbs' },
            { name: 'Pull-ups', sets: 3, reps: 10 },
            { name: 'Shoulder Press', sets: 3, reps: 12, weight: '135 lbs' }
          ],
          is_template: true,
          status: 'published'
        },
        {
          id: 'workout-2',
          title: 'Cardio Conditioning',
          description: 'High intensity interval training',
          workout_type: 'Cardio',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          estimated_duration: 45,
          difficulty_level: 4,
          exercises: [
            { name: 'Sprint Intervals', duration: '30 sec', rest: '30 sec', rounds: 8 },
            { name: 'Burpees', sets: 3, reps: 15 },
            { name: 'Mountain Climbers', sets: 3, reps: 20 }
          ],
          is_template: true,
          status: 'published'
        }
      ],
      exercises: [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          description: 'Chest strengthening exercise',
          category: 'Strength',
          muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
          equipment: ['Barbell', 'Bench'],
          difficulty_level: 3,
          is_public: true
        },
        {
          id: 'exercise-2',
          name: 'Squats',
          description: 'Lower body compound movement',
          category: 'Strength',
          muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
          equipment: ['Barbell', 'Squat Rack'],
          difficulty_level: 3,
          is_public: true
        }
      ],
      wellnessChecks: [
        {
          id: 'wellness-1',
          athlete_id: 'athlete-1',
          date: new Date().toISOString().split('T')[0],
          sleep_hours: 8,
          energy_level: 8,
          soreness_level: 2,
          stress_level: 3,
          hydration_level: 9,
          nutrition_quality: 7,
          motivation_level: 9
        }
      ],
      injuryReports: [],
      workoutLogs: [
        {
          id: 'log-1',
          athlete_id: 'athlete-1',
          workout_id: 'workout-1',
          date: new Date().toISOString().split('T')[0],
          completed: true,
          duration_minutes: 55,
          notes: 'Great session, felt strong on bench press'
        }
      ]
    }
    
    setData(sampleData)
    console.log('🟢 Sample data loaded successfully!')
  }

  // Load all organization data
  const loadOrganizationData = async (organizationId) => {
    try {
      console.log('Loading organization data for:', organizationId)
      
      // Try to load data, but handle missing tables gracefully
      const results = await Promise.allSettled([
        supabase.from('teams').select('*').eq('organization_id', organizationId),
        supabase.from('profiles').select('*').eq('organization_id', organizationId).eq('role', 'athlete'),
        supabase.from('workouts').select('*').eq('organization_id', organizationId),
        supabase.from('exercises').select('*').eq('organization_id', organizationId),
        supabase.from('wellness_checks').select('*').eq('organization_id', organizationId),
        supabase.from('injury_reports').select('*').eq('organization_id', organizationId),
        supabase.from('workout_logs').select('*').eq('organization_id', organizationId)
      ])
      
      const [teams, athletes, workouts, exercises, wellnessChecks, injuryReports, workoutLogs] = results

      setData({
        teams: teams.status === 'fulfilled' ? teams.value.data || [] : [],
        athletes: athletes.status === 'fulfilled' ? athletes.value.data || [] : [],
        workouts: workouts.status === 'fulfilled' ? workouts.value.data || [] : [],
        exercises: exercises.status === 'fulfilled' ? exercises.value.data || [] : [],
        wellnessChecks: wellnessChecks.status === 'fulfilled' ? wellnessChecks.value.data || [] : [],
        injuryReports: injuryReports.status === 'fulfilled' ? injuryReports.value.data || [] : [],
        workoutLogs: workoutLogs.status === 'fulfilled' ? workoutLogs.value.data || [] : []
      })
      
      console.log('Organization data loaded successfully')
    } catch (error) {
      console.error('Error loading organization data:', error)
      // Set empty data on error
      setData({
        teams: [],
        athletes: [],
        workouts: [],
        exercises: [],
        wellnessChecks: [],
        injuryReports: [],
        workoutLogs: []
      })
    }
  }

  // Auth methods
  const signUp = async (email, password, orgData) => {
    console.log('signUp called with:', { email, orgData })
    
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured')
      throw new Error('Database not configured. Please set up Supabase first.')
    }

    try {
      console.log('Starting Supabase signup...')
      // Sign up user
      const { data: authData, error: authError } = await auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email redirect for now
          data: {
            first_name: orgData.name.split(' ')[0], // Simple extraction
            last_name: orgData.name.split(' ').slice(1).join(' '),
          }
        }
      })

      console.log('Supabase signup response:', { authData, authError })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      // Try to create organization and profile via database function
      if (authData.user) {
        console.log('Creating organization for user:', authData.user.id)
        try {
          const functionParams = {
            org_name: orgData.name,
            org_slug: orgData.slug,
            user_email: email,
            user_first_name: orgData.name.split(' ')[0],
            user_last_name: orgData.name.split(' ').slice(1).join(' ')
          }
          
          console.log('Calling create_organization_and_user with:', functionParams)
          
          const { data: functionResult, error: orgError } = await supabase.rpc('create_organization_and_user', functionParams)
          
          console.log('Function result:', { functionResult, orgError })

          if (orgError) {
            console.error('Database function error:', orgError)
            throw new Error('Database schema not deployed. Please run database-schema.sql and database-functions.sql in your Supabase SQL Editor first.')
          }
        } catch (dbError) {
          console.error('Database setup required:', dbError)
          throw new Error('Database not set up. Please deploy the SQL schema to your Supabase project first. See DEPLOYMENT_GUIDE.md for instructions.')
        }
      }

      console.log('Signup completed successfully')
      return authData
    } catch (error) {
      console.error('Error in signUp:', error)
      throw error
    }
  }

  const signIn = async (email, password, role = 'coach') => {
    console.log('🔵 signIn called with email:', email, 'role:', role)
    
    // TEMPORARY BYPASS MODE - Set to false once Supabase is working
    const useBypassMode = true
    
    if (useBypassMode) {
      console.log('🟡 Using DEMO MODE - creating mock user session for role:', role)
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create mock user data based on role
      const mockUser = {
        id: role === 'athlete' ? 'demo-athlete-123' : 'demo-user-123',
        email: email,
        created_at: new Date().toISOString()
      }
      
      const mockProfile = {
        id: role === 'athlete' ? 'demo-athlete-123' : 'demo-user-123',
        email: email,
        first_name: role === 'athlete' ? 'Demo' : 'Demo',
        last_name: role === 'athlete' ? 'Athlete' : 'Coach',
        role: role,
        organization_id: 'demo-org-123',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const mockOrganization = {
        id: 'demo-org-123',
        name: 'Phorce Demo Athletics',
        slug: 'phorce-demo',
        plan: 'pro',
        max_athletes: 100,
        max_coaches: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Set the mock data
      setUser(mockUser)
      setProfile({ ...mockProfile, organizations: mockOrganization })
      setOrganization(mockOrganization)
      setLoading(false)
      
      // Load demo data
      await loadSampleData()
      
      console.log('🟢 Demo mode login successful for role:', role)
      return { user: mockUser, session: { user: mockUser } }
    }
    
    console.log('🔵 isSupabaseConfigured:', isSupabaseConfigured)
    console.log('🔵 auth object:', auth)
    console.log('🔵 supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    
    if (!isSupabaseConfigured) {
      console.error('🔴 Supabase not configured')
      throw new Error('Database not configured. Please set up Supabase first.')
    }

    try {
      // First, test if we can make a simple query to verify connectivity
      console.log('🔵 Testing Supabase connectivity...')
      try {
        const connectivityTest = await Promise.race([
          supabase.from('profiles').select('count').limit(0),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connectivity test timed out')), 5000)
          )
        ])
        console.log('🟢 Supabase connectivity test passed')
      } catch (connectError) {
        console.log('� Supabase connectivity test failed, but continuing with auth...', connectError.message)
      }

      console.log('�🔵 About to call auth.signInWithPassword...')
      console.log('🔵 Auth method exists:', typeof auth.signInWithPassword)
      
      // Add a timeout to prevent infinite hanging
      const signInPromise = Promise.race([
        auth.signInWithPassword({
          email,
          password
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SignIn request timed out after 15 seconds')), 15000)
        )
      ])
      
      console.log('🔵 Promise created with timeout, awaiting response...')
      const { data, error } = await signInPromise

      console.log('🔵 Got response from auth.signInWithPassword:', { data: !!data, error: !!error })
      
      if (data) {
        console.log('🔵 Data user ID:', data.user?.id)
        console.log('🔵 Data session exists:', !!data.session)
      }
      
      if (error) {
        console.log('🔵 Full error object:', error)
      }

      if (error) {
        console.error('🔴 Signin error:', error)
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.')
        }
        throw error
      }

      console.log('🟢 Signin successful! Returning data...')
      return data
    } catch (error) {
      console.error('🔴 Error in signIn function:', error)
      console.error('🔴 Error type:', typeof error)
      console.error('🔴 Error message:', error.message)
      console.error('🔴 Error stack:', error.stack)
      throw error
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return // No-op if not configured
    }

    try {
      const { error } = await auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error in signOut:', error)
      throw error
    }
  }

  // CRUD methods
  const addOrUpdateTeam = async (team) => {
    if (!organization?.id || !user?.id) throw new Error('No organization or user')

    try {
      const teamData = {
        ...team,
        organization_id: organization.id,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }

      if (team.id) {
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', team.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([{ ...teamData, id: uuidv4(), created_at: new Date().toISOString() }])
        if (error) throw error
      }

      await reloadData()
    } catch (error) {
      console.error('Error in addOrUpdateTeam:', error)
      throw error
    }
  }

  const deleteTeam = async (id) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error in deleteTeam:', error)
      throw error
    }
  }

  const addOrUpdateAthlete = async (athlete) => {
    if (!organization?.id) throw new Error('No organization')

    try {
      const athleteData = {
        ...athlete,
        organization_id: organization.id,
        role: 'athlete',
        updated_at: new Date().toISOString()
      }

      if (athlete.id) {
        const { error } = await supabase
          .from('profiles')
          .update(athleteData)
          .eq('id', athlete.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...athleteData, id: uuidv4(), created_at: new Date().toISOString() }])
        if (error) throw error
      }

      await reloadData()
    } catch (error) {
      console.error('Error in addOrUpdateAthlete:', error)
      throw error
    }
  }

  const deleteAthlete = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error in deleteAthlete:', error)
      throw error
    }
  }

  const addOrUpdateWorkout = async (workout) => {
    if (!organization?.id || !user?.id) throw new Error('No organization or user')

    try {
      const workoutData = {
        ...workout,
        organization_id: organization.id,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }

      if (workout.id) {
        const { error } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', workout.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('workouts')
          .insert([{ ...workoutData, id: uuidv4(), created_at: new Date().toISOString() }])
        if (error) throw error
      }

      console.log('Workout saved successfully:', workout.title)
      await reloadData()
    } catch (error) {
      console.error('Error in addOrUpdateWorkout:', error)
      throw error
    }
  }

  const deleteWorkout = async (id) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
      if (error) throw error
      console.log('Workout deleted:', id)
      await reloadData()
    } catch (error) {
      console.error('Error in deleteWorkout:', error)
      throw error
    }
  }

  const addOrUpdateExercise = async (exercise) => {
    if (!organization?.id || !user?.id) throw new Error('No organization or user')

    try {
      const exerciseData = {
        ...exercise,
        organization_id: organization.id,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }

      if (exercise.id) {
        const { error } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', exercise.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert([{ ...exerciseData, id: uuidv4(), created_at: new Date().toISOString() }])
        if (error) throw error
      }

      await reloadData()
    } catch (error) {
      console.error('Error in addOrUpdateExercise:', error)
      throw error
    }
  }

  const deleteExercise = async (id) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error in deleteExercise:', error)
      throw error
    }
  }

  // Backward compatibility methods for original Phorce 1 API
  const addWellnessCheck = async (check) => {
    if (!isSupabaseConfigured || !organization?.id) {
      console.warn('Wellness check not saved - database not configured')
      return
    }

    try {
      const checkData = {
        id: uuidv4(),
        organization_id: organization.id,
        athlete_id: check.athleteId || user?.id,
        date: check.date || new Date().toISOString().split('T')[0],
        sleep_hours: check.sleepHours || 8,
        energy_level: check.energyLevel || 5,
        soreness_level: check.sorenessLevel || 1,
        stress_level: check.stressLevel || 1,
        hydration_level: check.hydrationLevel || 5,
        nutrition_quality: check.nutritionQuality || 5,
        motivation_level: check.motivationLevel || 5,
        notes: check.notes || '',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('wellness_checks')
        .insert([checkData])

      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error adding wellness check:', error)
      throw error
    }
  }

  const addInjuryReport = async (report) => {
    if (!isSupabaseConfigured || !organization?.id) {
      console.warn('Injury report not saved - database not configured')
      return
    }

    try {
      const reportData = {
        id: uuidv4(),
        organization_id: organization.id,
        athlete_id: report.athleteId || user?.id,
        injury_type: report.injuryType || 'Other',
        body_part: report.bodyPart || '',
        severity: report.severity || 'Minor',
        description: report.description || '',
        date_occurred: report.dateOccurred || new Date().toISOString().split('T')[0],
        treatment_plan: report.treatmentPlan || '',
        estimated_recovery: report.estimatedRecovery,
        status: 'Active',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('injury_reports')
        .insert([reportData])

      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error adding injury report:', error)
      throw error
    }
  }

  const addWorkoutLog = async (log) => {
    if (!isSupabaseConfigured || !organization?.id) {
      console.warn('Workout log not saved - database not configured')
      return
    }

    try {
      const logData = {
        id: uuidv4(),
        organization_id: organization.id,
        athlete_id: log.athleteId || user?.id,
        workout_id: log.workoutId,
        date: log.date || new Date().toISOString().split('T')[0],
        exercises: log.exercises || [],
        duration_minutes: log.durationMinutes || 0,
        notes: log.notes || '',
        completed: log.completed || false,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('workout_logs')
        .insert([logData])

      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error adding workout log:', error)
      throw error
    }
  }

  // Authentication compatibility
  const login = async (userData) => {
    // For backward compatibility - not used in new flow
    console.log('Login called with:', userData)
  }

  const logout = async () => {
    await signOut()
  }

  // Clipboard operations (keeping local for now)
  const setClipboard = (data) => {
    try {
      localStorage.setItem('phorce-clipboard', JSON.stringify(data))
    } catch (error) {
      console.error('Error setting clipboard:', error)
    }
  }

  const getClipboard = () => {
    try {
      const data = localStorage.getItem('phorce-clipboard')
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting clipboard:', error)
      return null
    }
  }

  const clearClipboard = () => {
    try {
      localStorage.removeItem('phorce-clipboard')
    } catch (error) {
      console.error('Error clearing clipboard:', error)
    }
  }

  // Utility methods
  const reloadData = useCallback(async () => {
    if (organization?.id) {
      await loadOrganizationData(organization.id)
    }
  }, [organization?.id])

  const inviteAthlete = async (email, teamIds = []) => {
    if (!organization?.id) throw new Error('No organization')

    try {
      // This would typically send an invitation email
      // For now, we'll create a placeholder profile
      const athleteData = {
        id: uuidv4(),
        organization_id: organization.id,
        email,
        role: 'athlete',
        is_active: false, // Until they accept invitation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { invited: true, team_ids: teamIds }
      }

      const { error } = await supabase
        .from('profiles')
        .insert([athleteData])
      
      if (error) throw error
      
      console.log('Athlete invitation sent to:', email)
      await reloadData()
    } catch (error) {
      console.error('Error in inviteAthlete:', error)
      throw error
    }
  }

  const value = {
    // Original Phorce 1 API compatibility
    ...data, // teams, athletes, workouts, exercises, wellnessChecks, injuryReports, workoutLogs
    data, // Also provide the data object directly for components that expect it
    loading,
    currentUser,

    // Auth state (new)
    user,
    profile,
    organization,

    // Auth methods
    signUp,
    signIn,
    signOut,
    login,
    logout,

    // CRUD methods (Supabase backend)
    addOrUpdateTeam,
    deleteTeam,
    addOrUpdateAthlete,
    deleteAthlete,
    addOrUpdateWorkout,
    deleteWorkout,
    addOrUpdateExercise,
    deleteExercise,

    // Original Phorce 1 methods
    addWellnessCheck,
    addInjuryReport,
    addWorkoutLog,

    // Clipboard operations
    setClipboard,
    getClipboard,
    clearClipboard,

    // Utility methods
    reloadData,
    inviteAthlete
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    // Return a safe default object instead of throwing an error
    console.warn('useData called outside of DataProvider, returning safe defaults')
    return {
      loading: true,
      data: {
        teams: [],
        athletes: [],
        workouts: [],
        exercises: [],
        wellnessChecks: [],
        injuryReports: [],
        workoutLogs: []
      },
      teams: [],
      athletes: [],
      workouts: [],
      exercises: [],
      wellnessChecks: [],
      injuryReports: [],
      workoutLogs: [],
      user: null,
      profile: null,
      organization: null,
      currentUser: null,
      signIn: async () => { throw new Error('DataProvider not found') },
      signUp: async () => { throw new Error('DataProvider not found') },
      signOut: async () => { throw new Error('DataProvider not found') },
      addWellnessCheck: async () => { throw new Error('DataProvider not found') },
      addInjuryReport: async () => { throw new Error('DataProvider not found') },
      addWorkoutLog: async () => { throw new Error('DataProvider not found') },
      addOrUpdateTeam: async () => { throw new Error('DataProvider not found') },
      deleteTeam: async () => { throw new Error('DataProvider not found') },
      addOrUpdateAthlete: async () => { throw new Error('DataProvider not found') },
      deleteAthlete: async () => { throw new Error('DataProvider not found') },
      addOrUpdateWorkout: async () => { throw new Error('DataProvider not found') },
      deleteWorkout: async () => { throw new Error('DataProvider not found') },
      addOrUpdateExercise: async () => { throw new Error('DataProvider not found') },
      deleteExercise: async () => { throw new Error('DataProvider not found') },
      setClipboard: () => {},
      getClipboard: () => null,
      clearClipboard: () => {},
      reloadData: async () => {},
      inviteAthlete: async () => { throw new Error('DataProvider not found') },
      login: async () => { throw new Error('DataProvider not found') },
      logout: async () => { throw new Error('DataProvider not found') }
    }
  }
  return context
}

export default DataContext