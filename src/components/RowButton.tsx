import { FC } from 'react'
import { Button, Box, Typography, IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DeleteIcon from '@mui/icons-material/Delete'

interface RowButtonProps {
  name: string
  id: number
  code?: string
  clientName?: string
  onClick: () => void
  onDelete?: () => void
}

const RowButton: FC<RowButtonProps> = ({
  name,
  id,
  code,
  clientName,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='contained'
      sx={{
        marginTop: 2,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FAF8EE',
        border: '2px solid #CEBCA1',
        borderRadius: 2,
        paddingY: 1,
        color: '#4B4B4C',
        paddingX: 2,
        fontSize: '1rem',
        textAlign: 'left',
        flexDirection: 'row',
      }}
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
          sx={{ fontWeight: 'bold', textAlign: 'right', marginTop: 1 }}
        >
          {clientName}
        </Typography>
      )}
      {onDelete && (
        <IconButton
          sx={{ color: '#9e9e9e' }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Button>
  )
}

export default RowButton
