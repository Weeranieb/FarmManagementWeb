import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  IconButton,
} from '@mui/material'
import { styled } from '@mui/system'
import { Close as CloseIcon } from '@mui/icons-material'

interface StyledDialogWrapperProps extends DialogProps {
  title?: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const StyledDialog = styled(Dialog)<StyledDialogWrapperProps>(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 50,
  },
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.primary,
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.85rem',
  paddingLeft: theme.spacing(5),
  paddingBottom: theme.spacing(1),
  paddingTop: theme.spacing(4),
  paddingRight: theme.spacing(3),
}))

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  paddingBottom: theme.spacing(3),
}))

const DialogWrapper: React.FC<StyledDialogWrapperProps> = ({
  title,
  open,
  onClose,
  children,
}) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        {title}
        <IconButton edge='end' color='inherit' onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>{children}</StyledDialogContent>
    </StyledDialog>
  )
}

export default DialogWrapper
