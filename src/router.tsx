import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/Dashboard'
import { FarmsListPage } from './pages/FarmListPage'
import { FarmDetailPage } from './pages/FarmDetailPage'
import { PondsListPage } from './pages/PondListPage'
import { PondDetailPage } from './pages/PondDetailPage'

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
      {
        path: '/farms',
        element: <FarmsListPage />,
      },
      {
        path: '/farms/:id',
        element: <FarmDetailPage />,
      },
      {
        path: '/ponds',
        element: <PondsListPage />,
      },
      {
        path: '/ponds/:id',
        element: <PondDetailPage />,
      },
    ],
  },
])
