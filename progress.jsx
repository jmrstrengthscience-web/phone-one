import React from 'react'
import { LinearProgress } from '@mui/material'

export function Progress({ value = 0, className = '', ...props }) {
  return <LinearProgress variant="determinate" value={value} {...props} />
}

export default Progress
