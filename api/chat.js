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

    // المفتاح API مضمن هنا مباشرة
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
            أنت خبير في العلاقات الزوجية والتواصل العاطفي.
            
            مهمتك:
            • تحليل أنماط التواصل بين الأزواج
            • تقديم نصائح عملية لتحسين العلاقات
            • مساعدة في حل النزاعات والمشاكل
            • إرشاد لتعميق الروابط العاطفية
            • تحليل المواقف المعقدة وإعطاء حلول
            
            المبادئ:
            • كن داعماً ومتفهماً
            • قدم نصائح قابلة للتطبيق
            • راعي الثقافة العربية والعادات
            • كن عملياً وواقعياً
            • شجع على التواصل الصحي
            
            الردود:
            • استخدم اللغة العربية الفصحى السلسة
            • قدم أمثلة عملية
            • اعط خطوات واضحة
            • كن محفزاً وإيجابياً
            • ركز على الحلول لا المشاكل`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
      timeout: 30000
    });

    if (!deepSeekResponse.ok) {
      const errorText = await deepSeekResponse.text();
      console.error('DeepSeek API error:', deepSeekResponse.status, errorText);
      
      let errorMessage = 'حدث خطأ في خدمة الذكاء الاصطناعي';
      
      if (deepSeekResponse.status === 401) {
        errorMessage = 'مفتاح API غير صالح أو منتهي الصلاحية';
      } else if (deepSeekResponse.status === 429) {
        errorMessage = 'تم تجاوز الحد المسموح من الطلبات';
      } else if (deepSeekResponse.status >= 500) {
        errorMessage = 'مشكلة فنية في الخادم، جرب مرة أخرى لاحقاً';
      }
      
      return res.status(deepSeekResponse.status).json({ 
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
    
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        success: false,
        error: 'انتهت مهلة الاتصال، جرب مرة أخرى' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'خطأ داخلي في السيرفر: ' + error.message 
    });
  }
}
