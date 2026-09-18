import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ResumeReviewer from './pages/ResumeReviewer'
import ATSChecker from './pages/ATSChecker'
import HowItWorks from './pages/HowItWorks'
import ResumeTips from './pages/ResumeTips'
import ResumeFreshers from './pages/ResumeFreshers'
import ResumeIndia from './pages/ResumeIndia'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="dark:bg-slate-900 min-h-screen transition-colors">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-resume-reviewer" element={<ResumeReviewer />} />
            <Route path="/ats-resume-checker" element={<ATSChecker />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/resume-tips" element={<ResumeTips />} />
            <Route path="/resume-reviewer-for-freshers" element={<ResumeFreshers />} />
            <Route path="/resume-reviewer-india" element={<ResumeIndia />} />
          </Routes>
          <Footer />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App