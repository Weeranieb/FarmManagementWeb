import { useState, type FormEvent } from 'react'
import { useLoginMutation, getRememberedUsername } from '../../../hooks/useAuth'

export function useLoginPage() {
  const remembered = getRememberedUsername()
  const [username, setUsername] = useState(remembered || '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(!!remembered)
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLoginMutation()

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
