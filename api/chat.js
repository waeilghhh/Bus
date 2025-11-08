// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  // اقرأ المفتاح من متغير البيئة
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    // *** ملاحظة: endpoint قد يختلف حسب نسخة API (v1/v1beta/v1beta2)
    // هذا مثال شائع للاستدعاء عبر Google Generative Language API (قد تحتاج تفعيل API في Google Cloud)
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.0-flash-lite:generateText';

    const body = {
      // بناء الطلب حسب وثائق Google — هذا نموذج عام لطلب نصي
      // إذا كانت الوثائق عندك تطلب حقل آخر (e.g. "prompt" أو "input"), عدّله حسب المطلوب.
      prompt: {
        text: `system: أنت مساعد ودود يتكلم باللهجة التونسية. user: ${prompt}`
      },
      // يمكنك ضبط maxOutputTokens, temperature, وغيرها حسب الحاجة
      maxOutputTokens: 512,
      temperature: 0.2
    };

    const r = await fetch(endpoint + `?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    if (!r.ok) {
      // أرجع الخطأ كما هو ليتضح السبب (مثلاً: quota/billing/permission)
      return res.status(r.status).json({ error: `Google API error: ${text}` });
    }

    // حاول تفكيك الرد; شكل الرد يعتمد على نسخة الـAPI
    let json;
    try { json = JSON.parse(text); } catch(e) { json = null; }

    // استخراج نص الرد بطريقتين محتملتين
    const reply =
      json?.candidates?.[0]?.content?.[0]?.text ||
      json?.output?.[0]?.content?.[0]?.text ||
      json?.result || // بدائل محتملة
      (typeof text === 'string' ? text : JSON.stringify(json));

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
