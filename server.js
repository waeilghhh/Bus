// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("."));

// ---------- هنا المفتاح (قمت بإدراجه كما طلبت) ----------
const API_KEY = "sk-30e89b3e61094baf96c4e62190b01de8";
// --------------------------------------------------------

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages) return res.status(400).json({ error: "No messages provided" });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: false
      })
    });

    const text = await response.text();
    // حاول تحويل النص إلى JSON إذا أمكن، وإلا أعد النص الخام
    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(response.status).json({ raw: text });
    }

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
