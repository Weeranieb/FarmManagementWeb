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
  handleEdit?: () => void
  isLarge?: boolean
  children: React.ReactNode
}

const DialogWrapperWithEdit: React.FC<DialogWrapperWithEditProps> = ({
  title,
  open,
  onClose,
  handleFormSubmit,
  handleEdit,
  isLarge,
  children,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isLarge ? 'xl' : 'md'}
      isLarge={isLarge}
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
              onClick={handleEdit}
              color='primary'
              variant='contained'
              style={{ marginRight: 10 }}
            >
              แก้ไข
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

export default DialogWrapperWithEdit
