// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("."));

// ---------- ضع مفتاحك هنا أو احفظه في .env وفي process.env الدالة أدناه ----------
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-30e89b3e61094baf96c4e62190b01de8";
// ---------------------------------------------------------------------------------

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages) return res.status(400).json({ error: "No messages provided" });

    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: false
      }),
      // timeout is not built-in in fetch; keep simple here
    });

    const rawText = await upstream.text();

    // تسجيل كامل للاستجابة الخام لمراجعة الأخطاء
    console.log("Upstream status:", upstream.status);
    console.log("Upstream raw response (first 1000 chars):", rawText.slice(0, 1000));

    // حاول تحويل الرد إلى JSON، وإن فشل أرسِل النص الخام مع حالة مناسبة
    try {
      const data = JSON.parse(rawText);
      return res.status(upstream.status).json(data);
    } catch (parseErr) {
      // الرد ليس JSON (غالبًا HTML) -> اعلِم العميل بذلك بوضوح
      return res.status(502).json({
        error: "Upstream did not return JSON",
        upstreamStatus: upstream.status,
        upstreamTextSnippet: rawText.slice(0, 200)
      });
    }

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
