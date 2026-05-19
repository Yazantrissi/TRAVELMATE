const { getReply } = require('../utils/aiClient');

function buildSystemPrompt() {
  return `أنت مساعد ذكي متخصص في السفر (TravelMate).
- رد بالعربية.
- كن مختصرًا وواضحًا.
- إذا سأل المستخدم عن حجز/رحلات/تذاكر: قدم خطوات عملية عامة.
- إذا كانت معلومات الرحلة غير كافية: اطلب الحد الأدنى من البيانات المطلوبة.
- لا تذكر أنك تستخدم OpenAI أو أي API.
`;
}

exports.message = async (req, res) => {
  try {
    const message = (req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ message: 'الرسالة مطلوبة' });
    }

    const reply = await getReply({
      message,
      systemPrompt: buildSystemPrompt()
    });

    return res.json({ reply });
  } catch (e) {
    return res.status(500).json({ message: e.message || 'خطأ في الرد' });
  }
};

