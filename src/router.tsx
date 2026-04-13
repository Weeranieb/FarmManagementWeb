import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/Dashboard'
import { FarmsListPage } from './pages/FarmListPage'
import { FarmDetailPage } from './pages/FarmDetailPage'
import { PondsListPage } from './pages/PondListPage'
import { PondDetailPage } from './pages/PondDetailPage'
import { MerchantsListPage } from './pages/MerchantsListPage'
import { AdminMasterDataPage } from './pages/AdminMasterDataPage'
import { FarmGroupsListPage } from './pages/FarmGroupsListPage'
import { FarmGroupFormPage } from './pages/FarmGroupFormPage'
import { WorkersListPage } from './pages/WorkersListPage'
import { WorkerFormPage } from './pages/WorkerFormPage'
import { FeedCollectionsPage } from './pages/FeedCollectionsPage'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { GuestRoute } from './components/guards/GuestRoute'
import { SuperAdminRoute } from './components/guards/SuperAdminRoute'
import { th } from './locales/th'

const FeedPriceHistoryPage = lazy(() =>
  import('./pages/FeedPriceHistoryPage').then((m) => ({
    default: m.FeedPriceHistoryPage,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
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
        path: '/farm-groups',
        element: <FarmGroupsListPage />,
      },
      {
        path: '/farm-groups/new',
        element: <FarmGroupFormPage />,
      },
      {
        path: '/farm-groups/:id/edit',
        element: <FarmGroupFormPage />,
      },
      {
        path: '/workers',
        element: <WorkersListPage />,
      },
      {
        path: '/workers/new',
        element: <WorkerFormPage />,
      },
      {
        path: '/workers/:id/edit',
        element: <WorkerFormPage />,
      },
      {
        path: '/merchants',
        element: <MerchantsListPage />,
      },
      {
        path: '/feed-collections',
        element: <FeedCollectionsPage />,
      },
      {
        path: '/feed-collections/:id/history',
        element: (
          <Suspense
            fallback={
              <div className='p-8 text-center text-slate-500'>
                {th.common.loading}
              </div>
            }
          >
            <FeedPriceHistoryPage />
          </Suspense>
        ),
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
