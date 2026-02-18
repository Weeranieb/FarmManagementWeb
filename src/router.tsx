import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/Dashboard'
import { FarmsListPage } from './pages/FarmListPage'
import { FarmDetailPage } from './pages/FarmDetailPage'
import { PondsListPage } from './pages/PondListPage'
import { PondDetailPage } from './pages/PondDetailPage'
import { MasterDataPage } from './pages/MasterDataPage'
import { AdminMasterDataPage } from './pages/AdminMasterDataPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SuperAdminRoute } from './components/SuperAdminRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // Protected routes with MainLayout
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
      {
        path: '/admin/master-data',
        element: (
          <SuperAdminRoute>
            <AdminMasterDataPage />
          </SuperAdminRoute>
        ),
      },
    ],
  },
])
