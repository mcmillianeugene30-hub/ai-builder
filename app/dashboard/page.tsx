'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { GenerateModal } from '@/components/generate/GenerateModal'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const json = await res.json()
      if (json.data) setProjects(json.data)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      })
      const json = await res.json()
      if (json.data) {
        setProjects((prev) => [json.data, ...prev])
        setShowNewProject(false)
        setNewName('')
        setNewDesc('')
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Build and manage your AI-generated apps
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowNewProject(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: 6,
              color: '#c9d1d9',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            New Blank Project
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            style={{
              padding: '0.5rem 1rem',
              background: '#6366f1',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            ⚡ Generate App
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading projects…
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          border: '2px dashed #30363d',
          borderRadius: 12,
          color: '#666',
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No projects yet</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Generate an app with AI or create a blank project
          </p>
          <button
            onClick={() => setShowGenerate(true)}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#6366f1',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Generate your first app →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {projects.map((project) => (
            <div key={project.id} style={{
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: '1rem',
              background: '#161b22',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <Link
                  href={`/editor?projectId=${project.id}`}
                  style={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#6366f1',
                    textDecoration: 'none',
                  }}
                >
                  {project.name}
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#484f58',
                    fontSize: '0.8rem',
                    padding: '0.25rem',
                  }}
                >
                  Delete
                </button>
              </div>
              <p style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {project.description || 'No description'}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#484f58' }}>
                <span>{project.files.length} files</span>
                <span>Updated {formatRelativeTime(project.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <form
            onSubmit={handleCreateProject}
            style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 12,
              padding: '2rem',
              maxWidth: 440,
              width: '100%',
            }}
          >
            <h2 style={{ color: '#f0f6fc', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              New Blank Project
            </h2>
            <input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                marginBottom: '0.75rem',
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#c9d1d9',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                marginBottom: '1rem',
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#c9d1d9',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#c9d1d9',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#238636',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: creating ? 0.6 : 1,
                }}
              >
                {creating ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
