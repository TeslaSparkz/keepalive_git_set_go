// Fetches the root page of the verifier on Render, which keeps the service awake.
// Set RENDER_URL in Vercel (Project Settings > Environment Variables), e.g. https://git-set-go.onrender.com
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const url = process.env.RENDER_URL;
  if (!url) return res.status(500).json({ ok: false, error: "RENDER_URL is not set on Vercel." });
  const t = Date.now();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(55000), headers: { "User-Agent": "git-set-go-keepalive" } });
    res.status(200).json({ ok: r.ok, status: r.status, ms: Date.now() - t, host: new URL(url).host, at: new Date().toISOString() });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.name === "TimeoutError" ? "Timed out after 55s" : "Server unreachable", ms: Date.now() - t, host: new URL(url).host, at: new Date().toISOString() });
  }
};
