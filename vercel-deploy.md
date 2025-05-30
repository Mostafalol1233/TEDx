# دليل نشر المشروع على Vercel

## متطلبات ما قبل النشر

1. **حساب على Vercel**
   - قم بالتسجيل في [Vercel](https://vercel.com) إذا لم يكن لديك حساب.
   - قم بتثبيت Vercel CLI عن طريق تنفيذ `npm i -g vercel` على جهازك.

2. **قاعدة بيانات Neon PostgreSQL**
   - تأكد من أن لديك قاعدة بيانات مستضافة على [Neon](https://neon.tech).
   - احصل على رابط اتصال قاعدة البيانات (DATABASE_URL).

## إعداد متغيرات البيئة

قبل النشر، يجب إعداد المتغيرات البيئية التالية في مشروع Vercel:

1. `DATABASE_URL` - رابط الاتصال بقاعدة البيانات Neon
2. `SESSION_SECRET` - مفتاح سري للجلسات (كلمة مرور طويلة وآمنة)
3. `NODE_ENV` - يجب تعيينه إلى `production`
4. `SENDGRID_API_KEY` - مفتاح API الخاص بـ SendGrid (إذا كنت تستخدم ميزة إرسال البريد الإلكتروني)

## خطوات النشر

### 1. تحضير المشروع للنشر

قبل النشر، تأكد من عمل الخطوات التالية:

```bash
# بناء المشروع
npm run build

# تأكد من أن ملف vercel.json موجود ومكون بشكل صحيح
# تأكد من أن ملف package.json يحتوي على نصوص البناء الصحيحة
```

### 2. نشر المشروع باستخدام Vercel CLI

```bash
# قم بالدخول إلى حسابك
vercel login

# نشر المشروع بدون إعدادات المتغيرات البيئية (يمكنك إضافتها لاحقًا)
vercel

# أو للنشر مباشرة إلى الإنتاج
vercel --prod
```

### 3. إعداد المتغيرات البيئية في لوحة تحكم Vercel

1. انتقل إلى لوحة تحكم Vercel
2. اختر مشروعك
3. انتقل إلى "Settings" > "Environment Variables"
4. أضف جميع متغيرات البيئة المذكورة سابقًا

### 4. إعادة نشر المشروع بعد التعديلات (إذا لزم الأمر)

```bash
# إعادة النشر بعد التعديلات
vercel --prod
```

## الخصائص المدعومة في Vercel

عند النشر على Vercel، تكون الميزات التالية متوفرة:

- ✅ واجهة المستخدم الرسومية وواجهة برمجة التطبيقات REST
- ✅ قاعدة بيانات PostgreSQL عبر Neon
- ✅ مصادقة المستخدم
- ✅ تخصيص المنتجات وإدارتها
- ✅ نظام الطلبات والدفع بالنقاط
- ✅ تصميم متجاوب للجوال والأجهزة اللوحية والحواسب المكتبية
- ✅ تحسينات الأداء والتحميل السريع

### تنبيه بخصوص دعم WebSocket

⚠️ **ملاحظة هامة**: لا تدعم Vercel Serverless Functions اتصالات WebSocket المستمرة. يتم تقديم دعم محدود لـ WebSocket في هذا المشروع عن طريق:

1. استخدام طلبات متكررة من الجانب الأمامي لتحديث البيانات
2. تكييف التطبيق ليعمل دون WebSockets في بيئة الإنتاج

إذا كنت تحتاج إلى دعم كامل لـ WebSocket في بيئة الإنتاج، فكر في خيارات النشر الأخرى مثل:
- Railway
- Render
- Heroku
- AWS

## اختبار المشروع بعد النشر

بعد النشر، تأكد من اختبار الميزات التالية:

1. تسجيل الدخول والتسجيل
2. عرض المنتجات
3. إضافة المنتجات إلى سلة التسوق
4. إكمال عملية الشراء
5. إرسال الرسائل (ملاحظة: قد تعمل بشكل مختلف عن البيئة المحلية)