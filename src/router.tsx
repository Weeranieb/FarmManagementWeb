import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/Dashboard'

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

  // Protected routes with MainLayout
  {
    element: <MainLayout />, // Wraps all child routes
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
])
