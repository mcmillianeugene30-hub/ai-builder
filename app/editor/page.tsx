'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEditor, EditorProvider } from '@/lib/editor-store'
import { useAutosave } from '@/lib/use-autosave'
import { useRealtime } from '@/lib/use-realtime'
import { useErrorHandler } from '@/lib/use-error-handler'
import { FileExplorer } from '@/components/editor/FileExplorer'
import { FileTabs } from '@/components/editor/FileTabs'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { SaveStatus } from '@/components/editor/SaveStatus'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { DeployButton } from '@/components/deploy/DeployButton'
import { DeploymentHistory } from '@/components/deploy/DeploymentHistory'
import { AssetUploader } from '@/components/storage/AssetUploader'
import { AssetList } from '@/components/storage/AssetList'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Project, StoredAsset } from '@/lib/types'

// ── Top bar ─────────────────────────────────────────────────────────────────

function EditorTopBar({ projectId }: { projectId: string }) {
  const { project } = useEditor()
  const { collaborators, isConnected } = useRealtime(projectId)
  const [currentUserId, setCurrentUserId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const { handleError } = useErrorHandler()

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? '')
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !project || generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.data) {
        handleError(new Error(json.error ?? 'Generation failed'))
        return
      }
      // Build files from AI-generated scaffold client-side
      const generatedApp = json.data
      const files: { name: string; path: string; content: string; language: string }[] = []

      for (const route of generatedApp.backend.routes) {
        files.push({
          name: `route-${route.path.replace(/\//g, '-')}.ts`,
          path: `app/api/${route.path}/route.ts`,
          content: `// ${route.method} ${route.path} — ${route.description}`,
          language: 'typescript',
        })
      }
      for (const page of generatedApp.frontend.pages) {
        files.push({
          name: `page-${page.replace(/\//g, '-')}.tsx`,
          path: `app${page}/page.tsx`,
          content: `// Page: ${page}`,
          language: 'typescript',
        })
      }
      if (generatedApp.database.tables.length > 0) {
        const tableComments = generatedApp.database.tables
          .map((t: { name: string }) => `// Table: ${t.name}`)
          .join('\n')
        files.push({
          name: 'db-schema.ts',
          path: 'lib/db-schema.ts',
          content: `// Database Schema\n${tableComments}`,
          language: 'typescript',
        })
      }

      // Patch the existing project with the generated files
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      })
      // Reload the project from server
      const updated = await fetch(`/api/projects/${projectId}`).then(r => r.json())
      if (updated.data) {
        window.dispatchEvent(new CustomEvent('editor:load-project', { detail: updated.data }))
      }
    } catch (err) {
      handleError(err)
    } finally {
      setGenerating(false)
      setPrompt('')
    }
  }, [prompt, project, generating, projectId, handleError])

  return (
    <div className="editor-topbar">
      <div className="topbar-left">
        <span className="project-name">{project?.name ?? 'Loading…'}</span>
        <div className="generate-form">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe changes… e.g. add a login button"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="generate-input"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="generate-btn"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>
      <div className="topbar-right">
        <SaveStatus />
        <DeployButton projectId={projectId} />
      </div>
      <style>{`
        .editor-topbar {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          background: #1e1e1e;
          border-bottom: 1px solid #333;
          padding: 0 12px;
          gap: 16px;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; flex: 1; }
        .project-name { font-size: 14px; font-weight: 600; color: #f0f6fc; white-space: nowrap; }
        .generate-form { display: flex; gap: 8px; flex: 1; max-width: 500px; }
        .generate-input {
          flex: 1; padding: 5px 10px; font-size: 13; background: #0d1117;
          border: 1px solid #30363d; border-radius: 6; color: #f0f6fc;
        }
        .generate-input:focus { outline: none; border-color: #6366f1; }
        .generate-btn {
          padding: 5px 14px; font-size: 13; font-weight: 600;
          background: #6366f1; border: none; border-radius: 6; color: #fff; cursor: pointer;
        }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .topbar-right { display: flex; align-items: center; gap: 8px; }
      `}</style>
    </div>
  )
}

// ── Drawer bar (Assets / History) ────────────────────────────────────────────

