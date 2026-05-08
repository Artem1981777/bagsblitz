export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey =
    process.env.CLAUDE_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_KEY

  if (!apiKey) return res.status(500).json({ error: "Missing Anthropic API key on server" })

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body ?? {}),
    })

    const contentType = response.headers.get("content-type") || ""
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text()

    return res.status(response.status).json(data)
  } catch (err) {
    return res.status(502).json({ error: "Upstream request failed" })
  }
}
