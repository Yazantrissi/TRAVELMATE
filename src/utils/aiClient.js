const dotenv = require('dotenv');
dotenv.config();

/**
 * OpenAI (optional at runtime)
 */
async function getOpenAIReply({ message, systemPrompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'OPENAI_API_KEY غير مضاف في ملف .env حالياً. أضف المفتاح ثم أعد التشغيل.';
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            systemPrompt || 'أنت مساعد ذكي للسفر. رد بالعربية وبأسلوب مختصر ومفيد.'
        },
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
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    'لم يتم الحصول على رد من النموذج.'
  );
}

/**
 * Gemini (optional at runtime)
 */
async function getGeminiReply({ message, systemPrompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return 'GEMINI_API_KEY غير مضاف في ملف .env حالياً. أضف المفتاح ثم أعد التشغيل.';
  }

  const { GoogleGenAI } = require('@google/genai');
  const genAI = new GoogleGenAI(apiKey);

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${message}`
    : message;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }]
      }
    ]
  });

  const text = result?.response?.text?.();
  return (text || '').trim() || 'لم يتم الحصول على رد من النموذج.';
}

/**
 * Decide which provider to use.
 * - Prefer Gemini if GEMINI_API_KEY exists
 * - Otherwise fallback to OpenAI if OPENAI_API_KEY exists
 */
async function getReply({ message, systemPrompt }) {
  if (process.env.GEMINI_API_KEY) {
    return getGeminiReply({ message, systemPrompt });
  }

  return getOpenAIReply({ message, systemPrompt });
}

module.exports = {
  getOpenAIReply,
  getGeminiReply,
  getReply
};

