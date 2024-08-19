import { FC, ChangeEvent, useState, useEffect } from 'react'
import { Grid, SelectChangeEvent } from '@mui/material'
import DialogWrapper from '../../components/DialogWrapper'
import { AddFarm } from '../../models/schema/farm'
import { Client } from '../../models/schema/client'
import { getAllClientsApi } from '../../services/client.service'
import ErrorAlert from '../../components/ErrorAlert'
import GridSelect from '../../components/grid/GridSelect'
import GridTextField from '../../components/grid/GridTextField'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddFarm) => void
}

const DialogAddFarm: FC<DialogAddProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AddFarm>({
    clientId: 0,
    name: '',
    code: '',
  })

  const [clientList, setClientList] = useState<Client[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'clientId' ? parseInt(value, 10) : value,
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

    if (formData.clientId === 0) newErrors.clientId = 'Client is required'
    if (formData.name === '') newErrors.name = 'Farm Name is required'
    if (formData.code === '') newErrors.code = 'Farm Code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    const getClientList = async () => {
      await getAllClientsApi()
        .then((res) => {
          if (res.result) {
            setClientList(res.data)
          } else {
            ErrorAlert(res)
          }
        })
        .catch((err) => ErrorAlert(err))
    }

    getClientList()
  }, [])

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล'
      handleFormSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3}>
        <GridSelect
          xs={4}
          value={formData.clientId.toString()}
          name='clientId'
          label='เลือกลูกค้า'
          objectMap={clientList}
          handleSelectChange={handleSelectChange}
          error={errors.farmId}
        />
        <GridTextField
          xs={4}
          value={formData.name}
          name='name'
          label='ชื่อบ่อ'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.name}
        />
        <GridTextField
          xs={4}
          value={formData.code}
          name='code'
          label='ชื่อบ่อย่อ'
          type='text'
          handleInputChange={handleInputChange}
          error={errors.code}
        />
      </Grid>
    </DialogWrapper>
  )
}

export default DialogAddFarm
