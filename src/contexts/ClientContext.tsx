import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type ClientContextValue = {
  selectedClientId: string
  setSelectedClientId: (id: string) => void
}

const ClientContext = createContext<ClientContextValue | null>(null)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClientId, setSelectedClientIdState] = useState<string>('')
  const setSelectedClientId = useCallback((id: string) => {
    setSelectedClientIdState(id)
  }, [])
  return (
    <ClientContext.Provider value={{ selectedClientId, setSelectedClientId }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext)
  if (!ctx) {
    throw new Error('useClient must be used within ClientProvider')
  }
  return ctx
}
