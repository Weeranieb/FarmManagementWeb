import { FC, useState, useEffect } from 'react'
import { Grid, SelectChangeEvent } from '@mui/material'
import DialogWrapper from '../../components/DialogWrapper'
import GridSelect from '../../components/grid/GridSelect'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const DialogAddFarmInGroup: FC<DialogAddProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    farmId: 0,
  })
  const [farmList, setFarmList] = useState<Farm[]>([])

  useEffect(() => {
    const getFarmList = async () => {
      const res = await getFarmListApi()
      setFarmList(res.data)
    }

    getFarmList()
  }, [])

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'farmId' ? parseInt(value, 10) : value,
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

    if (formData.farmId === 0) newErrors.farmId = 'Farm Id is required'

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
        <GridSelect
          xs={12}
          value={formData.farmId.toString()}
          name='farmId'
          label='ชื่อฟาร์ม'
          objectMap={farmList}
          handleSelectChange={handleSelectChange}
          error={errors.farmId}
        />
      </Grid>
    </DialogWrapper>
  )
}

export default DialogAddFarmInGroup
