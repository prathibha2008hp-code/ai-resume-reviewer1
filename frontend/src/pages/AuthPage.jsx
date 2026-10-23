import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, FileCheck2, LoaderCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthPage({ mode }) {
  const isSignUp = mode === 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const normalizedEmail = email.trim()
    const normalizedName = fullName.trim()

    if (isSignUp && !normalizedName) {
      setError('Enter your full name to create an account.')
      return
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: authRequestError } = isSignUp
        ? await signUp(normalizedEmail, password, normalizedName)
        : await signIn(normalizedEmail, password)

      if (authRequestError) throw authRequestError

      if (isSignUp && !data.session) {
        setMessage('Your account was created. Check your email for a verification link, then log in to continue.')
        return
      }

      const destination = location.state?.from?.pathname || '/ai-resume-reviewer'
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-950/10 dark:border dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 p-10 text-white md:flex">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
              <FileCheck2 className="h-5 w-5" />
            </span>
            ResumAI India
          </Link>
          <div className="py-12">
            <div className="mb-5 inline-flex rounded-full bg-white/10 p-3">
              <Sparkles className="h-6 w-6 text-teal-200" />
            </div>
            <h1 className="text-3xl font-bold leading-tight">
              Make your next opportunity count.
            </h1>
            <p className="mt-4 leading-7 text-blue-100">
              Get thoughtful AI feedback on your resume, discover missing skills,
              and see how you match the role you want.
            </p>
          </div>
          <p className="text-sm text-blue-100/80">A clearer next step starts here.</p>
        </section>

        <section className="px-6 py-9 sm:px-10 sm:py-12">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-semibold text-blue-950 dark:text-white md:hidden">
            <FileCheck2 className="h-5 w-5 text-teal-600" />
            ResumAI India
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400">
            {isSignUp ? 'Start for free' : 'Welcome back'}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-blue-950 dark:text-white">
            {isSignUp ? 'Create your account' : 'Log in to your account'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {isSignUp
              ? 'Save time and get personalized feedback on your resume.'
              : 'Pick up where you left off with your resume review.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Full name
                </label>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}

            {(error || authError) && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error || `Unable to restore your session: ${authError}`}
              </p>
            )}
            {message && (
              <p role="status" className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Login'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600 dark:text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link
              to={isSignUp ? '/login' : '/signup'}
              className="font-semibold text-blue-800 hover:text-teal-700 dark:text-teal-400"
            >
              {isSignUp ? 'Log in' : 'Create one'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
