import { FC } from 'react'
import { Box, TextField, InputAdornment, Button, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

const mockDropdownOptions = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Farm 1' },
  { id: 2, name: 'Farm 2' },
]

const SearchBar: FC<{ handleDialogOpen: () => void }> = ({
  handleDialogOpen,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' justifyContent='space-between' alignItems='center'>
      <TextField
        select
        label='ฟาร์ม'
        variant='outlined'
        size='small'
        sx={{ width: 150, mr: 2 }}
      >
        {mockDropdownOptions.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {t(option.name)}
          </MenuItem>
        ))}
      </TextField>

      <Box display='flex' alignItems='center'>
        <TextField
          variant='outlined'
          size='small'
          placeholder='ค้นหา'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2 }}
        />
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

export default SearchBar
