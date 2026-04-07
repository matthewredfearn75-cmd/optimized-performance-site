import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.warn('[supabase-server] Missing SUPABASE_URL or SERVICE_ROLE_KEY — database operations will fail')
}

export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey)
  : { from: () => ({ select: () => ({ data: [], error: 'Not configured' }), insert: () => ({ error: 'Not configured' }), update: () => ({ error: 'Not configured' }) }) }
