import { useState, useEffect } from 'react'

const messages = [
  'Reading your resume...',
  'Checking ATS compatibility...',
  'Analyzing your skills...',
  'Finding improvement opportunities...',
  'Preparing your personalized report...',
]

function AnalyzingStatus() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return <p className="text-gray-600 mt-2">{messages[index]}</p>
}

export default AnalyzingStatus