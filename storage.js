import { v4 as uuidv4 } from 'uuid'

const KEY = 'phorce:data'

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    return JSON.parse(raw)
  } catch (e) {
    return seed()
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function seed() {
  const teams = [
    { id: uuidv4(), name: 'Alpha Hawks', coach: 'Coach A' },
    { id: uuidv4(), name: 'Beta Bulls', coach: 'Coach B' },
  ]

  const athletes = [
    { id: uuidv4(), name: 'Sam Carter', age: 22, position: 'Forward', teams: [teams[0].id] },
    { id: uuidv4(), name: 'Lena Ortiz', age: 19, position: 'Guard', teams: [teams[1].id] },
    { id: uuidv4(), name: 'Diego Ramos', age: 21, position: 'Center', teams: [] },
  ]

  const workouts = [
    {
      id: uuidv4(),
      name: 'Lower Body Strength',
      date: null,
      exercises: [
        { name: 'Back Squat', sets: 4, reps: 5, notes: 'Build to heavy set' },
        { name: 'Romanian Deadlift', sets: 3, reps: 8, notes: '' },
      ],
      teams: [teams[0].id],
    },
  ]

  const data = { teams, athletes, workouts }
  saveData(data)
  return data
}

export function addWorkout(data, workout) {
  data.workouts = data.workouts || []
  data.workouts.push(workout)
  saveData(data)
}

export function updateWorkout(data, workout) {
  data.workouts = data.workouts || []
  const idx = data.workouts.findIndex((w) => w.id === workout.id)
  if (idx === -1) data.workouts.push(workout)
  else data.workouts[idx] = workout
  saveData(data)
}

export function deleteWorkout(data, id) {
  data.workouts = (data.workouts || []).filter((w) => w.id !== id)
  saveData(data)
}

export function duplicateWorkout(data, workoutId, newDate, options = {}) {
  const original = (data.workouts || []).find((w) => w.id === workoutId)
  if (!original) return
  const copy = { ...original, id: uuidv4(), date: newDate }
  // apply gameday modifications
  if (options.gameday) {
    copy.exercises = (copy.exercises || []).map((ex) => ({ ...ex, reps: Math.max(1, Math.round((ex.reps || 0) * 0.5)) }))
  }
  data.workouts = data.workouts || []
  data.workouts.push(copy)
  saveData(data)
  return copy
}

const CLIP_KEY = 'phorce:clipboard'

export function setClipboard(workout) {
  try {
    localStorage.setItem(CLIP_KEY, JSON.stringify(workout))
  } catch (e) {}
}

export function getClipboard() {
  try {
    const raw = localStorage.getItem(CLIP_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

export function clearClipboard() {
  try { localStorage.removeItem(CLIP_KEY) } catch (e) {}
}