function DrawerBar({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState<'assets' | 'history' | null>(null)
  const [, setAssetKey] = useState(0)

  function handleUploadComplete(_asset: StoredAsset) {
    setAssetKey(k => k + 1)
  }

  return (
    <div className="drawer-bar">
      <div className="drawer-tabs">
        <button
          className={`drawer-tab ${open === 'assets' ? 'active' : ''}`}
          onClick={() => setOpen(open === 'assets' ? null : 'assets')}
        >
          {open === 'assets' ? '▼' : '▶'} Assets
        </button>
        <button
          className={`drawer-tab ${open === 'history' ? 'active' : ''}`}
          onClick={() => setOpen(open === 'history' ? null : 'history')}
        >
          {open === 'history' ? '▼' : '▶'} Deploy History
        </button>
      </div>
      {open === 'assets' && (
        <div className="drawer-content">
          <AssetUploader projectId={projectId} onUploadComplete={handleUploadComplete} />
          <AssetList projectId={projectId} />
        </div>
      )}
      {open === 'history' && (
        <div className="drawer-content">
          <DeploymentHistory projectId={projectId} />
        </div>
      )}
      <style>{`
        .drawer-bar { grid-column: 1 / -1; border-top: 1px solid #21262d; background: #161b22; }
        .drawer-tabs { display: flex; }
        .drawer-tab {
          padding: 6px 16px; font-size: 12; background: transparent; border: none;
          color: #8b949e; cursor: pointer; text-align: left;
        }
        .drawer-tab.active { color: #f0f6fc; background: #1c2128; }
        .drawer-content { padding: 12px 16px; border-top: 1px solid #21262d; max-height: 220px; overflow-y: auto; }
      `}</style>
    </div>
  )
}

// ── Main editor layout ────────────────────────────────────────────────────────

function EditorContent({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { project, loading, loadProject } = useEditor()
  const { handleError } = useErrorHandler()

  useAutosave(projectId)

  useEffect(() => {
    const handler = (e: Event) => {
      loadProject((e as CustomEvent<Project>).detail)
    }
    window.addEventListener('editor:load-project', handler)
    return () => window.removeEventListener('editor:load-project', handler)
  }, [loadProject])

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) loadProject(json.data as Project)
        else { handleError(new Error('Project not found')); router.push('/projects') }
      })
      .catch((err) => { handleError(err); router.push('/projects') })
  }, [projectId])

  if (loading || !project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#8b949e', background: '#0d1117' }}>
        Loading project…
      </div>
    )
  }

  return (
    <div className="editor-root">
      <EditorTopBar projectId={projectId} />
      <div className="editor-sidebar">
        <FileExplorer />
      </div>
      <div className="editor-main">
        <div className="editor-tabs-row"><FileTabs /></div>
        <div className="editor-code"><CodeEditor /></div>
      </div>
      <div className="editor-preview">
        <PreviewPanel />
      </div>
      <DrawerBar projectId={projectId} />

      <style>{`
        .editor-root {
          display: grid;
          grid-template-rows: auto 1fr auto;
          grid-template-columns: 200px 1fr 40%;
          height: 100vh;
          overflow: hidden;
          background: #0d1117;
        }
        .editor-sidebar { grid-column: 1; grid-row: 2; border-right: 1px solid #21262d; overflow: hidden; }
        .editor-main { grid-column: 2; grid-row: 2; display: flex; flex-direction: column; overflow: hidden; }
        .editor-tabs-row { flex-shrink: 0; }
        .editor-code { flex: 1; overflow: hidden; }
        .editor-preview { grid-column: 3; grid-row: 2; border-left: 1px solid #21262d; overflow: hidden; }
        @media (max-width: 767px) {
          .editor-root { grid-template-columns: 1fr; grid-template-rows: auto auto 1fr auto; }
          .editor-sidebar { display: none; }
          .editor-preview { grid-column: 1; grid-row: 4; height: 40vh; border-left: none; border-top: 1px solid #21262d; }
          .editor-main { grid-column: 1; grid-row: 3; }
        }
      `}</style>
    </div>
  )
}

// ── Page with Suspense (useSearchParams) ─────────────────────────────────────

function EditorPageInner() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#0d1117', minHeight: '100vh', color: '#f0f6fc' }}>
        <p style={{ color: '#f85149', margin: '0 0 16px' }}>Missing projectId in URL.</p>
        <a href="/projects" style={{ color: '#58a6ff' }}>← Back to Projects</a>
      </div>
    )
  }

  return (
    <EditorProvider>
      <EditorContent projectId={projectId} />
    </EditorProvider>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#8b949e', background: '#0d1117', minHeight: '100vh' }}>Loading editor…</div>}>
      <EditorPageInner />
    </Suspense>
  )
}
