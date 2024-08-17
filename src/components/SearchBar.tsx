import { FC } from 'react'
import { Box, TextField, InputAdornment, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

const SearchBar: FC<{ handleDialogOpen: () => void }> = ({
  handleDialogOpen,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' alignItems='center' width='100%'>
      {/* Spacer to push the search bar and button to the right */}
      <Box flexGrow={1} />
      <Box display='flex' alignItems='center' width='auto'>
        <TextField
          variant='outlined'
          size='small'
          placeholder={t('search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2, width: '100%' }}
        />
        <Button
          variant='outlined'
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
            whiteSpace: 'nowrap',
          }}
        >
          {t('add')}
        </Button>
      </Box>
    </Box>
  )
}

export default SearchBar
