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
    const { text, prompt } = req.body

    if (!text || !prompt) {
      return res.status(400).json({ error: "Missing text or prompt" })
    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${prompt}\n\n---\n\nالنص المراد تحليله:\n\n${text}\n\n---\n\nتعليمات الإخراج - التزم بها حرفياً:\n1. ابدأ ردّك مباشرةً بعلامة { ولا تضف أي كلام قبل JSON.\n2. حقل pillars يجب أن يحتوي على 10 أركان بالضبط - لا 9 ولا 8 ولا أقل. أكمل الـ 10 كلها قبل أي شيء آخر.\n3. feedback لكل ركن: جملة واحدة فقط (لا أكثر).\n4. بعد إغلاق JSON أعِد GRAMMAR_START...GRAMMAR_END.` }],
            },
          ],
          generationConfig: { maxOutputTokens: 16384, temperature: 0.3 },
        }),
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
