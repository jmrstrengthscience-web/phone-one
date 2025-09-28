import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useData } from '../lib/MultiTenantDataContext';
import WorkoutCalendar from '../components/WorkoutCalendar';

export default function CalendarView() {
  const contextData = useData();
  
  if (!contextData || contextData.loading) {
    return <div>Loading calendar...</div>;
  }
  
  const { data, currentUser } = contextData;
  // Show only workouts for teams under this coach
  const coachTeamIds = useMemo(() => {
    if (!currentUser || !data.teams) return [];
    return data.teams.filter(t => t.coachId === currentUser.id).map(t => t.id);
  }, [data.teams, currentUser]);
  const workouts = useMemo(() => {
    if (!data.workouts) return [];
    return data.workouts.filter(w => (w.teams || []).some(tid => coachTeamIds.includes(tid)));
  }, [data.workouts, coachTeamIds]);
  return (
    <Box>
      <WorkoutCalendar workouts={workouts} />
    </Box>
  );
}
