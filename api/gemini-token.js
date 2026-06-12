// api/gemini-token.js
// Mints a short-lived ephemeral token for Gemini Live, so your real API key
// never reaches the browser. The client connects to Gemini Live with this token.

import { GoogleGenAI } from "@google/genai";

const LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025"; // swap if you pick another live model

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: "v1alpha" },
    });

    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,                                              // single connection
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),     // token valid 30 min
        newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(), // must start session within 2 min
        liveConnectConstraints: { model: LIVE_MODEL },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    res.status(200).json({ token: token.name });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
