import { Link } from 'react-router-dom'

function ResumeIndia() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-950 mb-4">Resume Reviewer in India</h1>
      <p className="text-gray-600 mb-6">
        Built for the Indian job market — our AI understands the resume expectations
        of Indian recruiters, IT companies, and ATS systems used across the country's
        tech and non-tech hiring pipelines.
      </p>
      <ul className="list-disc list-inside text-gray-600 mb-8 space-y-2">
        <li>Optimized for Indian ATS and recruiter expectations</li>
        <li>Guidance for IT, engineering, and non-tech roles</li>
        <li>Free to use, no signup required</li>
      </ul>
      <Link to="/ai-resume-reviewer" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Review My Resume
      </Link>
    </div>
  )
}

export default ResumeIndia