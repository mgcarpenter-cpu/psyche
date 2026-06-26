// Vercel serverless function — generates the structured "Reveal" (what Psyche sees +
// the way through) from a real conversation. Keeps the Anthropic API key secret.
// The browser POSTs { messages, name } to /api/generate.

export const config = { maxDuration: 60 };

const GEN_SYSTEM = `You are Psyche, a contemplative guide grounded in the Buddha's teachings as found in the suttas. You speak in plain, modern English — never use Pali or jargon, never name-drop scripture.

You are given a conversation between a person and Psyche. Drawing ONLY from what is actually in this conversation, produce a structured reading: the understanding underneath it, and a concrete way through.

Use this lens (never name it): contact gives rise to a feeling-tone (pleasant, unpleasant, or neutral), which gives rise to a reaction (grasping at the pleasant, pushing away the unpleasant, or dimming out), which is where suffering begins. The way through is to meet the feeling-tone without grabbing, pushing, or dimming — maturing into equanimity.

Be specific to THIS person and THIS conversation — never generic. Warm, spare, plain. Short sentences. If the conversation is thin, still give your most honest reading.

Call the record_reveal tool exactly once with your reading.`;

const REVEAL_TOOL = {
  name: "record_reveal",
  description: "Record the structured reading of the conversation.",
  input_schema: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "The core pattern quietly holding them back. One short sentence." },
      pattern_explain: { type: "string", description: "1-3 sentences expanding the pattern, grounded in what they said." },
      root_cause: { type: "string", description: "Where the struggle actually begins. One short sentence." },
      root_cause_explain: { type: "string", description: "1-3 sentences expanding the root cause." },
      feeling_tone: { type: "string", description: "Name the feeling-tone and reaction, e.g. 'Unpleasant → aversion (pushing it away)'." },
      feeling_tone_explain: { type: "string", description: "1-3 sentences expanding the feeling-tone and reaction." },
      wisdom: { type: "string", description: "A short, plain wisdom line (an aphorism) that turns the struggle." },
      wisdom_explain: { type: "string", description: "1-3 sentences expanding the wisdom, applied to them." },
      steps: {
        type: "array",
        description: "2 to 4 concrete practices to walk it out, in order.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short imperative title." },
            description: { type: "string", description: "1-2 concrete, doable sentences." },
            why: { type: "string", description: "1-2 sentences on why this works." }
          },
          required: ["title", "description", "why"]
        }
      }
    },
    required: ["pattern", "pattern_explain", "root_cause", "root_cause_explain", "feeling_tone", "feeling_tone_explain", "wisdom", "wisdom_explain", "steps"]
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { messages, name } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No conversation to read" });
    }

    let sys = GEN_SYSTEM;
    const who = typeof name === "string" ? name.trim().replace(/\s+/g, " ").slice(0, 60) : "";
    if (who) sys += `\n\nThe person is called "${who}".`;

    // Pass the whole conversation as one transcript in a single user message — the model
    // can't take a conversation that ends on an assistant turn while a tool call is forced.
    const transcript = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map(m => (m.role === "user" ? (who || "Me") : "Psyche") + ": " + m.content)
      .join("\n\n");
    const userMessage = "Here is the conversation so far:\n\n" + transcript +
      "\n\nDrawing only from this conversation, record your reading with the record_reveal tool.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: sys,
        tools: [REVEAL_TOOL],
        tool_choice: { type: "tool", name: "record_reveal" },
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    if (data.error) {
      return res.status(502).json({ error: data.error.message || "Generation failed" });
    }

    const toolUse = (data.content || []).find(b => b.type === "tool_use");
    if (!toolUse || !toolUse.input) {
      return res.status(502).json({ error: "No structured result returned" });
    }
    return res.status(200).json(toolUse.input);
  } catch (err) {
    return res.status(500).json({ error: "Request failed", detail: String(err) });
  }
}
