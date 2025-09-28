import React from 'react'
import { Typography } from '@mui/material'

export function Label({ children, htmlFor }) {
  return <Typography component="label" htmlFor={htmlFor} sx={{ display: 'block', mb: 0.5 }}>{children}</Typography>
}

export default Label
