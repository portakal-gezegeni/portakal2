// api/chat.js
// Bu fonksiyon Vercel'de sunucu tarafında çalışır.
// Groq API anahtarı burada, sadece Vercel'in gizli ortam değişkenlerinde durur.
// Tarayıcı bu dosyayı hiçbir zaman göremez.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel Environment Variables içine GROQ_API_KEYS adıyla
  // virgülle ayrılmış bir veya birden fazla key koyabilirsin.
  const keysEnv = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
  const keys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({ error: 'Sunucuda GROQ_API_KEYS tanımlı değil.' });
  }

  // Birden fazla key varsa rastgele birini seç (basit yük dağıtımı)
  const apiKey = keys[Math.floor(Math.random() * keys.length)];

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await groqResponse.json();
    return res.status(groqResponse.status).json(data);
  } catch (e) {
    console.error('Groq proxy hatası:', e);
    return res.status(500).json({ error: 'Groq isteği başarısız oldu.', detail: e.message });
  }
}
