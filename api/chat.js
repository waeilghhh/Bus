const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export default async function handler(req, res) {
  // السماح بجميع المصادر (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://your-app.vercel.app',
        'X-Title': 'مرشد العلاقات'
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: 'user',
            content: `أنت مرشد متخصص في العلاقات الزوجية. قدم استشارة مهنية حول: ${message}`
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('خطأ في API');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.status(200).json({ response: aiResponse });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'حدث خطأ في الخادم',
      details: error.message 
    });
  }
}
