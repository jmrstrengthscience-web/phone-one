import React from 'react'
import { Button as MUIButton } from '@mui/material'

export function Button({ children, variant = 'solid', size = 'md', className = '', ...props }) {
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained'
  return (
    <MUIButton variant={muiVariant} size={size === 'sm' ? 'small' : 'medium'} className={className} {...props}>
      {children}
    </MUIButton>
  )
}

export default Button
