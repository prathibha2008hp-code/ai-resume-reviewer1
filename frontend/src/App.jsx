import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')

  const testBackend = async () => {
    const response = await fetch('http://127.0.0.1:8000/')
    const data = await response.json()
    setMessage(data.message)
  }

  return (
    <div className="App bg-blue-100 min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">AI Resume Reviewer</h1>
      <button
        onClick={testBackend}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Test Backend Connection
      </button>
      {message && <p className="text-lg">{message}</p>}
    </div>
  )
}

export default App