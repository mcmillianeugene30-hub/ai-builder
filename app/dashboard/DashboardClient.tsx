'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { useErrorHandler } from '@/lib/use-error-handler'

interface DashboardClientProps {
  userId: string
  userEmail: string
  initialProjects: Project[]
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Failed to create project')
      onCreated(json.data.id)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d',
        borderRadius: 12, padding: 32, width: 440, maxWidth: '90vw',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 24px', color: '#f0f6fc', fontSize: 20, fontWeight: 700 }}>
          New Project
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
              Project Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome App"
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: 14,
                background: '#0d1117', border: '1px solid #30363d',
                borderRadius: 6, color: '#f0f6fc', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your app..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', fontSize: 14,
                background: '#0d1117', border: '1px solid #30363d',
                borderRadius: 6, color: '#f0f6fc', boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 20px', fontSize: 14, background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '10px 20px', fontSize: 14, background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DashboardClient({ userId, userEmail, initialProjects }: DashboardClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showModal, setShowModal] = useState(false)

  function handleProjectCreated(projectId: string) {
    setShowModal(false)
    window.location.href = `/editor?projectId=${projectId}`
  }

  const recent = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const totalFiles = projects.reduce((sum, p) => sum + (p.files?.length ?? 0), 0)

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '40px 40px 0', borderBottom: '1px solid #21262d', paddingBottom: 32 }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dashboard
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          Welcome back, {userEmail.split('@')[0]}
        </h1>
      </div>

      <div style={{ padding: 32, maxWidth: 1200 }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'Total Files', value: totalFiles },
            { label: 'Last Active', value: projects[0] ? new Date(projects[0].updated_at).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#6366f1' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#8b949e', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Projects section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Recent Projects</h2>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: '8px 20px', fontSize: 14, background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: '#161b22', border: '1px solid #30363d', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>No projects yet</h3>
            <p style={{ margin: '0 0 24px', color: '#8b949e', fontSize: 15 }}>
              Create your first project and start building with AI.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{ padding: '10px 24px', fontSize: 15, background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Create your first project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {recent.map((project) => (
              <div key={project.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, wordBreak: 'break-word' }}>
                    {project.name}
                  </h3>
                </div>
                {project.description && (
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8b949e', lineHeight: 1.5 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ fontSize: 12, color: '#6e7681', marginBottom: 16 }}>
                  {project.files?.length ?? 0} files &middot; Updated {new Date(project.updated_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/editor?projectId=${project.id}`}
                    style={{ padding: '6px 14px', fontSize: 13, background: '#238636', borderRadius: 6, color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
                    Open Editor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </main>
  )
}
