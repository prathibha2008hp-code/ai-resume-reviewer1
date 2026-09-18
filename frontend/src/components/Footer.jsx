import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-blue-950 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">ResumAI India</h3>
          <p className="text-sm">
            AI-powered resume improvement for India's next generation of professionals.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/ai-resume-reviewer" className="hover:text-white">AI Resume Reviewer</Link></li>
            <li><Link to="/ats-resume-checker" className="hover:text-white">ATS Checker</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/resume-tips" className="hover:text-white">Resume Tips</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 pb-6">
        © {new Date().getFullYear()} ResumAI India. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer