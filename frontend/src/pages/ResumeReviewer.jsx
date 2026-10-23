import { useState } from 'react'
import ImproveText from '../components/ImproveText'
import LoadingSpinner from '../LoadingSpinner3D'
import AnalyzingStatus from '../components/AnalyzingStatus'
import ScoreCircle from '../components/ScoreCircle'
import { authenticatedApiFetch } from '../authenticatedApi'
import { requestJobMatch } from '../jobMatchApi'
import { Sparkles, AlertTriangle, Target, Bot, PenLine, FileCheck2, CheckCircle2, XCircle, Tags } from 'lucide-react'

function ResumeReviewer() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [jobDescription, setJobDescription] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState('')

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
      const response = await authenticatedApiFetch('/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Unable to analyze this resume. Please try again.')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze this resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!selectedFile || !jobDescription.trim()) return
    setMatchLoading(true)
    setMatchResult(null)
    setMatchError('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('job_description', jobDescription)

    try {
      const data = await requestJobMatch(formData, authenticatedApiFetch)
      setMatchResult(data)
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : 'Unable to check the job match. Please try again.')
    } finally {
      setMatchLoading(false)
    }
  }

  const renderCard = (title, Icon, items, color) => (
    <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-xl shadow p-5 mb-4 hover:-translate-y-0.5 transition-transform">
      <h3 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-3">
        <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} /> {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`text-sm px-3 py-2 rounded-lg bg-${color}-50 dark:bg-${color}-950/30 text-gray-700 dark:text-slate-300`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-6 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 dark:text-white text-center mb-8">
          Upload Your Resume
        </h1>

        <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-xl p-8 mb-8">
          <input
            type="text"
            placeholder="Target job role (e.g. Frontend Developer)"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full mb-4 bg-gray-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 p-3 rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            selectedFile
              ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-600'
              : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <>
                <FileCheck2 className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-2" />
                <p className="text-gray-700 dark:text-slate-200 font-medium">{selectedFile.name}</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 dark:text-slate-400">Drop your PDF or DOCX here</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">or click to Choose File</p>
              </>
            )}
          </label>
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-2">PDF / DOCX supported</p>

          {selectedFile && jobRole.trim() && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full mt-6 bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-900/30 transition-all disabled:bg-gray-400 disabled:hover:shadow-none"
            >
              Analyze My Resume
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-xl p-8">
            <LoadingSpinner />
            <AnalyzingStatus />
          </div>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-4 py-3 rounded-lg text-center">{error}</p>
        )}

        {result && (
          <div>
            <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-xl p-8 text-center mb-6 flex flex-col items-center">
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">{result.filename} — Target: {result.job_role}</p>
              <ScoreCircle score={result.analysis.overall_score} />
            </div>

            {renderCard('Strengths', Sparkles, result.analysis.strengths, 'green')}
            {renderCard('Areas to Improve', AlertTriangle, result.analysis.weaknesses, 'yellow')}
            {renderCard('Missing Skills', Target, result.analysis.missing_skills, 'orange')}
            {renderCard('ATS Suggestions', Bot, result.analysis.ats_suggestions, 'blue')}
            {renderCard('Formatting Suggestions', PenLine, result.analysis.formatting_suggestions, 'teal')}

            <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-xl p-8 mt-6">
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-3">
                <Tags className="w-4 h-4 text-blue-600 dark:text-blue-400" /> How well does your resume match this job?
              </h3>
              <textarea
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-32 bg-gray-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 p-3 rounded-lg border border-gray-200 dark:border-slate-600 mb-3"
              />
              <button
                onClick={handleMatch}
                disabled={matchLoading || !jobDescription.trim()}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
              >
                {matchLoading ? 'Checking...' : 'Check Match'}
              </button>

              {matchError && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {matchError}
                </p>
              )}

              {matchResult && (
                <div className="mt-6">
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-400 mb-4">{matchResult.match_percentage}% Match</p>

                  <p className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-slate-300 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> Matching Skills
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchResult.matching_skills.map((s, i) => (
                      <span key={i} className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>

                  <p className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-slate-300 mb-1">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchResult.missing_skills.map((s, i) => (
                      <span key={i} className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>

                  <p className="font-medium text-gray-700 dark:text-slate-300 mb-1">Recommended Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.recommended_keywords.map((s, i) => (
                      <span key={i} className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full">{s}</span>
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