import React from 'react'
import { DialogProps, Grid, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import {
  StyledDialog,
  StyledDialogTitle,
  StyledDialogContent,
  StyledDialogActions,
  CustomButton,
} from './DialogWrapper'

interface DialogWrapperWithEditProps extends DialogProps {
  title?: string
  open: boolean
  onClose: () => void
  handleFormSubmit?: () => void
  handleCancel?: () => void
  islarge?: boolean
  children: React.ReactNode
}

const DialogWrapperWithCancel: React.FC<DialogWrapperWithEditProps> = ({
  title,
  open,
  onClose,
  handleFormSubmit,
  handleCancel,
  islarge,
  children,
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
        <Grid container justifyContent='flex-end' spacing={1}>
          <Grid item>
            <CustomButton
              onClick={handleCancel}
              color='primary'
              variant='contained'
              style={{ marginRight: 10 }}
            >
              ยกเลิก
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton
              onClick={handleFormSubmit}
              color='primary'
              variant='contained'
              style={{ marginRight: 30 }}
            >
              บันทึก
            </CustomButton>
          </Grid>
        </Grid>
      </StyledDialogActions>
    </StyledDialog>
  )
}

export default DialogWrapperWithCancel
