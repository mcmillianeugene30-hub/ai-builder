import { createSupabaseServerClient } from './supabase-server'
import type { StoredAsset, UploadAssetInput } from './types'

const BUCKET = 'project-assets'

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'font/woff',
  'font/woff2',
  'font/ttf',
  'application/octet-stream',
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024

export async function uploadAsset(input: UploadAssetInput): Promise<StoredAsset> {
  if (!ALLOWED_MIME_TYPES.includes(input.file.type)) {
    throw new Error(`Unsupported file type: ${input.file.type}`)
  }
  if (input.file.size > MAX_SIZE_BYTES) {
    throw new Error('File too large. Max 10MB.')
  }

  const supabase = await createSupabaseServerClient()
  const path = `${input.userId}/${input.projectId}/${input.file.name}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    upsert: true,
    contentType: input.file.type,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const signedUrl = await getSignedUrl(input.userId, input.projectId, input.file.name)

  const { data: listData } = await supabase.storage.from(BUCKET).list(`${input.userId}/${input.projectId}`, { limit: 100 })
  const fileMeta = listData?.find((f) => f.name === input.file.name)

  return {
    name: input.file.name,
    path,
    size: input.file.size,
    mimeType: input.file.type,
    signedUrl,
    createdAt: fileMeta?.created_at ?? new Date().toISOString(),
  }
}

export async function getSignedUrl(
  userId: string,
  projectId: string,
  filename: string
): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const path = `${userId}/${projectId}/${filename}`

  const { data: signedData, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)

  if (error || !signedData?.signedUrl) {
    throw new Error('Failed to get signed URL')
  }

  return signedData.signedUrl
}

export async function listAssets(
  userId: string,
  projectId: string
): Promise<StoredAsset[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${userId}/${projectId}`, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error || !data) return []

  const assets: StoredAsset[] = await Promise.all(
    data
      .filter((f) => f.id && !f.id.endsWith('/'))
      .map(async (f) => {
        try {
          const signedUrl = await getSignedUrl(userId, projectId, f.name)
          return {
            name: f.name,
            path: `${userId}/${projectId}/${f.name}`,
            size: f.metadata?.size ?? 0,
            mimeType: f.metadata?.mimetype ?? 'application/octet-stream',
            signedUrl,
            createdAt: f.created_at ?? new Date().toISOString(),
          }
        } catch {
          return {
            name: f.name,
            path: `${userId}/${projectId}/${f.name}`,
            size: f.metadata?.size ?? 0,
            mimeType: f.metadata?.mimetype ?? 'application/octet-stream',
            signedUrl: '',
            createdAt: f.created_at ?? new Date().toISOString(),
          }
        }
      })
  )

  return assets
}

export async function deleteAsset(
  userId: string,
  projectId: string,
  filename: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const path = `${userId}/${projectId}/${filename}`

  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export async function deleteProjectAssets(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: listData } = await supabase.storage
      .from(BUCKET)
      .list(`${userId}/${projectId}`, { limit: 100 })

    if (!listData || listData.length === 0) return

    const paths = listData
      .filter((f) => f.id && !f.id.endsWith('/'))
      .map((f) => `${userId}/${projectId}/${f.name}`)

    if (paths.length === 0) return

    await supabase.storage.from(BUCKET).remove(paths)
  } catch (err) {
    console.error('deleteProjectAssets failed:', err)
  }
}
