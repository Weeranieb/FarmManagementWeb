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

// eslint-disable-next-line react-refresh/only-export-components
export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext)
  if (!ctx) {
    throw new Error('useClient must be used within ClientProvider')
  }
  return ctx
}

/** Parsed positive client id from ClientContext, or undefined. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSelectedClientIdNum(): number | undefined {
  const { selectedClientId } = useClient()
  const n = Number(selectedClientId)
  return selectedClientId && Number.isFinite(n) && n > 0 ? n : undefined
}
