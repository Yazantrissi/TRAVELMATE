# TODO - إضافة Chatbot

## Step 1: فهم المتطلبات
- [x] فحص المشروع الحالي: يوجد بالفعل نظام شات للمستخدمين والـ Groups و Trip Rooms
- [x] تحديد نوع البوت: (2) ذكاء اصطناعي عبر API خارجي (LLM)

## Step 2: تحديد نقاط التعديل في الكود
- [ ] قراءة / فهم أماكن routing controller الحالية للـ chat
- [ ] إضافة Endpoint جديد لبوت الدردشة

## Step 3: تنفيذ البوت (LLM)
- [x] إضافة منطق استدعاء LLM API داخل server
- [x] تجهيز عميل OpenAI مع fallback عند غياب OPENAI_API_KEY
- [x] (لاحقاً) إضافة/تحديث وصف .env للتعامل مع OPENAI_API_KEY



## Step 4: حفظ محادثات البوت (اختياري)
- [ ] تحديد هل سنخزن محادثات البوت في chat_messages أم لا

## Step 5: اختبار سريع
- [ ] تشغيل السيرفر والتأكد من عمل endpoint الجديد عبر Postman
- [x] إضافة endpoint chatbot: POST /api/chat/bot/message


