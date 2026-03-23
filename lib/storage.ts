import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase-server';

const BUCKET = 'project-assets';

export async function uploadAsset(
  userId: string,
  filename: string,
  fileContent: Buffer,
  contentType: string
): Promise<{ url?: string; error?: string }> {
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileContent, { contentType, upsert: true });

  if (error) {
    console.error('[storage] Error uploading file:', error);
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function deleteAsset(userId: string, filename: string): Promise<boolean> {
  const path = `${userId}/${filename}`;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error('[storage] Error deleting file:', error);
    return false;
  }
  return true;
}

export async function listAssets(userId: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(userId, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    console.error('[storage] Error listing files:', error);
    return [];
  }

  return (data ?? []).map((f) => f.name);
}
