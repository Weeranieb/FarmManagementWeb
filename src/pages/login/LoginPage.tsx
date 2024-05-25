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
          maxWidth: 360,
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          padding: 3,
          borderRadius: 2,
          position: 'relative',
        }}
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography
          variant='h5'
          component='h2'
          sx={{ textAlign: 'center', marginBottom: 2 }}
        >
          Sign in
        </Typography>
        <TextField
          sx={{ marginBottom: 3 }} // Add more space between email and password fields
          label='Email or phone number'
          variant='outlined'
          fullWidth
          required
        />
        <TextField
          sx={{ marginBottom: 2 }}
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
        <Button type='submit' variant='contained' color='primary' fullWidth>
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
