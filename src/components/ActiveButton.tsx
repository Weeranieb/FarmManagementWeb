import React from 'react'
import { styled } from '@mui/system'
import { Button } from '@mui/material'

interface StyledButtonProps {
  isActive?: boolean
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<StyledButtonProps>(({ theme, isActive }) => ({
  backgroundColor: isActive
    ? theme.palette.primary.main
    : theme.palette.grey[400],
  color: isActive ? theme.palette.text.secondary : theme.palette.text.primary,
  borderRadius: '20px',
  '&:hover': {
    backgroundColor: isActive
      ? theme.palette.primary.dark
      : theme.palette.grey[600],
    color: isActive ? theme.palette.text.secondary : theme.palette.text.primary,
  },
}))

const ActiveButton: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <StyledButton variant='contained' isActive={isActive}>
      {isActive ? 'ปัจจุบัน' : 'ปิดแล้ว'}
    </StyledButton>
  )
}

export default ActiveButton
