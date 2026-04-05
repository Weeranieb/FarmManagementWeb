import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ClientProvider } from './contexts/ClientContext'
import { AppToastProvider } from './contexts/AppToastContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppToastProvider>
        <ClientProvider>
          <RouterProvider router={router} />
        </ClientProvider>
      </AppToastProvider>
    </QueryClientProvider>
  )
}

export default App
