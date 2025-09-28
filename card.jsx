import React from 'react'
import { Card as MUICard, CardContent, CardHeader } from '@mui/material'

export function Card({ children, ...props }) {
  return <MUICard {...props}>{children}</MUICard>
}

export function CardHeaderWrapper(props) { return <CardHeader {...props} /> }
export function CardContentWrapper(props) { return <CardContent {...props} /> }

export default Card
