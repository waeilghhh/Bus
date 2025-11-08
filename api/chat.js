// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST method allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  const apiKey = process.env.OPENROUTER_API_KEY; // هنا المفتاح مخزن بشكل آمن
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const body = {
      model: "gemini-2.0-flash-free",
      messages: [
        { role: "system", content: "أنت مساعد ذكي ودود باللهجة التونسية، تجاوب المستخدم بطريقة مفهومة وواضحة." },
        { role: "user", content: prompt }
      ]
    };

    const response = await fetch("https://openrouter.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `OpenRouter API error: ${errText}` });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "لم أتمكن من إنتاج رد.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
