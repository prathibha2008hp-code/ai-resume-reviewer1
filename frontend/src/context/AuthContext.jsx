import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isMounted = true
    let receivedAuthEvent = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true
      if (isMounted) {
        setSession(nextSession)
        setAuthError('')
        setLoading(false)
      }
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error && !receivedAuthEvent) {
          setAuthError(error.message)
        } else if (!receivedAuthEvent) {
          setSession(data.session)
        }
        setLoading(false)
      })
      .catch((error) => {
        if (!isMounted) return
        setAuthError(error.message || 'Unable to restore your session.')
        setLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, fullName) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (!result.error) {
      setSession(result.data.session)
      setAuthError('')
    }
    return result
  }

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error) {
      setSession(result.data.session)
      setAuthError('')
    }
    return result
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        authError,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
