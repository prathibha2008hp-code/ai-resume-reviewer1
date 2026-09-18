import { Link } from 'react-router-dom'

function ResumeFreshers() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-950 mb-4">Resume Reviewer for Freshers</h1>
      <p className="text-gray-600 mb-6">
        Starting your career in India? Our AI resume reviewer is built specifically
        for freshers and engineering graduates with little to no work experience.
        Get instant feedback on how to present your projects, coursework, and skills
        in a way that stands out to recruiters and passes ATS filters.
      </p>
      <ul className="list-disc list-inside text-gray-600 mb-8 space-y-2">
        <li>Highlight academic projects effectively</li>
        <li>Structure a resume with no prior job experience</li>
        <li>Identify in-demand skills for entry-level roles</li>
      </ul>
      <Link to="/ai-resume-reviewer" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Review My Resume
      </Link>
    </div>
  )
}

export default ResumeFreshers