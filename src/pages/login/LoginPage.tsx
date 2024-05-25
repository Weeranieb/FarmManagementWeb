import React, { useState } from 'react'
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleMouseDownPassword = (event: any) => event.preventDefault()

  return (
    <Grid
      container
      sx={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/backgroundLogin.jpg)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(2px)',
          zIndex: -1,
        },
      }}
    >
      <Box
        component='form'
        sx={{
          width: '100%',
          maxWidth: 450,
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: 5,
          borderRadius: 7,
          position: 'relative',
        }}
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography
          variant='h4'
          component='h2'
          sx={{ textAlign: 'left', mb: 4 }}
        >
          Sign in
        </Typography>
        <TextField
          sx={{ marginBottom: 4 }}
          label='Email or phone number'
          variant='outlined'
          fullWidth
          required
        />
        <TextField
          sx={{ marginBottom: 3 }}
          label='Password'
          variant='outlined'
          fullWidth
          required
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge='end'
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{ mb: 1, color: 'white' }}
          fullWidth
        >
          Sign in
        </Button>
        <FormControlLabel
          control={<Checkbox value='remember' color='primary' />}
          label='Remember me'
        />
      </Box>
    </Grid>
  )
}

export default LoginPage
