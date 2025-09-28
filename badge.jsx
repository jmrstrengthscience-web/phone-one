import React from 'react'
import { Chip } from '@mui/material'

export function Badge({ children, variant = 'default', className = '', ...props }) {
  return <Chip label={children} color={variant === 'secondary' ? 'secondary' : 'default'} {...props} />
}

export default Badge
