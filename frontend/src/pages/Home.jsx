import { Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Sparkles, Target, Bot, Upload, ScanSearch, TrendingUp } from 'lucide-react'

const HeroVisual3D = lazy(() => import('../components/HeroVisual3D'))

function Home() {
  return (
    <div className="bg-white dark:bg-slate-900 transition-colors">
      {/* HERO SECTION */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center overflow-hidden">
        {/* soft gradient glow behind hero */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-200/40 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
            Built for students, freshers & job seekers in India
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-blue-950 dark:text-white leading-tight mb-6">
            Build a Resume That{' '}
            <span className="bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-transparent">
              Gets Noticed.
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-slate-300 mb-8">
            AI-powered resume review, ATS analysis, and job matching designed
            for Indian students and job seekers.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/ai-resume-reviewer"
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all"
            >
              Review My Resume
            </Link>
            <Link
              to="/how-it-works"
              className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            >
              See How It Works
            </Link>
          </div>
        </div>

        <Suspense fallback={<div className="h-80" />}>
          <HeroVisual3D />
        </Suspense>
      </section>

      {/* TRUST / STATS STRIP */}
      <section className="border-y border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300">10,000+</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Resumes reviewed</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-teal-700 dark:text-teal-300">92%</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Users improved ATS score</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-300">Free</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Always, for students</p>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW SECTION */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-black/40 p-8 md:p-10 border border-transparent dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-6 text-center hover:-translate-y-1 transition-transform">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Resume Score</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">82/100</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/40 rounded-xl p-6 text-center hover:-translate-y-1 transition-transform">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">ATS Score</p>
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">88%</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-6 text-center hover:-translate-y-1 transition-transform">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Job Match</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-300">78%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Strengths
                </h4>
                <ul className="text-gray-600 dark:text-slate-400 space-y-1">
                  <li>Strong project experience</li>
                  <li>Clear technical skills section</li>
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-2">
                  <Target className="w-4 h-4 text-orange-500 dark:text-orange-400" /> Missing Skills
                </h4>
                <ul className="text-gray-600 dark:text-slate-400 space-y-1">
                  <li>SQL / Databases</li>
                  <li>Cloud platforms (AWS/Azure)</li>
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100 mb-2">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" /> ATS Suggestions
                </h4>
                <ul className="text-gray-600 dark:text-slate-400 space-y-1">
                  <li>Add measurable achievements</li>
                  <li>Use standard section headings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-blue-950 dark:text-white mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-orange-500 mb-1">STEP 01</p>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-100 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Upload PDF or DOCX.</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ScanSearch className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-orange-500 mb-1">STEP 02</p>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-100 mb-2">AI Analyzes It</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Our AI examines your resume structure, skills, experience, keywords
                and ATS compatibility.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <p className="text-sm font-semibold text-orange-500 mb-1">STEP 03</p>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-100 mb-2">Improve & Apply</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Get actionable suggestions to make your resume stronger.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home