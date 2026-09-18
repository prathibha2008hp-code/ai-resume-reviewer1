import { Link } from 'react-router-dom'

function ATSChecker() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-950 mb-4">ATS Resume Checker</h1>
      <p className="text-gray-600 mb-6">
        Applicant Tracking Systems (ATS) scan your resume before a human ever sees it.
        Our AI checks your resume for ATS compatibility — formatting, keywords, and
        structure — so you don't get filtered out before you even get a chance.
      </p>
      <Link to="/ai-resume-reviewer" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Check My Resume
      </Link>
    </div>
  )
}

export default ATSChecker