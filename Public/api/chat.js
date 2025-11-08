export default async function handler(req, res) {
  // تمكين CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // التعامل مع طلبات OPTIONS لـ CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // التأكد من أن الطريقة POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, test } = req.body;

    // إذا كان طلب اختبار
    if (test) {
      return res.status(200).json({ success: true, message: 'API is working' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // استدعاء DeepSeek API
    const deepSeekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `أنت مساعد علاقاتي ذكي متخصص في تحليل العلاقات وتحسين التواصل بين الأزواج. 
            كن داعماً، عملياً، ومراعياً للثقافة العربية. قدم نصائح قابلة للتطبيق.
            رد باللغة العربية دائماً.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!deepSeekResponse.ok) {
      const errorText = await deepSeekResponse.text();
      console.error('DeepSeek API error:', deepSeekResponse.status, errorText);
      return res.status(deepSeekResponse.status).json({ 
        error: `DeepSeek API error: ${deepSeekResponse.status}` 
      });
    }

    const data = await deepSeekResponse.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.status(200).json({
        success: true,
        reply: data.choices[0].message.content
      });
    } else {
      return res.status(500).json({ error: 'Invalid response from AI' });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message 
    });
  }
}
