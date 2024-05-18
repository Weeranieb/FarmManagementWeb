import { createTheme } from '@mui/material/styles'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#CEBCA1',
    },
    secondary: {
      main: '#FAF8EE',
    },
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#4B4B4C',
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Set mode to dark
    primary: {
      main: '#CEBCA1', // Your primary color
    },
    secondary: {
      main: '#121212', // Adjust secondary color for dark mode
    },
    background: {
      default: '#121212', // Adjust background color for dark mode
    },
    text: {
      primary: '#FFFFFF', // Adjust text color for dark mode
    },
  },
})
