import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  IconButton,
  Grid,
  Button,
  DialogActions,
} from '@mui/material'
import { styled } from '@mui/system'
import { Close as CloseIcon } from '@mui/icons-material'

interface StyledDialogWrapperProps extends DialogProps {
  title?: string
  open: boolean
  onClose: () => void
  handleFormSubmit?: () => void
  children: React.ReactNode
}

const StyledDialog = styled(Dialog)<StyledDialogWrapperProps>(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 50,
    maxWidth: 'md', // Set the maximum width to medium (or 'sm', 'lg', 'xl' as required)
    width: '50%', // Make the dialog use full width within the maxWidth constraint
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

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
  paddingTop: theme.spacing(3),
}))

const CustomButton = styled(Button)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  padding: theme.spacing(1.5, 4),
  border: `2px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 50,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}))

const DialogWrapper: React.FC<StyledDialogWrapperProps> = ({
  title,
  open,
  onClose,
  handleFormSubmit,
  children,
}) => {
  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <StyledDialogTitle>
        {title}
        <IconButton edge='end' color='inherit' onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>{children}</StyledDialogContent>
      <StyledDialogActions>
        <Grid container justifyContent='center'>
          <CustomButton
            onClick={handleFormSubmit}
            color='primary'
            variant='contained'
          >
            บันทึก
          </CustomButton>
        </Grid>
      </StyledDialogActions>
    </StyledDialog>
  )
}

export default DialogWrapper
