const dotenv = require('dotenv');
dotenv.config();

// OpenAI is optional at runtime.
// If OPENAI_API_KEY is not provided, we return a helpful message.
async function getOpenAIReply({ message, systemPrompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'OPENAI_API_KEY غير مضاف في ملف .env حالياً. أضف المفتاح ثم أعد التشغيل.';
  }

  // Use fetch to avoid adding extra dependencies.
  // Node 18+ includes global fetch.
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt || 'أنت مساعد ذكي للسفر. رد بالعربية وبأسلوب مختصر ومفيد.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'لم يتم الحصول على رد من النموذج.';
}

module.exports = { getOpenAIReply };

