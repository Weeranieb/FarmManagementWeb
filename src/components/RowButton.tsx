import { FC } from 'react'
import { Button, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface RowButtonProps {
  name: string
  id: number
  code?: string
  clientName?: string
  onClick: () => void
}

const RowButton: FC<RowButtonProps> = ({
  name,
  id,
  code,
  clientName,
  onClick,
}) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='contained'
      sx={{
        marginTop: 2,
        width: '100%',
        backgroundColor: '#FAF8EE',
        color: '#4B4B4C',
        fontSize: '1rem',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingY: 1,
        paddingX: 2,
        borderRadius: 2,
        border: '2px solid #CEBCA1',
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography
          variant='h6'
          component='div'
          sx={{ fontWeight: 'bold', fontSize: '1rem' }}
        >
          {name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 1,
          }}
        >
          <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
            {t('id')}: {id} {code && ` ${t('code')}: ${code}`}
          </Typography>
        </Box>
      </Box>
      {clientName && (
        <Typography
          variant='h6'
          component='div'
          sx={{ fontWeight: 'bold', textAlign: 'right' }}
        >
          {clientName}
        </Typography>
      )}
    </Button>
  )
}

export default RowButton
