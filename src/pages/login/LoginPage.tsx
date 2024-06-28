import React, { useState, useEffect } from 'react'
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
import { useNavigate } from 'react-router-dom'
import {
  ACCESS_TOKEN_NAME,
  LOGIN_DATA,
} from '../../constants/localStorageConstants'
import { API_BASE_URL } from '../../constants/envConstants'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const storedLoginData = localStorage.getItem('loginData')
    if (storedLoginData) {
      setLoginData(JSON.parse(storedLoginData))
      setRememberMe(true)
    }
  }, [])

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => event.preventDefault()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rememberMe) {
      localStorage.setItem(LOGIN_DATA, JSON.stringify(loginData))
    } else {
      localStorage.removeItem(LOGIN_DATA)
    }
    // set token in local storage
    // TODO replace 'access_token' with actual token
    console.log('this is url :', API_BASE_URL)
    localStorage.setItem(ACCESS_TOKEN_NAME, 'access_token')
    navigate('/')
  }

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
        onSubmit={handleSubmit}
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
          name='email'
          value={loginData.email}
          onChange={handleChange}
        />
        <TextField
          sx={{ marginBottom: 3 }}
          label='Password'
          variant='outlined'
          fullWidth
          required
          name='password'
          type={showPassword ? 'text' : 'password'}
          value={loginData.password}
          onChange={handleChange}
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
          control={
            <Checkbox
              checked={rememberMe}
              onChange={handleCheckboxChange}
              color='primary'
            />
          }
          label='Remember me'
        />
      </Box>
    </Grid>
  )
}

export default LoginPage
