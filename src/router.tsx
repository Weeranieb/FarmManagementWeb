import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPassword'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LoginPage
        onLogin={(email, password) => {
          console.log(email, password)
        }}
      />
    ),
  },
  {
    path: '/login',
    element: (
      <LoginPage
        onLogin={(email, password) => {
          console.log(email, password)
        }}
      />
    ),
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
])
