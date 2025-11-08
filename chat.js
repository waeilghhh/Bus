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

      // استخدم OpenRouter API مجاني
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-site.com',
          'X-Title': 'Relationship Assistant'
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
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

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error('OpenRouter API error:', openRouterResponse.status, errorText);
        
        // استخدام رد محلي إذا فشل API
        const localResponse = generateLocalResponse(message);
        return res.status(200).json({
          success: true,
          reply: localResponse
        });
      }

      const data = await openRouterResponse.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return res.status(200).json({
          success: true,
          reply: data.choices[0].message.content
        });
      } else {
        // استخدام رد محلي إذا كانت الاستجابة غير صحيحة
        const localResponse = generateLocalResponse(message);
        return res.status(200).json({
          success: true,
          reply: localResponse
        });
      }

    } catch (error) {
      console.error('Server error:', error);
      // استخدام رد محلي في حالة الخطأ
      const localResponse = generateLocalResponse(req.body?.message || '');
      return res.status(200).json({
        success: true,
        reply: localResponse
      });
    }
  }

  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed' 
  });
}

// دالة لتوليد ردود محلية ذكية
function generateLocalResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('مشكلة') || lowerMessage.includes('نزاع') || lowerMessage.includes('خلاف')) {
    return `🛠️ **تحليل الموقف وحل النزاعات:**

بناءً على وصفك، إليك استراتيجية عملية:

🔍 **التحليل:**
• المشاعر المكبوتة تظهر كنزاعات
• الاحتياجات غير الملباة تسبب التوتر
• سوء الفهم يزيد من حدة الخلافات

💡 **خطوات الحل:**
1. اختر وقتاً هادئاً للنقاش
2. استخدم لغة "أشعر" بدلاً من الاتهامات
3. استمع بتركيز دون مقاطعة
4. ابحث عن حل يلبي احتياجات الطرفين
5. اتفق على خطة عمل واضحة

✨ **نصيحة:** "الحلول تأتي من الفهم المشترك، لا من الإصرار على الرأي"`;
  
  } else if (lowerMessage.includes('نصيحة') || lowerMessage.includes('مساعدة')) {
    return `💖 **نصائح علاقاتية ذهبية:**

"أفضل العلاقات تُبنى يومياً عبر الخطوات الصغيرة"

📚 **نصائح عملية:**
• خصصوا 15 دقيقة يومياً للحديث دون مشتتات
• عبروا عن التقدير لثلاثة أشياء يومياً
• احترموا الاختلافات واجعلوها مصدر قوة
• تعلموا لغة حب بعضكم (كلمات، وقت، هدايا، خدمات، لمس)

🌟 **تذكير:** "التواصل الفعال هو مهارة نتعلمها باستمرار"`;
  
  } else if (lowerMessage.includes('حب') || lowerMessage.includes('علاقة') || lowerMessage.includes('رومانسية')) {
    return `💫 **إشعال شرارة الحب من جديد:**

🌹 **أفكار رومانسية:**
• موعد مفاجئ أسبوعي
• رسائل حب مخبأة في أماكن غير متوقعة
• استرجاع ذكرياتكم الجميلة
• تعلم شيء جديد معاً

🕯️ **لتعميق الارتباط:**
• شاركوا أحلامكم ومخاوفكم
• احتفلوا بالإنجازات الصغيرة
• كونوا فريقاً في مواجهة التحديات
• حافظوا على الفضول لمعرفة بعضكم

💞 "الحب ليس شعوراً، بل هو قرار يومي"`;
  
  } else {
    return `🤖 **مساعد العلاقات الذكي**

أفهم أنك تبحث عن إرشاد في علاقتك. لكي أقدم لك المساعدة الأكثر دقة:

💡 **يمكنني مساعدتك في:**
• تحليل موقف علاقي محدد
• تقديم نصائح لتحسين التواصل
• إستراتيجيات حل النزاعات
• أفكار لتجديد الروح الرومانسية

🔍 **للاستفادة القصوى:**
• صف لي موقفاً محدداً
• اشرح التحدي الذي تواجهه
• اسأل عن نصائح عملية

كيف يمكنني خدمتك اليوم؟ 💫`;
  }
}
