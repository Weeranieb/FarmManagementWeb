import { MouseEvent, useState, useEffect, ChangeEvent, FormEvent } from 'react'
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
import { useDispatch } from 'react-redux'
import {
  ACCESS_TOKEN_NAME,
  EXPIRED_DATE,
  LOGIN_DATA,
} from '../../constants/localStorageConstants'
import { loginApi } from '../../services/auth.service'
import { BaseResponse } from '../../models/api/baseResponse'
import { AuthorizeResult } from '../../models/schema/auth'
import { setUser } from '../../redux/reducers/user'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [errorText, setErrorText] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const storedLoginData = localStorage.getItem(LOGIN_DATA)
    if (storedLoginData) {
      setLoginData(JSON.parse(storedLoginData))
      setRememberMe(true)
    }
  }, [])

  const handleClickShowPassword = () => setShowPassword(!showPassword)
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) =>
    event.preventDefault()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check for empty fields
    if (!loginData.username || !loginData.password) {
      setErrorText('*กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (rememberMe) {
      localStorage.setItem(LOGIN_DATA, JSON.stringify(loginData))
    } else {
      localStorage.removeItem(LOGIN_DATA)
    }

    // call login api
    const data: BaseResponse<AuthorizeResult> = await loginApi(
      loginData.username,
      loginData.password
    )

    if (data.result) {
      // update local storage and redux store
      localStorage.setItem(ACCESS_TOKEN_NAME, data.data.accessToken)
      localStorage.setItem(EXPIRED_DATE, data.data.expiredAt)
      dispatch(setUser(data.data))
      navigate('/')
    } else {
      // handle login failure
      setErrorText('*ชื่อผู้ใช้งานหรือพาสเวิร์ดไม่ถูกต้อง')
    }
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
          name='username'
          value={loginData.username}
          onChange={handleChange}
          autoComplete='username'
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
          autoComplete='current-password'
        />
        {errorText && (
          <Typography color='error' sx={{ mt: 1 }}>
            {errorText}
          </Typography>
        )}
        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{ mt: 2, color: 'white' }}
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
