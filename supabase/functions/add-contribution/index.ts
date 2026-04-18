import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ISA_ANNUAL_ALLOWANCE = 20_000
const LIFETIME_ISA_ALLOWANCE = 4_000
const VALID_ISA_TYPES = ['cash', 'stocks_shares', 'lifetime', 'innovative_finance'] as const

type IsaType = (typeof VALID_ISA_TYPES)[number]

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

// Returns the start (inclusive) and end (inclusive) dates of the UK tax year
// that contains the given date. Tax year: 6 April → 5 April.
function taxYearBounds(date: Date): { start: string; end: string } {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() // 0-indexed
  const d = date.getUTCDate()

  // On or after 6 April → we're in the tax year that started this calendar year
  const inCurrentCalendarYear = m > 3 || (m === 3 && d >= 6)

  if (inCurrentCalendarYear) {
    return { start: `${y}-04-06`, end: `${y + 1}-04-05` }
  } else {
    return { start: `${y - 1}-04-06`, end: `${y}-04-05` }
  }
}

serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // ── Authentication ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  // Forward the user's JWT so RLS applies to all queries.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  // ── Input parsing ─────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { isa_type, provider, amount, date, withdrawn = false } = body

  // ── Input validation ──────────────────────────────────────────────────────
  if (!isa_type || !VALID_ISA_TYPES.includes(isa_type as IsaType)) {
    return json(
      { error: `isa_type must be one of: ${VALID_ISA_TYPES.join(', ')}` },
      400,
    )
  }

  if (!provider || typeof provider !== 'string' || !provider.trim()) {
    return json({ error: 'provider is required' }, 400)
  }

  const parsedAmount = Number(amount)
  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return json({ error: 'amount must be a positive number' }, 400)
  }

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'date must be in YYYY-MM-DD format' }, 400)
  }

  const contributionDate = new Date(`${date}T00:00:00Z`)
  if (isNaN(contributionDate.getTime())) {
    return json({ error: 'date is not a valid calendar date' }, 400)
  }

  // ── Allowance validation ──────────────────────────────────────────────────
  const { start, end } = taxYearBounds(contributionDate)

  // Only non-withdrawn contributions consume allowance.
  const { data: existing, error: fetchError } = await supabase
    .from('contributions')
    .select('isa_type, amount')
    .eq('user_id', user.id)
    .eq('withdrawn', false)
    .gte('date', start)
    .lte('date', end)

  if (fetchError) {
    console.error('Failed to fetch existing contributions:', fetchError)
    return json({ error: 'Could not verify existing contributions' }, 500)
  }

  const rows = existing ?? []
  const totalContributed = rows.reduce((sum, r) => sum + Number(r.amount), 0)
  const lifetimeContributed = rows
    .filter((r) => r.isa_type === 'lifetime')
    .reduce((sum, r) => sum + Number(r.amount), 0)

  if (totalContributed + parsedAmount > ISA_ANNUAL_ALLOWANCE) {
    const remaining = Math.max(0, ISA_ANNUAL_ALLOWANCE - totalContributed)
    return json(
      {
        error: `This contribution would exceed your £20,000 annual ISA allowance. You have £${remaining.toFixed(2)} remaining this tax year.`,
        code: 'ANNUAL_ALLOWANCE_EXCEEDED',
        remaining,
      },
      422,
    )
  }

  if (isa_type === 'lifetime' && lifetimeContributed + parsedAmount > LIFETIME_ISA_ALLOWANCE) {
    const remaining = Math.max(0, LIFETIME_ISA_ALLOWANCE - lifetimeContributed)
    return json(
      {
        error: `This contribution would exceed the £4,000 annual Lifetime ISA limit. You have £${remaining.toFixed(2)} remaining this tax year.`,
        code: 'LIFETIME_ISA_LIMIT_EXCEEDED',
        remaining,
      },
      422,
    )
  }

  // ── Insert ────────────────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from('contributions')
    .insert({
      user_id: user.id,
      isa_type: isa_type as IsaType,
      provider: (provider as string).trim(),
      amount: parsedAmount,
      date,
      withdrawn: Boolean(withdrawn),
    })
    .select()
    .single()

  if (insertError) {
    console.error('Insert failed:', insertError)
    return json({ error: 'Failed to save contribution' }, 500)
  }

  return json({ data: inserted }, 201)
})
