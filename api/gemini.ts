import type { VercelRequest, VercelResponse } from "@vercel/node"

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ""
const MODEL = "gemini-2.0-flash"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: "API key not configured" })
  }

  try {
    const { contents, generationConfig } = req.body

    if (!contents) {
      return res.status(400).json({ error: "Missing contents" })
    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig }),
      }
    )

    if (!apiRes.ok) {
      const errBody = await apiRes.json().catch(() => ({}))
      const msg = (errBody as any)?.error?.message || apiRes.status
      return res.status(apiRes.status).json({ error: "API: " + msg })
    }

    const data = await apiRes.json()
    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal error" })
  }
}
