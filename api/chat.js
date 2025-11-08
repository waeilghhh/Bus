// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  // المفتاح التجريبي (غير آمن للنشر العلني)
  const apiKey = "AIzaSyDpjwGEaOlLgMxghJZWbmRHPUULPHshqoA";

  try {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.0-flash-lite:generateText';

    const body = {
      prompt: { text: `system: أنت مساعد ذكي باللهجة التونسية. user: ${prompt}` },
      maxOutputTokens: 512,
      temperature: 0.2
    };

    const r = await fetch(endpoint + `?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: text });

    let json;
    try { json = JSON.parse(text); } catch(e) { json = null; }

    const reply =
      json?.candidates?.[0]?.content?.[0]?.text ||
      json?.output?.[0]?.content?.[0]?.text ||
      json?.result ||
      (typeof text === 'string' ? text : JSON.stringify(json));

    res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
