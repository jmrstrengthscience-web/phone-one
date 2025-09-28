import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'

// Clipboard helpers remain local
import {
  setClipboard as setClipboardStorage,
  getClipboard as getClipboardStorage,
  clearClipboard as clearClipboardStorage,
} from './storage'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState({ 
    teams: [], 
    athletes: [], 
    workouts: [], 
    exercises: [], 
    wellnessChecks: [], 
    injuryReports: [], 
    workoutLogs: [] 
  })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Load all data (using local storage with sample data - Supabase disabled for demo)
  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        console.log('Loading demo data from localStorage - Supabase integration disabled')
        
        // Use local data only for demo purposes
        let teams = []
        let athletes = []
        let workouts = []
        let exercises = []
        let wellnessChecks = []
        let injuryReports = []
        let workoutLogs = []
        
        setData({
          teams: teams || [],
          athletes: athletes || [],
          workouts: workouts || [],
          exercises,
          wellnessChecks,
          injuryReports,
          workoutLogs,
        })
      } catch (error) {
        console.error('Error fetching data from Supabase:', error)
        // Set realistic sample data for demonstration when Supabase is not available
        const sampleData = {
          teams: [
            { id: 'team1', name: 'Varsity Football', coachId: 'coach1', sport: 'Football', season: 'Fall 2025' },
            { id: 'team2', name: 'JV Football', coachId: 'coach1', sport: 'Football', season: 'Fall 2025' },
            { id: 'team3', name: 'Varsity Basketball', coachId: 'coach1', sport: 'Basketball', season: 'Winter 2025-26' },
            { id: 'team4', name: 'Track & Field', coachId: 'coach2', sport: 'Track', season: 'Spring 2026' }
          ],
          athletes: [
            { 
              id: 'athlete1', 
              name: 'Marcus Thompson', 
              email: 'marcus.thompson@school.edu', 
              teams: ['team1'], 
              position: 'Running Back',
              height: '5\'10"',
              weight: 185,
              bench: 245, 
              squat: 335, 
              deadlift: 425,
              vertical: 32,
              forty: 4.38,
              fly10: 1.02,
              grade: 12
            },
            { 
              id: 'athlete2', 
              name: 'Jordan Williams', 
              email: 'jordan.williams@school.edu', 
              teams: ['team1', 'team3'], 
              position: 'Linebacker',
              height: '6\'2"',
              weight: 215,
              bench: 285, 
              squat: 385, 
              deadlift: 465,
              vertical: 28,
              forty: 4.65,
              fly10: 1.15,
              grade: 11
            },
            { 
              id: 'athlete3', 
              name: 'Alex Rivera', 
              email: 'alex.rivera@school.edu', 
              teams: ['team2'], 
              position: 'Quarterback',
              height: '6\'1"',
              weight: 195,
              bench: 225, 
              squat: 295, 
              deadlift: 375,
              vertical: 30,
              forty: 4.58,
              fly10: 1.08,
              grade: 10
            },
            { 
              id: 'athlete4', 
              name: 'Destiny Johnson', 
              email: 'destiny.johnson@school.edu', 
              teams: ['team3'], 
              position: 'Point Guard',
              height: '5\'7"',
              weight: 155,
              bench: 135, 
              squat: 185, 
              deadlift: 245,
              vertical: 26,
              forty: 4.82,
              fly10: 1.22,
              grade: 12
            },
            { 
              id: 'athlete5', 
              name: 'Tyler Chen', 
              email: 'tyler.chen@school.edu', 
              teams: ['team1'], 
              position: 'Offensive Line',
              height: '6\'4"',
              weight: 285,
              bench: 325, 
              squat: 455, 
              deadlift: 525,
              vertical: 22,
              forty: 5.15,
              fly10: 1.45,
              grade: 11
            },
            { 
              id: 'athlete6', 
              name: 'Samantha Davis', 
              email: 'sam.davis@school.edu', 
              teams: ['team4'], 
              position: 'Sprinter',
              height: '5\'6"',
              weight: 125,
              bench: 115, 
              squat: 165, 
              deadlift: 205,
              vertical: 24,
              forty: 4.95,
              fly10: 1.18,
              grade: 10
            }
          ],
          workouts: [
            {
              id: 'workout1',
              name: 'Upper Body Power',
              date: format(new Date(), 'yyyy-MM-dd'),
              teams: ['team1', 'team2'],
              type: 'Strength',
              exercises: [
                { name: 'Bench Press', sets: 5, reps: 3, weight: 225, rest: 180, rpe: 8 },
                { name: 'Incline Dumbbell Press', sets: 4, reps: 6, weight: 75, rest: 120, rpe: 7 },
                { name: 'Weighted Pull-ups', sets: 4, reps: 5, weight: 25, rest: 120, rpe: 8 },
                { name: 'Barbell Rows', sets: 4, reps: 8, weight: 185, rest: 90, rpe: 7 },
                { name: 'Close-Grip Bench Press', sets: 3, reps: 10, weight: 155, rest: 90, rpe: 6 }
              ]
            },
            {
              id: 'workout2',
              name: 'Lower Body Strength',
              date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              teams: ['team1', 'team2'],
              type: 'Strength',
              exercises: [
                { name: 'Back Squat', sets: 5, reps: 3, weight: 315, rest: 240, rpe: 8 },
                { name: 'Romanian Deadlift', sets: 4, reps: 6, weight: 275, rest: 180, rpe: 7 },
                { name: 'Bulgarian Split Squats', sets: 3, reps: 12, weight: 25, rest: 90, rpe: 7 },
                { name: 'Walking Lunges', sets: 3, reps: 20, weight: 135, rest: 90, rpe: 6 },
                { name: 'Calf Raises', sets: 4, reps: 15, weight: 225, rest: 60, rpe: 6 }
              ]
            },
            {
              id: 'workout3',
              name: 'Speed & Agility',
              date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
              teams: ['team1', 'team3', 'team4'],
              type: 'Conditioning',
              exercises: [
                { name: '40-Yard Sprints', sets: 6, reps: 1, rest: 120, notes: 'Max effort' },
                { name: 'Pro Agility Shuttle', sets: 4, reps: 2, rest: 180, notes: '5-10-5 drill' },
                { name: 'Cone Drills', sets: 3, reps: 3, rest: 90, notes: 'Focus on cuts' },
                { name: '10-Yard Accelerations', sets: 8, reps: 1, rest: 60, notes: 'Explosive start' }
              ]
            },
            {
              id: 'workout4',
              name: 'Basketball Conditioning',
              date: format(new Date(), 'yyyy-MM-dd'),
              teams: ['team3'],
              type: 'Sport-Specific',
              exercises: [
                { name: 'Suicides', sets: 5, reps: 1, rest: 120, notes: 'Court length' },
                { name: 'Lateral Shuffles', sets: 4, reps: 30, rest: 60, notes: 'Stay low' },
                { name: 'Box Jumps', sets: 4, reps: 8, weight: 24, rest: 90, notes: '24" box' },
                { name: 'Medicine Ball Slams', sets: 3, reps: 15, weight: 12, rest: 60, notes: 'Explosive' }
              ]
            },
            {
              id: 'workout5',
              name: 'Recovery & Mobility',
              date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
              teams: ['team1', 'team2', 'team3'],
              type: 'Recovery',
              exercises: [
                { name: 'Foam Rolling', sets: 1, reps: 10, rest: 0, notes: 'Full body - 10 min' },
                { name: 'Dynamic Stretching', sets: 1, reps: 15, rest: 0, notes: 'Focus problem areas' },
                { name: 'Light Cardio', sets: 1, reps: 20, rest: 0, notes: '20 min easy pace' },
                { name: 'Core Stability', sets: 3, reps: 30, rest: 45, notes: 'Planks & variations' }
              ]
            }
          ],
          exercises: [
            { id: 'ex1', name: 'Bench Press', category: 'Upper Body', equipment: 'Barbell', muscle_groups: ['Chest', 'Triceps', 'Shoulders'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex2', name: 'Back Squat', category: 'Lower Body', equipment: 'Barbell', muscle_groups: ['Quadriceps', 'Glutes', 'Core'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex3', name: 'Deadlift', category: 'Full Body', equipment: 'Barbell', muscle_groups: ['Hamstrings', 'Glutes', 'Back'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex4', name: 'Pull-ups', category: 'Upper Body', equipment: 'Bodyweight', muscle_groups: ['Back', 'Biceps'], metrics: ['sets', 'reps'] },
            { id: 'ex5', name: 'Romanian Deadlift', category: 'Lower Body', equipment: 'Barbell', muscle_groups: ['Hamstrings', 'Glutes'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex6', name: 'Incline Dumbbell Press', category: 'Upper Body', equipment: 'Dumbbells', muscle_groups: ['Chest', 'Shoulders'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex7', name: 'Bulgarian Split Squats', category: 'Lower Body', equipment: 'Dumbbells', muscle_groups: ['Quadriceps', 'Glutes'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex8', name: 'Box Jumps', category: 'Plyometric', equipment: 'Box', muscle_groups: ['Quadriceps', 'Glutes', 'Power'], metrics: ['sets', 'reps', 'time'] },
            { id: 'ex9', name: 'Overhead Press', category: 'Upper Body', equipment: 'Barbell', muscle_groups: ['Shoulders', 'Triceps', 'Core'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex10', name: 'Barbell Row', category: 'Upper Body', equipment: 'Barbell', muscle_groups: ['Back', 'Biceps'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex11', name: 'Dips', category: 'Upper Body', equipment: 'Bodyweight', muscle_groups: ['Chest', 'Triceps'], metrics: ['sets', 'reps'] },
            { id: 'ex12', name: 'Plank', category: 'Core', equipment: 'Bodyweight', muscle_groups: ['Core'], metrics: ['time'] },
            { id: 'ex13', name: 'Sprint', category: 'Cardio', equipment: 'Bodyweight', muscle_groups: ['Power'], metrics: ['distance', 'time'] },
            { id: 'ex14', name: 'Kettlebell Swing', category: 'Full Body', equipment: 'Kettlebell', muscle_groups: ['Hamstrings', 'Glutes', 'Core'], metrics: ['weight', 'sets', 'reps'] },
            { id: 'ex15', name: 'Face Pulls', category: 'Upper Body', equipment: 'Cable', muscle_groups: ['Back', 'Shoulders'], metrics: ['weight', 'sets', 'reps'] }
          ],
          wellnessChecks: [
            {
              id: 'wellness1',
              athlete_id: 'athlete1',
              athlete_name: 'Marcus Thompson',
              date: format(new Date(), 'yyyy-MM-dd'),
              created_at: new Date().toISOString(),
              ratings: { energy: 8, sleep: 7, nutrition: 8, stress: 3, soreness: 4, motivation: 9 },
              comments: 'Feeling strong today. Ready for the big game this weekend. Got good sleep last night.',
              injury_areas: []
            },
            {
              id: 'wellness2',
              athlete_id: 'athlete1',
              athlete_name: 'Marcus Thompson',
              date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 1).toISOString(),
              ratings: { energy: 6, sleep: 6, nutrition: 7, stress: 5, soreness: 6, motivation: 7 },
              comments: 'Legs feeling heavy from yesterday\'s squat session. Need more recovery time.',
              injury_areas: ['Quadriceps']
            },
            {
              id: 'wellness3',
              athlete_id: 'athlete2',
              athlete_name: 'Jordan Williams',
              date: format(new Date(), 'yyyy-MM-dd'),
              created_at: new Date().toISOString(),
              ratings: { energy: 7, sleep: 8, nutrition: 6, stress: 4, soreness: 3, motivation: 8 },
              comments: 'Good night sleep helped recovery. Shoulder feels much better than last week.',
              injury_areas: []
            },
            {
              id: 'wellness4',
              athlete_id: 'athlete3',
              athlete_name: 'Alex Rivera',
              date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 1).toISOString(),
              ratings: { energy: 5, sleep: 4, nutrition: 6, stress: 7, soreness: 5, motivation: 6 },
              comments: 'Had trouble sleeping due to upcoming test. Feeling stressed about balancing academics and athletics.',
              injury_areas: []
            },
            {
              id: 'wellness5',
              athlete_id: 'athlete4',
              athlete_name: 'Destiny Johnson',
              date: format(new Date(), 'yyyy-MM-dd'),
              created_at: new Date().toISOString(),
              ratings: { energy: 9, sleep: 8, nutrition: 9, stress: 2, soreness: 2, motivation: 10 },
              comments: 'Feeling amazing! Great nutrition this week and recovery has been on point. Ready to dominate practice.',
              injury_areas: []
            },
            {
              id: 'wellness6',
              athlete_id: 'athlete5',
              athlete_name: 'Tyler Chen',
              date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 2).toISOString(),
              ratings: { energy: 4, sleep: 5, nutrition: 5, stress: 6, soreness: 8, motivation: 5 },
              comments: 'Lower back is really sore. Might need to see the trainer before next practice.',
              injury_areas: ['Lower Back']
            }
          ],
          injuryReports: [
            {
              id: 'injury1',
              athlete_id: 'athlete1',
              athlete_name: 'Marcus Thompson',
              coach_id: 'coach1',
              body_area: 'Ankle',
              injury_type: 'Acute',
              severity: 2,
              pain_level: 6,
              description: 'Rolled ankle during agility drills. Immediate swelling and pain. Able to walk but with discomfort.',
              occurred_at: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 5).toISOString(),
              status: 'Active',
              treatment: 'Ice, compression, elevation. Anti-inflammatory medication.'
            },
            {
              id: 'injury2',
              athlete_id: 'athlete2',
              athlete_name: 'Jordan Williams',
              coach_id: 'coach1',
              body_area: 'Shoulder',
              injury_type: 'Overuse',
              severity: 1,
              pain_level: 3,
              description: 'Mild shoulder impingement from repetitive overhead movements. No acute injury.',
              occurred_at: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 10).toISOString(),
              status: 'Recovering',
              treatment: 'Physical therapy, modified training program, strengthening exercises.'
            },
            {
              id: 'injury3',
              athlete_id: 'athlete5',
              athlete_name: 'Tyler Chen',
              coach_id: 'coach1',
              body_area: 'Lower Back',
              injury_type: 'Overuse',
              severity: 2,
              pain_level: 7,
              description: 'Lower back strain from heavy deadlifting. Muscle spasms and stiffness, especially in morning.',
              occurred_at: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 3).toISOString(),
              status: 'Active',
              treatment: 'Rest from heavy lifting, heat therapy, massage, core strengthening focus.'
            },
            {
              id: 'injury4',
              athlete_id: 'athlete3',
              athlete_name: 'Alex Rivera',
              coach_id: 'coach1',
              body_area: 'Knee',
              injury_type: 'Acute',
              severity: 1,
              pain_level: 4,
              description: 'Minor knee contusion from contact during scrimmage. Mild swelling, no instability.',
              occurred_at: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 7).toISOString(),
              status: 'Resolved',
              treatment: 'Ice, rest for 2 days, gradual return to activity.'
            },
            {
              id: 'injury5',
              athlete_id: 'athlete4',
              athlete_name: 'Destiny Johnson',
              coach_id: 'coach1',
              body_area: 'Wrist',
              injury_type: 'Acute',
              severity: 1,
              pain_level: 2,
              description: 'Minor wrist sprain from fall during basketball practice. Mild pain with movement.',
              occurred_at: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 12).toISOString(),
              status: 'Resolved',
              treatment: 'Wrist brace for 1 week, modified activities, full recovery achieved.'
            }
          ],
          workoutLogs: [
            {
              id: 'log1',
              athlete_id: 'athlete1',
              athlete_name: 'Marcus Thompson',
              workout_id: 'workout2',
              workout_name: 'Lower Body Strength',
              date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 1).toISOString(),
              performance_data: {
                '0_0': { reps: 3, weight: 315, completed: true, time: 45, rpe: 8 },
                '0_1': { reps: 3, weight: 315, completed: true, time: 48, rpe: 8 },
                '0_2': { reps: 3, weight: 325, completed: true, time: 52, rpe: 9 },
                '0_3': { reps: 2, weight: 335, completed: true, time: 55, rpe: 10 },
                '1_0': { reps: 6, weight: 275, completed: true, time: 38, rpe: 7 },
                '1_1': { reps: 6, weight: 275, completed: true, time: 42, rpe: 8 }
              },
              notes: 'Great session! Hit a new PR on back squat with 335x2. Feeling strong and confident.',
              duration: 3420, // 57 minutes
              completed: true,
              rpe_avg: 8.2
            },
            {
              id: 'log2',
              athlete_id: 'athlete1',
              athlete_name: 'Marcus Thompson',
              workout_id: 'workout1',
              workout_name: 'Upper Body Power',
              date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 3).toISOString(),
              performance_data: {
                '0_0': { reps: 3, weight: 225, completed: true, time: 42, rpe: 7 },
                '0_1': { reps: 3, weight: 235, completed: true, time: 45, rpe: 8 },
                '0_2': { reps: 2, weight: 245, completed: true, time: 48, rpe: 9 },
                '1_0': { reps: 6, weight: 75, completed: true, time: 35, rpe: 7 }
              },
              notes: 'Solid bench press workout. Form felt good, progressing nicely on incline press.',
              duration: 2940, // 49 minutes
              completed: true,
              rpe_avg: 7.8
            },
            {
              id: 'log3',
              athlete_id: 'athlete2',
              athlete_name: 'Jordan Williams',
              workout_id: 'workout1',
              workout_name: 'Upper Body Power',
              date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 1).toISOString(),
              performance_data: {
                '0_0': { reps: 3, weight: 275, completed: true, time: 48, rpe: 8 },
                '0_1': { reps: 3, weight: 285, completed: true, time: 52, rpe: 9 },
                '0_2': { reps: 2, weight: 295, completed: true, time: 55, rpe: 10 },
                '2_0': { reps: 5, weight: 25, completed: true, time: 40, rpe: 8 }
              },
              notes: 'Bench press feeling strong. Shoulder mobility has improved significantly over past weeks.',
              duration: 3180, // 53 minutes
              completed: true,
              rpe_avg: 8.8
            },
            {
              id: 'log4',
              athlete_id: 'athlete3',
              athlete_name: 'Alex Rivera',
              workout_id: 'workout3',
              workout_name: 'Speed & Agility',
              date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 2).toISOString(),
              performance_data: {
                '0_0': { time: 4.58, completed: true, notes: 'Good start' },
                '0_1': { time: 4.52, completed: true, notes: 'PR!' },
                '0_2': { time: 4.61, completed: true, notes: 'Slight fatigue' },
                '1_0': { time: 4.15, completed: true, notes: 'Excellent' }
              },
              notes: 'New 40-yard PR! 4.52 seconds. Agility work paying off, cuts are much sharper.',
              duration: 2460, // 41 minutes
              completed: true,
              rpe_avg: 8.5
            },
            {
              id: 'log5',
              athlete_id: 'athlete4',
              athlete_name: 'Destiny Johnson',
              workout_id: 'workout4',
              workout_name: 'Basketball Conditioning',
              date: format(new Date(), 'yyyy-MM-dd'),
              created_at: new Date().toISOString(),
              performance_data: {
                '0_0': { time: 28.5, completed: true, notes: 'Strong finish' },
                '0_1': { time: 29.2, completed: true, notes: 'Maintained pace' },
                '2_0': { reps: 8, weight: 24, completed: true, time: 32, rpe: 7 }
              },
              notes: 'Best conditioning session yet! Endurance is really improving, felt strong throughout.',
              duration: 2700, // 45 minutes
              completed: true,
              rpe_avg: 7.5
            },
            {
              id: 'log6',
              athlete_id: 'athlete5',
              athlete_name: 'Tyler Chen',
              workout_id: 'workout2',
              workout_name: 'Lower Body Strength',
              date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
              created_at: subDays(new Date(), 4).toISOString(),
              performance_data: {
                '0_0': { reps: 3, weight: 405, completed: true, time: 55, rpe: 8 },
                '0_1': { reps: 3, weight: 425, completed: true, time: 62, rpe: 9 },
                '0_2': { reps: 2, weight: 455, completed: true, time: 75, rpe: 10 },
                '1_0': { reps: 6, weight: 315, completed: true, time: 45, rpe: 7 }
              },
              notes: 'Back squat PR with 455x2! Lower back felt tight after, need to focus on mobility.',
              duration: 3780, // 63 minutes
              completed: true,
              rpe_avg: 8.5
            }
          ]
        }
        
        // Load any saved exercises from localStorage
        try {
          const savedExercises = localStorage.getItem('phorce:exercises');
          if (savedExercises) {
            const parsedExercises = JSON.parse(savedExercises);
            sampleData.exercises = parsedExercises;
          }
        } catch (e) {
          console.warn('Could not load exercises from localStorage:', e);
        }
        
        setData(sampleData)
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  // initialize currentUser if we have a persisted lastUser in localStorage
  useEffect(() => {
    try {
      // Clear any old cached user data to show new sample data
      localStorage.removeItem('phorce:lastUser')
      const raw = localStorage.getItem('phorce:lastUser')
      if (raw) setCurrentUser(JSON.parse(raw))
    } catch (e) {}
  }, [])


  // Helper to reload all data after a mutation
  const reloadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: teams, error: teamsError } = await supabase.from('teams').select('*')
      if (teamsError) console.warn('Error fetching teams:', teamsError)
      
      const { data: athletes, error: athletesError } = await supabase.from('athletes').select('*')
      if (athletesError) console.warn('Error fetching athletes:', athletesError)
      
      const { data: workouts, error: workoutsError } = await supabase.from('workouts').select('*')
      if (workoutsError) console.warn('Error fetching workouts:', workoutsError)
      
      let exercises = []
      try {
        const { data: ex, error: exercisesError } = await supabase.from('exercises').select('*')
        if (exercisesError) console.warn('Error fetching exercises:', exercisesError)
        exercises = ex || []
      } catch (e) {
        console.warn('Exercises table may not exist, checking localStorage:', e)
        // Fallback to localStorage when Supabase fails
        try {
          const savedExercises = localStorage.getItem('phorce:exercises');
          if (savedExercises) {
            exercises = JSON.parse(savedExercises);
            console.log('reloadData: Loaded exercises from localStorage:', exercises.length);
          }
        } catch (localError) {
          console.warn('Could not load exercises from localStorage:', localError);
        }
      }

      // Fetch wellness checks
      let wellnessChecks = []
      try {
        const { data: wellness, error: wellnessError } = await supabase.from('wellness_checks').select('*')
        if (wellnessError) console.warn('Error fetching wellness checks:', wellnessError)
        wellnessChecks = wellness || []
      } catch (e) {
        console.warn('Wellness checks table may not exist:', e)
      }

      // Fetch injury reports
      let injuryReports = []
      try {
        const { data: injuries, error: injuriesError } = await supabase.from('injury_reports').select('*')
        if (injuriesError) console.warn('Error fetching injury reports:', injuriesError)
        injuryReports = injuries || []
      } catch (e) {
        console.warn('Injury reports table may not exist:', e)
      }

      // Fetch workout logs
      let workoutLogs = []
      try {
        const { data: logs, error: logsError } = await supabase.from('workout_logs').select('*')
        if (logsError) console.warn('Error fetching workout logs:', logsError)
        workoutLogs = logs || []
      } catch (e) {
        console.warn('Workout logs table may not exist:', e)
      }
      
      setData({
        teams: teams || [],
        athletes: athletes || [],
        workouts: workouts || [],
        exercises,
        wellnessChecks,
        injuryReports,
        workoutLogs,
      })
    } catch (error) {
      console.error('Error reloading data from Supabase:', error)
    }
    setLoading(false)
  }, [])
  // Exercises CRUD
  async function addOrUpdateExercise(exercise) {
    try {
      const newData = { ...data };
      const exerciseId = exercise.id || uuidv4();
      const exerciseData = { ...exercise, id: exerciseId };
      
      if (exercise.id) {
        // Update existing
        const index = newData.exercises.findIndex(ex => ex.id === exercise.id);
        if (index >= 0) {
          newData.exercises[index] = exerciseData;
        }
      } else {
        // Add new
        newData.exercises = [...(newData.exercises || []), exerciseData];
      }
      
      setData(newData);
      
      // Persist to localStorage
      try {
        localStorage.setItem('phorce:exercises', JSON.stringify(newData.exercises));
      } catch (e) {
        console.warn('Could not save exercises to localStorage:', e);
      }
      
    } catch (error) {
      console.error('Error saving exercise:', error)
      throw error
    }
  }

  async function deleteExercise(id) {
    try {
      const newData = { ...data };
      newData.exercises = (newData.exercises || []).filter(ex => ex.id !== id);
      setData(newData);
      
      // Persist to localStorage
      try {
        localStorage.setItem('phorce:exercises', JSON.stringify(newData.exercises));
        console.log('DataContext: Exercises deleted and saved to localStorage');
      } catch (e) {
        console.warn('Could not save exercises to localStorage:', e);
      }
      
    } catch (error) {
      console.error('Error deleting exercise:', error)
      throw error
    }
  }

  // Wellness checks CRUD
  async function addWellnessCheck(wellnessData) {
    try {
      const { error } = await supabase.from('wellness_checks').insert([{ 
        ...wellnessData, 
        id: uuidv4(),
        created_at: new Date().toISOString()
      }])
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error saving wellness check:', error)
      throw error
    }
  }

  // Injury reports CRUD
  async function addInjuryReport(reportData) {
    try {
      const { error } = await supabase.from('injury_reports').insert([{ 
        ...reportData, 
        id: uuidv4(),
        created_at: new Date().toISOString()
      }])
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error saving injury report:', error)
      throw error
    }
  }

  // Workout logs CRUD
  async function addWorkoutLog(logData) {
    try {
      const { error } = await supabase.from('workout_logs').insert([{ 
        ...logData, 
        id: uuidv4(),
        created_at: new Date().toISOString()
      }])
      if (error) throw error
      await reloadData()
    } catch (error) {
      console.error('Error saving workout log:', error)
      throw error
    }
  }


  // Teams CRUD
  async function addOrUpdateTeam(team) {
    if (team.id) {
      // Update
      await supabase.from('teams').update(team).eq('id', team.id)
    } else {
      await supabase.from('teams').insert([{ ...team, id: uuidv4() }])
    }
    await reloadData()
  }

  async function deleteTeam(id) {
    await supabase.from('teams').delete().eq('id', id)
    await reloadData()
  }


  // Athletes CRUD
  async function addOrUpdateAthlete(athlete) {
    if (athlete.id) {
      await supabase.from('athletes').update(athlete).eq('id', athlete.id)
    } else {
      await supabase.from('athletes').insert([{ ...athlete, id: uuidv4() }])
    }
    await reloadData()
  }

  async function deleteAthlete(id) {
    await supabase.from('athletes').delete().eq('id', id)
    await reloadData()
  }


  // Workouts CRUD
  async function addOrUpdateWorkout(workout) {
    const newData = { ...data };
    if (workout.id) {
      // Update existing workout
      const index = newData.workouts.findIndex(w => w.id === workout.id);
      if (index !== -1) {
        newData.workouts[index] = workout;
      }
    } else {
      // Add new workout
      const newWorkout = { ...workout, id: uuidv4() };
      newData.workouts.push(newWorkout);
    }
    setData(newData);
    console.log('Workout saved:', workout.title);
  }

  async function deleteWorkout(id) {
    const newData = { ...data };
    newData.workouts = newData.workouts.filter(w => w.id !== id);
    setData(newData);
    console.log('Workout deleted:', id);
  }

  async function duplicateWorkout(workoutId, newDate, options = {}) {
    const { data: workouts } = await supabase.from('workouts').select('*').eq('id', workoutId)
    const original = (workouts || [])[0]
    if (!original) return null
    const copy = { ...original, id: uuidv4(), date: newDate }
    if (options.gameday) {
      copy.exercises = (copy.exercises || []).map((ex) => ({ ...ex, reps: Math.max(1, Math.round((ex.reps || 0) * 0.5)) }))
    }
    await supabase.from('workouts').insert([copy])
    await reloadData()
    return copy
  }

  // Clipboard (local only)
  function setClipboard(workout) {
    try {
      setClipboardStorage(workout)
    } catch (e) {}
  }

  function getClipboard() {
    try {
      return getClipboardStorage()
    } catch (e) { return null }
  }

  function clearClipboard() {
    try { clearClipboardStorage() } catch (e) {}
  }

  // Simple auth: users collection, login, logout (still local for now)
  function login(email, password, role = 'coach') {
    // Demo mode: create realistic sample users
    let user
    if (role === 'coach') {
      user = { 
        id: 'coach1', 
        name: 'Coach Mike Rodriguez', 
        email: email, 
        role: 'coach',
        teams: ['team1', 'team2', 'team3'],
        experience: '8 years',
        specialization: 'Strength & Conditioning'
      }
    } else {
      // Default to Marcus Thompson for athlete login
      user = { 
        id: 'athlete1', 
        name: 'Marcus Thompson', 
        email: email, 
        role: 'athlete', 
        teams: ['team1'],
        position: 'Running Back',
        grade: 12,
        height: '5\'10"',
        weight: 185
      }
    }
    setCurrentUser(user)
    try { localStorage.setItem('phorce:lastUser', JSON.stringify(user)) } catch (e) {}
    return user
  }

  function logout() {
    setCurrentUser(null)
    try { localStorage.removeItem('phorce:lastUser') } catch (e) {}
  }

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        addOrUpdateTeam,
        deleteTeam,
        addOrUpdateAthlete,
        deleteAthlete,
        addOrUpdateWorkout,
        deleteWorkout,
        duplicateWorkout,
        setClipboard,
        getClipboard,
        clearClipboard,
        addOrUpdateExercise,
        deleteExercise,
        addWellnessCheck,
        addInjuryReport,
        addWorkoutLog,
        // auth
        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}

export default DataContext
