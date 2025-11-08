// api/chat.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    try {
        const response = await fetch('https://api.deepseek.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-v3-0324',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        console.log('DeepSeek Response:', JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            return res.status(500).json({ error: 'لم يتم استقبال الرد من النموذج', data });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('DeepSeek API Error:', error);
        res.status(500).json({ error: error.message });
    }
}
