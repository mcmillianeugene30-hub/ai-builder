import { getSupabaseClient as getBrowserClient } from './supabase-browser';
import { getSupabaseClient as getServerClient } from './supabase-server';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserClient();
  await supabase.auth.signOut();
}

export async function exchangeCodeForSession(code: string) {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  return { data, error };
}

export async function getUserByAccessToken(accessToken: string): Promise<User | null> {
  const supabase = getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? [];
  return adminEmails.includes(email);
}
