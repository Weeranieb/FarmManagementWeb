import { FC } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface PageBarProps {
  title: string
  handleDialogOpen: () => void
}

const PageBarWithAdd: FC<PageBarProps> = ({ title, handleDialogOpen }) => {
  const { t } = useTranslation()

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      width='100%'
    >
      <Typography
        variant='h4'
        component='h4'
        style={{ margin: 0, padding: '0 10px' }}
        gutterBottom
        fontWeight='bold'
      >
        {title}
      </Typography>
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
      </Box>
    </Box>
  )
}

export default PageBarWithAdd
