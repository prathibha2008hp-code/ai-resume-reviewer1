import { useState, useEffect } from 'react'

function ScoreCircle({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    let current = 0
    const target = score
    const step = () => {
      current += Math.ceil((target - current) / 10) || (target > current ? 1 : 0)
      if (current >= target) {
        setAnimatedScore(target)
        return
      }
      setAnimatedScore(current)
      requestAnimationFrame(step)
    }
    const timeout = setTimeout(step, 100)
    return () => clearTimeout(timeout)
  }, [score])

  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f97316' : '#dc2626'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle
          cx="80" cy="80" r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold text-gray-800">{animatedScore}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  )
}

export default ScoreCircle