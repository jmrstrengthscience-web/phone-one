import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});


export default function WorkoutCalendar({ workouts = [] }) {
  // Map workouts to calendar events
  const events = (workouts || []).map(w => ({
    id: w.id,
    title: (w.tier ? `[${w.tier}] ` : '') + (w.title || 'Workout'),
    start: w.date ? new Date(w.date) : new Date(),
    end: w.date ? new Date(w.date) : new Date(),
    allDay: true,
    tierColor: w.tierColor || '#1976d2',
    ...w,
  }));

  // Custom event style getter for color coding
  function eventStyleGetter(event) {
    return {
      style: {
        backgroundColor: event.tierColor || '#1976d2',
        color: '#fff',
        borderRadius: 8,
        border: 'none',
        padding: 2,
        opacity: 0.95,
      },
    };
  }

  return (
    <Box>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, background: '#fff', color: '#222', borderRadius: 8, padding: 8 }}
        popup
        views={['month', 'week', 'day']}
        titleAccessor="title"
        eventPropGetter={eventStyleGetter}
      />
    </Box>
  );
}
