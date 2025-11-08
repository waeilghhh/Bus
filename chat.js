export default async function handler(req, res) {
  // تمكين CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { message, test } = req.body;

      // إذا كان طلب اختبار
      if (test) {
        return res.status(200).json({ 
          success: true, 
          message: '✅ السيرفر يعمل perfectly!' 
        });
      }

      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Message is required' 
        });
      }

      console.log('📨 Received message:', message);

      // المفتاح API
      const API_KEY = "sk-f582c0883b0144c5bc591ea7b1691a3c";

      // استدعاء DeepSeek API
      const deepSeekResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system", 
              content: "أنت مساعد علاقاتي ذكي. رد بالعربية."
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 500
        })
      });

      if (!deepSeekResponse.ok) {
        throw new Error(`API error: ${deepSeekResponse.status}`);
      }

      const data = await deepSeekResponse.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return res.status(200).json({
          success: true,
          reply: data.choices[0].message.content
        });
      } else {
        throw new Error('Invalid API response');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'حدث خطأ: ' + error.message
      });
    }
  }

  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed' 
  });
}
