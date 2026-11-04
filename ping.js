// Requests the root page of the verifier on Render, which keeps the service awake.
// Set RENDER_URL in Vercel (Settings > Environment Variables), e.g. https://git-set-go.onrender.com
// A cold start can take ~1 minute, longer than a Vercel function may run. The wake-up request is
// delivered either way, so after 8s we report "waking" instead of waiting for the reply.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const url = process.env.RENDER_URL;
  if (!url) return res.status(500).json({ ok: false, error: "RENDER_URL is not set on Vercel." });
  let host;
  try { host = new URL(url).host; }
  catch { return res.status(500).json({ ok: false, error: "RENDER_URL must start with https:// (check the variable in Vercel)." }); }

  const t = Date.now(), base = { host, at: new Date().toISOString() };
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "git-set-go-keepalive" } });
    res.status(200).json({ ...base, ok: r.ok, status: r.status, ms: Date.now() - t });
  } catch (e) {
    if (e.name === "TimeoutError" || e.name === "AbortError") return res.status(200).json({ ...base, ok: true, waking: true, ms: Date.now() - t });
    res.status(200).json({ ...base, ok: false, error: "Server unreachable (" + ((e.cause && e.cause.code) || e.message) + ")", ms: Date.now() - t });
  }
};
