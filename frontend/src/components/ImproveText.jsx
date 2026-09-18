import { useState } from 'react'

function ImproveText() {
  const [text, setText] = useState('')
  const [improved, setImproved] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImprove = async () => {
    if (!text.trim()) return
    setLoading(true)
    setImproved('')

    const formData = new FormData()
    formData.append('original_text', text)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/improve`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setImproved(data.improved)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(improved)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
      <h3 className="font-semibold text-gray-800 mb-4">Improve Your Resume</h3>

      <textarea
        placeholder='e.g. "Worked on a Python project."'
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-20 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3"
      />

      <button
        onClick={handleImprove}
        disabled={loading || !text.trim()}
        className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Improving...' : 'Improve This Line'}
      </button>

      {improved && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-600 mb-2">BEFORE</p>
            <p className="text-sm text-gray-700">{text}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-green-700 mb-2">AI SUGGESTED</p>
            <p className="text-sm text-gray-700 mb-3">{improved}</p>
            <button
              onClick={handleCopy}
              className="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImproveText