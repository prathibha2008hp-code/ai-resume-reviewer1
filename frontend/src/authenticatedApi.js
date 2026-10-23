import { supabase } from './supabase'

export async function authenticatedApiFetch(path, options = {}) {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.access_token) {
    throw new Error('Your session has expired. Please sign in again.')
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
  })

  if (response.status === 401) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
    if (signOutError) {
      throw new Error('Your session is no longer valid. Please sign out and sign in again.')
    }
    throw new Error('Your session has expired. Please sign in again.')
  }

  return response
}
