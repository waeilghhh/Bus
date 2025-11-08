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
      const { message } = req.body;
      
      console.log('Received message:', message);
      
      // رد تجريبي مباشر - تأكد أن السيرفر يعمل
      return res.status(200).json({
        success: true,
        reply: `✅ السيرفر يعمل! استلمت رسالتك: "${message}"`
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'خطأ في السيرفر: ' + error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
