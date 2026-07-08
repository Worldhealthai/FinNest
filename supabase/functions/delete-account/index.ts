import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // ── Identify the caller from their JWT ──────────────────────────────────────
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser()

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  // ── Delete all of the user's data with the service role ─────────────────────
  // Deleting the auth user does NOT automatically remove application rows unless
  // FK cascades are set, so we delete them explicitly and idempotently.
  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { error: contribError } = await admin
    .from('contributions')
    .delete()
    .eq('user_id', user.id)

  if (contribError) {
    console.error('Failed to delete contributions:', contribError)
    return json({ error: 'Failed to delete account data' }, 500)
  }

  const { error: profileError } = await admin
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) {
    console.error('Failed to delete profile:', profileError)
    return json({ error: 'Failed to delete account data' }, 500)
  }

  // Finally remove the auth user itself.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteUserError) {
    console.error('Failed to delete auth user:', deleteUserError)
    return json({ error: 'Failed to delete account' }, 500)
  }

  return json({ success: true }, 200)
})
