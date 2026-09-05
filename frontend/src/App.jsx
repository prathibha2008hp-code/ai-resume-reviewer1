import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setUploadResult(data)
  }

  return (
    <div className="App bg-blue-100 min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">AI Resume Reviewer</h1>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="bg-white p-2 rounded border border-gray-300"
      />

      {selectedFile && (
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Resume
        </button>
      )}

      {uploadResult && (
        <div className="text-center bg-white p-4 rounded shadow">
          <p>Filename: {uploadResult.filename}</p>
          <p>Type: {uploadResult.content_type}</p>
          <p>Size: {uploadResult.size_kb} KB</p>
        </div>
      )}
    </div>
  )
}

export default App