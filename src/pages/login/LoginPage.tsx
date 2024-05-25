import React from 'react'
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
} from '@mui/material'

const LoginPage = () => {
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
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: 3,
          borderRadius: 2,
          zIndex: 1,
        }}
        noValidate
        onSubmit={(e) => e.preventDefault()}
      >
        <TextField
          sx={{ marginBottom: 2 }}
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
          type='password'
        />
        <FormControlLabel
          control={<Checkbox value='remember' color='primary' />}
          label='Remember me'
        />
        <Button type='submit' variant='contained' color='primary' fullWidth>
          Sign in
        </Button>
      </Box>
    </Grid>
  )
}

export default LoginPage
