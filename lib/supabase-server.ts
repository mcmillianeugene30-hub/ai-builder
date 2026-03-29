import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, environment variables may not be available
  // Return a mock client to prevent build failures
  if (!supabaseUrl || !supabaseServiceKey) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key') as any;
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

export async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await getSupabaseClient().auth.getUser(token);
  return user;
}

export const supabase = getSupabaseClient();
