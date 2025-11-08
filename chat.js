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
      let body = {};
      
      // قراءة body بشكل آمن
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (typeof req.body === 'object') {
        body = req.body;
      } else {
        body = {};
      }

      const { message, test } = body;

      // إذا كان طلب اختبار
      if (test) {
        return res.status(200).json({ 
          success: true, 
          message: '✅ السيرفر يعمل!' 
        });
      }

      if (!message || message.trim() === '') {
        return res.status(400).json({ 
          success: false,
          error: 'الرسالة مطلوبة' 
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
              content: `أنت مساعد علاقاتي ذكي متخصص في تحليل العلاقات وتحسين التواصل بين الأزواج. 
              كن داعماً، عملياً، ومراعياً للثقافة العربية. قدم نصائح قابلة للتطبيق.`
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
        
        let errorMessage = 'حدث خطأ في خدمة الذكاء الاصطناعي';
        
        if (deepSeekResponse.status === 401) {
          errorMessage = 'مشكلة في المصادقة - تحقق من مفتاح API';
        } else if (deepSeekResponse.status === 429) {
          errorMessage = 'تم تجاوز الحد المسموح من الطلبات';
        }
        
        return res.status(500).json({ 
          success: false,
          error: errorMessage
        });
      }

      const data = await deepSeekResponse.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return res.status(200).json({
          success: true,
          reply: data.choices[0].message.content
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'استجابة غير صحيحة من الذكاء الاصطناعي'
        });
      }

    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'خطأ داخلي في السيرفر: ' + error.message
      });
    }
  }

  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed' 
  });
}
