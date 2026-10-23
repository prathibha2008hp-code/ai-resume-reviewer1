import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ResumeReviewer from './pages/ResumeReviewer'
import ATSChecker from './pages/ATSChecker'
import HowItWorks from './pages/HowItWorks'
import ResumeTips from './pages/ResumeTips'
import ResumeFreshers from './pages/ResumeFreshers'
import ResumeIndia from './pages/ResumeIndia'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600 dark:text-slate-300" role="status">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-800" />
        Restoring your session...
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace state={{ from: location }} />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="dark:bg-slate-900 min-h-screen transition-colors">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/ai-resume-reviewer"
                element={<ProtectedRoute><ResumeReviewer /></ProtectedRoute>}
              />
              <Route path="/ats-resume-checker" element={<ATSChecker />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/resume-tips" element={<ResumeTips />} />
              <Route path="/resume-reviewer-for-freshers" element={<ResumeFreshers />} />
              <Route path="/resume-reviewer-india" element={<ResumeIndia />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App