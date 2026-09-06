import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
    setResult(null)
    setError('')
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

  const renderList = (title, items) => (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <ul className="list-disc list-inside text-gray-700 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-6 gap-4">
      <h1 className="text-3xl font-bold text-gray-800">AI Resume Reviewer</h1>

      <input
        type="text"
        placeholder="Target job role (e.g. Frontend Developer)"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        className="bg-white p-2 rounded border border-gray-300 w-80"
      />

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="bg-white p-2 rounded border border-gray-300"
      />

      {selectedFile && jobRole.trim() && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      )}

      {error && (
        <p className="text-red-600 bg-red-100 px-4 py-2 rounded">{error}</p>
      )}

      {result && (
        <div className="bg-white p-6 rounded shadow max-w-xl w-full">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">
              {result.filename} — Target: {result.job_role}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {result.analysis.overall_score}/100
            </p>
          </div>

          {renderList('Strengths', result.analysis.strengths)}
          {renderList('Weaknesses', result.analysis.weaknesses)}
          {renderList('Missing Skills', result.analysis.missing_skills)}
          {renderList('ATS Suggestions', result.analysis.ats_suggestions)}
          {renderList('Formatting Suggestions', result.analysis.formatting_suggestions)}
        </div>
      )}
    </div>
  )
}

export default App