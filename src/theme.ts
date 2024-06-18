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
    grey: {
      50: '#F9F9F9',
      100: '#F1F1F1',
      200: '#E9E9E9',
      300: '#D9D9D9',
      400: '#BFBFBF',
      500: '#A5A5A5',
      600: '#7E7E7E',
      700: '#666666',
      800: '#4D4D4D',
      900: '#333333',
    },
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#4B4B4C',
      secondary: '#ffffff',
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
