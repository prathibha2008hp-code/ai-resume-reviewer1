import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [uploadResult, setUploadResult] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !jobRole.trim()) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('job_role', jobRole)

    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setUploadResult(data)
  }

  return (
    <div className="App bg-blue-100 min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">AI Resume Reviewer</h1>

      <input
        type="text"
        placeholder="Target job role (e.g. Frontend Developer)"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        className="bg-white p-2 rounded border border-gray-300 w-72"
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Resume
        </button>
      )}

      {uploadResult && (
        <div className="text-center bg-white p-4 rounded shadow max-w-md">
          <p className="font-semibold">{uploadResult.filename}</p>
          <p className="text-sm text-gray-600">Target role: {uploadResult.job_role}</p>
          <p className="text-sm text-gray-600">Extracted {uploadResult.text_length} characters</p>
          <p className="text-sm text-gray-800 mt-2 text-left whitespace-pre-wrap">{uploadResult.preview}...</p>
        </div>
      )}
    </div>
  )
}

export default App