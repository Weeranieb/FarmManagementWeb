import { useState, useEffect, type FormEvent } from 'react'
import { useLoginMutation, getRememberedUsername } from '../../../hooks/useAuth'

export function useLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLoginMutation()

  useEffect(() => {
    const remembered = getRememberedUsername()
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password, rememberMe })
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    loginMutation,
    handleSubmit,
  }
}
