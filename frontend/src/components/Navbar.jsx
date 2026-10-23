import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [authActionError, setAuthActionError] = useState('')
  const { dark, setDark } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    setSigningOut(true)
    setAuthActionError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setAuthActionError(error.message || 'Unable to log out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <nav className="sticky top-0 bg-white dark:bg-slate-900 shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-slate-800 dark:text-white">
          ResumAI India
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Home</Link>
          <Link to="/ai-resume-reviewer" className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">AI Resume Reviewer</Link>
          <Link to="/ats-resume-checker" className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">ATS Checker</Link>
          <Link to="/how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">How It Works</Link>
          <Link to="/resume-tips" className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Resume Tips</Link>

          <button onClick={() => setDark(!dark)} className="text-xl">
            {dark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm font-medium text-slate-700 hover:text-blue-900 disabled:opacity-60 dark:text-slate-300 dark:hover:text-white"
            >
              {signingOut ? 'Logging out...' : 'Log out'}
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white">
                Log in
              </Link>
              <Link to="/signup" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-600 hover:text-teal-700 dark:border-slate-600 dark:text-slate-200">
                Sign up
              </Link>
            </>
          )}

          <Link
            to="/ai-resume-reviewer"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Review My Resume
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={() => setDark(!dark)} className="text-xl">
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="text-2xl dark:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-6 pb-4 dark:text-gray-300">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/ai-resume-reviewer" onClick={() => setMenuOpen(false)}>AI Resume Reviewer</Link>
          <Link to="/ats-resume-checker" onClick={() => setMenuOpen(false)}>ATS Checker</Link>
          <Link to="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link to="/resume-tips" onClick={() => setMenuOpen(false)}>Resume Tips</Link>
          {user ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                handleSignOut()
              }}
              disabled={signingOut}
              className="text-left disabled:opacity-60"
            >
              {signingOut ? 'Logging out...' : 'Log out'}
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Create account</Link>
            </>
          )}
        </div>
      )}
      {authActionError && (
        <p role="alert" className="bg-red-50 px-6 py-2 text-center text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {authActionError}
        </p>
      )}
    </nav>
  )
}

export default Navbar