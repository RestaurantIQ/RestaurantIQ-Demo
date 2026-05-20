const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  const start = Date.now();
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const latency = Date.now() - start;
    return res.status(r.ok ? 200 : 503).json({
      ok: r.ok,
      supabase: { ok: r.ok, latency },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(503).json({
      ok: false,
      supabase: { ok: false, error: e.message },
      timestamp: new Date().toISOString(),
    });
  }
}
