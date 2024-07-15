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
  islarge?: boolean
  children: React.ReactNode
}

export const StyledDialog = styled(Dialog)<StyledDialogWrapperProps>(
  ({ theme, islarge }) => ({
    '& .MuiPaper-root': {
      borderRadius: 50,
      maxWidth: islarge ? 'xl' : 'md',
      width: islarge ? '100%' : '50%',
    },
  })
)

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
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

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  marginTop: theme.spacing(2),
  // paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(6),
  paddingBottom: theme.spacing(3),
}))

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
  paddingTop: theme.spacing(3),
}))

export const CustomButton = styled(Button)(({ theme }) => ({
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
  islarge,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={islarge ? 'xl' : 'md'}
      islarge={islarge}
    >
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
