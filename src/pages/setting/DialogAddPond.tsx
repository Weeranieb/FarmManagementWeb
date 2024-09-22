import { FC, ChangeEvent, useState, useEffect } from 'react'
import { Grid } from '@mui/material'
import DialogWrapper from '../../components/DialogWrapper'
import GridTextField from '../../components/grid/GridTextField'
import { AddName } from '../../models/schema/base'
import { Pond } from '../../models/schema/pond'

interface DialogAddProps {
  open: boolean
  onClose: (type: string) => void
  onSubmit: (data: AddName) => void
  pond?: Pond | null
}

const DialogAddPond: FC<DialogAddProps> = ({
  open,
  onClose,
  onSubmit,
  pond,
}) => {
  const [formData, setFormData] = useState<AddName>({
    name: pond?.name || '',
    code: pond?.code || '',
  })

  useEffect(() => {
    if (pond) {
      setFormData({ name: pond.name, code: pond.code })
    } else {
      setFormData({ name: '', code: '' })
    }
  }, [pond])

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFormSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
      onClose('add')
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.name === '') newErrors.name = 'Pond Name is required'
    if (formData.code === '') newErrors.code = 'Pond Code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClose = () => {
    onClose('add')
  }

  return (
    <DialogWrapper
      open={open}
      onClose={handleClose}
      title={pond ? 'แก้ไขข้อมูล' : 'กรอกข้อมูล'} // Update title based on mode
      handleFormSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3}>
        <GridTextField
          xs={6}
          value={formData.name}
          name='name'
          label='ชื่อบ่อ'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.name}
        />
        <GridTextField
          xs={6}
          value={formData.code}
          name='code'
          label='ชื่อย่อบ่อ'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.code}
        />
      </Grid>
    </DialogWrapper>
  )
}

export default DialogAddPond
