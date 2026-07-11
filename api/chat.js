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

    // Crisis screen (minimal launch floor): conservative keyword match on the latest user
    // message for EXPLICIT self-harm / suicide intent. Only on real chat turns (skip the
    // short title-generation call). On match, return a brief warm reply + crisis flag WITHOUT
    // calling the model, so the client shows the support modal. Logs a count only — no content.
    const isChatTurn = (max_tokens || 400) > 100;
    if (isChatTurn && Array.isArray(messages) && messages.length) {
      const last = messages[messages.length - 1];
      const text = last && last.role === "user" && typeof last.content === "string"
        ? last.content.toLowerCase() : "";
      const CRISIS = [
        "kill myself", "killing myself", "kill my self", "end my life", "ending my life",
        "end it all", "take my own life", "taking my own life", "want to die", "wanna die",
        "want to be dead", "don't want to live", "dont want to live", "don't want to be alive",
        "dont want to be alive", "don't want to be here anymore", "dont want to be here anymore",
        "better off dead", "no reason to live", "nothing to live for", "suicidal", "suicide",
        "hurt myself", "harm myself", "self-harm", "self harm", "cut myself", "cutting myself"
      ];
      if (text && CRISIS.some((p) => text.includes(p))) {
        console.log("crisis_flag", 1); // count only, no message content
        return res.status(200).json({
          crisis: true,
          content: [{
            type: "text",
            text: "I'm really glad you told me — that took courage. What you're carrying matters, and you don't have to face it alone right now. Please reach out to one of the helplines on the support screen; they're there for exactly this, any time of day. I'm here with you too."
          }]
        });
      }
    }

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
