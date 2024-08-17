import { FC } from 'react'
import { Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AddAndUploadBar: FC<{ handleDialogOpen: () => void }> = ({
  handleDialogOpen,
}) => {
  const { t } = useTranslation()

  return (
    <Box
      display='flex'
      justifyContent='flex-end'
      alignItems='center'
      width='100%'
    >
      <Box display='flex' alignItems='center' gap={2}>
        <Button
          variant='outlined'
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
          }}
        >
          {t('add')}
        </Button>

        <Button
          variant='outlined'
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
          }}
        >
          {t('upload')}
        </Button>
      </Box>
    </Box>
  )
}

export default AddAndUploadBar
