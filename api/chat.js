// Vercel serverless function — keeps the Anthropic API key secret.
// The browser calls /api/chat instead of api.anthropic.com directly.

// Allow up to 60s — the personalised reveal is a big generation.
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, system, max_tokens, name } = req.body;

    // Personalisation: if the client sent the person's saved name, let Psyche address them by it.
    // Sanitised (single line, trimmed, capped) so a stray value can't reshape the prompt.
    let sys = system || "";
    const who = typeof name === "string" ? name.trim().replace(/\s+/g, " ").slice(0, 60) : "";
    if (who) {
      sys += `\n\nThe person you are speaking with is called "${who}". Address them by name naturally and sparingly — when it feels warm, not in every message.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 400,
        system: sys,
        messages: messages || []
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Request failed", detail: String(err) });
  }
}
