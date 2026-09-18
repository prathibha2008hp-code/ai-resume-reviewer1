

import { Link } from 'react-router-dom'

function ResumeTips() {
  const tips = [
    'Use action verbs like "Built," "Led," "Improved" instead of "Worked on."',
    'Quantify results wherever possible (e.g. "Reduced load time by 30%").',
    'Keep your resume to one page if you have under 3 years of experience.',
    'List technical skills in a dedicated, ATS-friendly section.',
    'Avoid tables, images, and columns that ATS software can\'t parse.',
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-950 mb-6">Resume Tips</h1>
      <ul className="space-y-4 mb-8">
        {tips.map((tip, i) => (
          <li key={i} className="bg-gray-50 p-4 rounded-lg text-gray-700">{tip}</li>
        ))}
      </ul>
      <Link to="/ai-resume-reviewer" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Review My Resume
      </Link>
    </div>
  )
}

export default ResumeTips