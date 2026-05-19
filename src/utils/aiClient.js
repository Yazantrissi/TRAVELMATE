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
  // للـ Google AI Studio/Generative Language API (بدون Vertex)
  // ملاحظة: بعض إصدارات SDK تحتاج baseUrl صارحة لتجنب v1beta غير المتوافق.
  const genAI = new GoogleGenAI({
    apiKey,
    // endpoint الافتراضي غالبًا صحيح، لكن نحدده هنا تجنبًا لتطابق v1beta في حال SDK عندك يستخدمه
    baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com'
  });

  const requestedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${message}` : message;

  // إذا كان اسم النموذج غير مدعوم/غير متاح للحساب أو لإصدار الـ API
  // نجرّب جلب قائمة النماذج المتاحة ثم نختار بديل مناسب.
  let availableModels = [];
  try {
    if (typeof genAI.models?.listModels === 'function') {
      const res = await genAI.models.listModels();
      availableModels = res?.models || res?.data?.models || res?.items || [];
    } else if (typeof genAI.listModels === 'function') {
      const res = await genAI.listModels();
      availableModels = res?.models || res?.data?.models || res?.items || [];
    }
  } catch (e) {
    // لا نمنع الاستدعاء حتى لو فشل جلب النماذج
  }

  if (process.env.DEBUG_MODE === 'true') {
    console.log('[Gemini] requestedModel=', requestedModel);
    console.log('[Gemini] availableModelsCount=', Array.isArray(availableModels) ? availableModels.length : 0);
    const namesPreview = availableModels
      ?.map(m => m?.name || m?.model || m?.id)
      ?.filter(Boolean)
      ?.slice(0, 15);
    console.log('[Gemini] availableModelsPreview=', namesPreview);
  }

  const normalizeModelName = m => {
    if (!m) return '';
    return m.name || m.model || m.id || '';
  };

  const candidateNames = availableModels.map(normalizeModelName).filter(Boolean);

  const pickModel = () => {
    if (!candidateNames.length) return requestedModel;
    if (candidateNames.includes(requestedModel)) return requestedModel;

    const requestedLower = requestedModel.toLowerCase();

    // fallback داخل عائلة gemini-1.5
    const fallbacks15 = candidateNames.filter(n => n.toLowerCase().includes('gemini-1.5'));
    if (requestedLower.includes('gemini-1.5') && fallbacks15.length) return fallbacks15[0];

    // fallback عام لأي gemini
    const geminiAny = candidateNames.filter(n => n.toLowerCase().includes('gemini'));
    if (geminiAny.length) return geminiAny[0];

    return requestedModel;
  };

  const modelName = pickModel();

  let result;
  try {
    result = await genAI.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ]
    });
  } catch (err) {
    // إذا كان النموذج ما زال يسبب 404 جرّب مرة ثانية على أول model متاح
    if (candidateNames.length && modelName !== candidateNames[0]) {
      result = await genAI.models.generateContent({
        model: candidateNames[0],
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ]
      });
    } else if (requestedModel !== modelName && modelName) {
      // لا يوجد candidateNames أو listModels رجع فاضي: جرّب طلب استخدام نموذج بديل جاهز معروف
      const hardFallbacks = ['gemini-1.5-pro', 'gemini-1.5-flash-8b', 'gemini-1.5-flash-latest'];
      const fb = hardFallbacks.find(x => x.toLowerCase() !== modelName.toLowerCase());
      if (fb) {
        result = await genAI.models.generateContent({
          model: fb,
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }]
            }
          ]
        });
      } else {
        throw err;
      }
    } else {
      // أظهر معلومات أوضح بدل استمرار خطأ الـ404 غير مفسّر
      if (process.env.DEBUG_MODE === 'true') {
        console.log('[Gemini] generateContent failed with model=', modelName);
      }
      throw err;
    }
  }

  const text =
    result?.response?.text?.() ||
    result?.text ||
    result?.candidates?.[0]?.content?.parts?.map(p => p?.text).join('') ||
    '';

  return text.trim() || 'لم يتم الحصول على رد من النموذج.';
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

