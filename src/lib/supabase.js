import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set')
if (!serviceKey) console.error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set')

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const supabaseAdmin = url && serviceKey ? createClient(url, serviceKey) : null
