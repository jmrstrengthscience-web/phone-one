import React from 'react'
import { Tabs as MUITabs, Tab, Box } from '@mui/material'

export function Tabs({ value, onValueChange, children, ...props }) {
  const handleChange = (e, v) => onValueChange(v)
  return (
    <MUITabs value={value} onChange={handleChange} {...props}>
      {children}
    </MUITabs>
  )
}

export function TabsList({ children, className, ...props }) { 
  // Filter out non-DOM props that might cause warnings
  const { 
    indicator, 
    orientation, 
    variant, 
    scrollButtons, 
    allowScrollButtonsMobile,
    TabIndicatorProps,
    TabScrollButtonProps,
    ...domProps 
  } = props;
  
  // Convert Tailwind classes to sx props for MUI
  const sx = className?.includes('grid') ? {
    display: 'grid',
    gridTemplateColumns: className.includes('grid-cols-5') ? 'repeat(5, 1fr)' : undefined,
    width: className.includes('w-full') ? '100%' : undefined,
    ...(className.includes('lg:w-fit') ? {
      '@media (min-width: 1024px)': { width: 'fit-content' }
    } : {})
  } : {};
  
  return <Box sx={sx} {...domProps}>{children}</Box> 
}

export function TabsTrigger({ value, children, className, ...props }) { 
  // Convert Tailwind classes to sx props
  const sx = className?.includes('flex') ? {
    display: 'flex',
    alignItems: className.includes('items-center') ? 'center' : undefined,
    gap: className.includes('gap-2') ? 2 : undefined
  } : {};
  
  return <Tab value={value} label={children} sx={sx} {...props} /> 
}

export function TabsContent({ value, children, ...props }) { 
  const { className, ...domProps } = props;
  return <div {...domProps} data-value={value}>{children}</div> 
}

export default Tabs
