// api/transcribe.js
// Mikrofon kaydını Groq Whisper API'ye sunucu üzerinden iletir.
// Ses dosyası multipart/form-data olarak geldiği için body parser'ı kapatıyoruz
// ve gelen veriyi olduğu gibi Groq'a iletiyoruz.

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keysEnv = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
  const keys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({ error: 'Sunucuda GROQ_API_KEYS tanımlı değil.' });
  }

  const apiKey = keys[Math.floor(Math.random() * keys.length)];

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': req.headers['content-type']
      },
      body: bodyBuffer
    });

    const data = await groqResponse.json();
    return res.status(groqResponse.status).json(data);
  } catch (e) {
    console.error('Groq transcribe proxy hatası:', e);
    return res.status(500).json({ error: 'Ses tanıma isteği başarısız oldu.', detail: e.message });
  }
}
