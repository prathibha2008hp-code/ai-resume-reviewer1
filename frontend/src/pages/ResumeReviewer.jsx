import { useState } from 'react'
import ImproveText from '../components/ImproveText'
import LoadingSpinner from '../LoadingSpinner3D'
import AnalyzingStatus from '../components/AnalyzingStatus'
import ScoreCircle from '../components/ScoreCircle'

function ResumeReviewer() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [jobDescription, setJobDescription] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
    setResult(null)
    setError('')
    setMatchResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !jobRole.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('job_role', jobRole)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Something went wrong')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!selectedFile || !jobDescription.trim()) return
    setMatchLoading(true)
    setMatchResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('job_description', jobDescription)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/match`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setMatchResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setMatchLoading(false)
    }
  }

  const renderCard = (title, icon, items, color) => (
    <div className="bg-white rounded-xl shadow p-5 mb-4">
      <h3 className="font-semibold text-gray-800 mb-3">{icon} {title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`text-sm px-3 py-2 rounded-lg bg-${color}-50 text-gray-700`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 text-center mb-8">
          Upload Your Resume
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <input
            type="text"
            placeholder="Target job role (e.g. Frontend Developer)"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <p className="text-gray-700 font-medium">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-gray-500">Drop your PDF or DOCX here</p>
                <p className="text-sm text-gray-400 mt-1">or click to Choose File</p>
              </>
            )}
          </label>
          <p className="text-xs text-gray-400 text-center mt-2">PDF / DOCX supported</p>

          {selectedFile && jobRole.trim() && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full mt-6 bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-400"
            >
              Analyze My Resume
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl p-8">
            <LoadingSpinner />
            <AnalyzingStatus />
          </div>
        )}

        {error && (
          <p className="text-red-600 bg-red-100 px-4 py-3 rounded-lg text-center">{error}</p>
        )}

        {result && (
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6 flex flex-col items-center">
              <p className="text-gray-500 text-sm mb-4">{result.filename} — Target: {result.job_role}</p>
              <ScoreCircle score={result.analysis.overall_score} />
            </div>

            {renderCard('Strengths', '✨', result.analysis.strengths, 'green')}
            {renderCard('Areas to Improve', '⚠️', result.analysis.weaknesses, 'yellow')}
            {renderCard('Missing Skills', '🎯', result.analysis.missing_skills, 'orange')}
            {renderCard('ATS Suggestions', '🤖', result.analysis.ats_suggestions, 'blue')}
            {renderCard('Formatting Suggestions', '✍️', result.analysis.formatting_suggestions, 'teal')}

            <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">How well does your resume match this job?</h3>
              <textarea
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-32 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
              />
              <button
                onClick={handleMatch}
                disabled={matchLoading || !jobDescription.trim()}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
              >
                {matchLoading ? 'Checking...' : 'Check Match'}
              </button>

              {matchResult && (
                <div className="mt-6">
                  <p className="text-3xl font-bold text-teal-700 mb-4">{matchResult.match_percentage}% Match</p>

                  <p className="font-medium text-gray-700 mb-1">Matching Skills</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchResult.matching_skills.map((s, i) => (
                      <span key={i} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>

                  <p className="font-medium text-gray-700 mb-1">Missing Skills</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchResult.missing_skills.map((s, i) => (
                      <span key={i} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>

                  <p className="font-medium text-gray-700 mb-1">Recommended Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.recommended_keywords.map((s, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeReviewer