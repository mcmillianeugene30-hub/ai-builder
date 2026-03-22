import Link from 'next/link'

const FEATURES = [
  {
    icon: '⚡',
    title: 'AI-Powered Generation',
    desc: 'Describe your app in plain English. Our AI models generate a complete, production-ready scaffold in seconds.',
  },
  {
    icon: '🎨',
    title: 'Visual Code Editor',
    desc: 'Full Monaco editor with syntax highlighting, multi-file support, and instant preview. Edit every file live.',
  },
  {
    icon: '🚀',
    title: 'One-Click Deploy',
    desc: 'Deploy directly to Vercel with automatic build, SSL, and a live URL — in under 60 seconds.',
  },
  {
    icon: '👥',
    title: 'Real-Time Collaboration',
    desc: 'See your teammates cursors and edits live. Built on Supabase Realtime — no conflicts, no refresh needed.',
  },
  {
    icon: '📁',
    title: 'Asset Management',
    desc: 'Drag-and-drop images, fonts, and assets. They are automatically optimized and served via CDN.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    desc: 'Row-level security, encrypted sessions, and server-side auth. Your code stays yours — always.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Describe your app',
    desc: 'Type a plain-English prompt like "a task manager with users, projects, and comments". Pick the AI model you prefer.',
  },
  {
    num: '02',
    title: 'Review the scaffold',
    desc: 'AI generates frontend components, backend routes, and database tables. Edit any file in the visual editor.',
  },
  {
    num: '03',
    title: 'Deploy to production',
    desc: 'Hit Deploy. Vercel builds your app, provisions SSL, and gives you a shareable live URL — instantly.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#010409] text-[#e6edf3]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            ⚡
          </div>
          <span className="font-bold text-lg text-white">AI Builder</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#8b949e] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-8 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-purple-600/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Now with multi-model AI support
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build apps with AI,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              deploy to production
            </span>
          </h1>

          <p className="text-xl text-[#8b949e] max-w-2xl mx-auto mb-12 leading-relaxed">
            Describe your app in plain English. AI generates a complete scaffold —
            code editor, live preview, real-time collaboration, and one-click Vercel deploy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start building free →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-[#161b22] hover:bg-[#1f2937] text-[#e6edf3] border border-[#30363d] rounded-xl font-semibold text-lg transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Code preview mockup */}
          <div className="mt-16 rounded-2xl border border-[#30363d] bg-[#161b22] overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#30363d] bg-[#0d1117]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-[#484f58]">AI Builder — preview</span>
            </div>
            <div className="grid grid-cols-3 h-[260px]">
              {/* File tree */}
              <div className="border-r border-[#21262d] p-4 bg-[#0d1117]">
                <p className="text-xs text-[#484f58] uppercase tracking-wider mb-3">Explorer</p>
                {['📄 index.html', '🎨 style.css', '📄 app.js', '{} package.json'].map((f, i) => (
                  <p key={i} className={`text-sm mb-2 ${i === 0 ? 'text-white' : 'text-[#8b949e]'}`}>{f}</p>
                ))}
                <p className="text-xs text-[#484f58] uppercase tracking-wider mt-5 mb-3">Assets</p>
                {['🖼 logo.png', '📄 favicon.ico'].map((f, i) => (
                  <p key={i} className="text-sm mb-2 text-[#8b949e]">{f}</p>
                ))}
              </div>
              {/* Editor */}
              <div className="col-span-2 p-5 bg-[#1e1e1e]">
                <p className="text-xs text-[#484f58] mb-2">index.html — AI Generated</p>
                <div className="font-mono text-sm text-[#c9d1d9] leading-relaxed">
                  <p><span className="text-pink-400">&lt;header&gt;</span></p>
                  <p className="pl-4"><span className="text-pink-400">&lt;h1&gt;</span> Task Manager <span className="text-pink-400">&lt;/h1&gt;</span></p>
                  <p className="pl-4"><span className="text-pink-400">&lt;p&gt;</span> Built with AI Builder <span className="text-pink-400">&lt;/p&gt;</span></p>
                  <p><span className="text-pink-400">&lt;/header&gt;</span></p>
                  <p className="text-[#484f58] mt-2">// Backend routes: GET /tasks, POST /tasks</p>
                  <p className="text-[#484f58]">// DB tables: tasks, users, comments</p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">● Deploy ready</span>
                  <span className="text-xs text-[#484f58]">v1 generated 2m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#21262d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-3 divide-x divide-[#21262d]">
          {[
            { value: '4', label: 'AI Models', sub: 'OpenAI · Groq · OpenRouter · Gemini' },
            { value: '≤60s', label: 'Deploy Time', sub: 'From prompt to live URL' },
            { value: '100%', label: 'Open Output', sub: 'You own every file generated' },
          ].map((s) => (
            <div key={s.label} className="text-center px-8">
              <p className="text-4xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-[#e6edf3] mb-1">{s.label}</p>
              <p className="text-xs text-[#484f58]">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need to ship
          </h2>
          <p className="text-lg text-[#8b949e]">
            From idea to production URL in one workflow — no setup, no config, no cloud fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border border-[#21262d] bg-[#161b22] hover:border-indigo-500/40 transition-colors group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#21262d] bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-lg text-[#8b949e]">Three steps from idea to production.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
                )}
                <div className="text-6xl font-bold text-[#21262d] mb-4">{s.num}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-[#8b949e] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#21262d]">
        <div className="max-w-3xl mx-auto px-8 py-24 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to ship your app?
          </h2>
          <p className="text-xl text-[#8b949e] mb-10">
            Free to start. No credit card required. Generate, edit, and deploy in seconds.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white text-xs">
              ⚡
            </div>
            <span className="text-sm text-[#484f58]">AI Builder — Built with Next.js, Supabase, and Vercel</span>
          </div>
          <p className="text-xs text-[#484f58]">
            &copy; {new Date().getFullYear()} AI Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
