'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { EditorProvider } from '@/lib/editor-store'
import { useRealtime } from '@/lib/use-realtime'
import { useAutosave } from '@/lib/use-autosave'
import { useErrorHandler } from '@/lib/use-error-handler'
import { FileExplorer } from '@/components/editor/FileExplorer'
import { FileTabs } from '@/components/editor/FileTabs'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { SaveStatus } from '@/components/editor/SaveStatus'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { CollaboratorAvatars } from '@/components/realtime/CollaboratorAvatars'
import { ConnectionStatus } from '@/components/realtime/ConnectionStatus'
import { DeployButton } from '@/components/deploy/DeployButton'
import { DeploymentHistory } from '@/components/deploy/DeploymentHistory'
import { AssetUploader } from '@/components/storage/AssetUploader'
import { AssetList } from '@/components/storage/AssetList'
import type { Project, StoredAsset } from '@/lib/types'

function TopBar({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const { collaborators, isConnected } = useRealtime(projectId)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        background: '#1e1e1e',
        borderBottom: '1px solid #333',
        padding: '0 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ConnectionStatus isConnected={isConnected} />
        <CollaboratorAvatars collaborators={collaborators} currentUserId={currentUserId} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DeployButton projectId={projectId} />
        <SaveStatus />
      </div>
    </div>
  )
}

function EditorContent({
  project,
  projectId,
  currentUserId,
}: {
  project: Project
  projectId: string
  currentUserId: string
}) {
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const [showHistory, setShowHistory] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [assets, setAssets] = useState<StoredAsset[]>([])
  useAutosave(projectId)

  function handleUploadComplete(asset: StoredAsset) {
    setAssets((prev) => [asset, ...prev])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0d1117' }}>
      <TopBar projectId={projectId} currentUserId={currentUserId} />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 40%', flex: 1, overflow: 'hidden' }}>
        <FileExplorer />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <FileTabs />
          <CodeEditor />
        </div>
        <PreviewPanel />
      </div>

      {/* Bottom panels */}
      <div style={{ borderTop: '1px solid #333', background: '#161b22' }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => setShowHistory((v) => !v)}
            style={{
              flex: 1, padding: '6px 16px', textAlign: 'left',
              background: 'transparent', border: 'none', color: '#8b949e', fontSize: 12, cursor: 'pointer', borderRight: '1px solid #333',
            }}
          >
            {showHistory ? '▼' : '▶'} Deployments
          </button>
          <button
            onClick={() => setShowAssets((v) => !v)}
            style={{
              flex: 1, padding: '6px 16px', textAlign: 'left',
              background: 'transparent', border: 'none', color: '#8b949e', fontSize: 12, cursor: 'pointer',
            }}
          >
            {showAssets ? '▼' : '▶'} Assets
          </button>
        </div>

        {showHistory && <DeploymentHistory projectId={projectId} />}
        {showAssets && (
          <div style={{ padding: '12px 16px', maxHeight: 300, overflow: 'auto' }}>
            <AssetUploader projectId={projectId} onUploadComplete={handleUploadComplete} />
            <div style={{ marginTop: 12 }}>
              <AssetList projectId={projectId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditorApp({ project, userId }: { project: Project; userId: string }) {
  const [currentUserId, setCurrentUserId] = useState(userId)

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }: { data: { session: { user: { id: string } } | null } }) => {
      if (data.session?.user.id) setCurrentUserId(data.session.user.id)
    })
  }, [])

  return (
    <EditorProvider>
      <Suspense fallback={<div style={{ padding: 20, color: '#c9d1d9', background: '#0d1117' }}>Loading project...</div>}>
        <EditorContent project={project} projectId={project.id} currentUserId={currentUserId} />
      </Suspense>
    </EditorProvider>
  )
}
