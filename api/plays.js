// Shared play counter. GET returns the count; POST adds one.
// Needs an Upstash Redis store connected to the project (Vercel Marketplace),
// which provides KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'sparkler-rhythm:plays';

async function redis(cmd) {
  const r = await fetch(URL_ + '/' + cmd, { headers: { Authorization: 'Bearer ' + TOKEN } });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'counter not configured' });
  try {
    const n = req.method === 'POST' ? await redis('incr/' + KEY) : await redis('get/' + KEY);
    res.status(200).json({ plays: Number(n) || 0 });
  } catch (e) {
    res.status(502).json({ error: 'counter unavailable' });
  }
};
