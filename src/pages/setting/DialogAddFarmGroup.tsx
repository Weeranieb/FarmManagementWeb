import { FC, ChangeEvent, useState } from 'react'
import { Grid } from '@mui/material'
import DialogWrapper from '../../components/DialogWrapper'
import GridTextField from '../../components/grid/GridTextField'
import { AddName } from '../../models/schema/base'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddName) => void
}

const DialogAddFarmGroup: FC<DialogAddProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AddName>({
    name: '',
    code: '',
  })

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
      onClose()
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.name === '') newErrors.name = 'Farm Group Name is required'
    if (formData.code === '') newErrors.code = 'Farm Group Code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล'
      handleFormSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3}>
        <GridTextField
          xs={6}
          value={formData.name}
          name='name'
          label='ชื่อกลุ่ม'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.name}
        />
        <GridTextField
          xs={6}
          value={formData.code}
          name='code'
          label='ชื่อกลุ่มย่อ'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.code}
        />
      </Grid>
    </DialogWrapper>
  )
}

export default DialogAddFarmGroup
