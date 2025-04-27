# إرشادات نشر متجر TEDx على Vercel

هذا الملف يقدم إرشادات خطوة بخطوة لنشر تطبيق متجر TEDx على منصة Vercel.

## المتطلبات الأساسية

1. حساب على [Vercel](https://vercel.com)
2. قاعدة بيانات PostgreSQL (نوصي باستخدام [Neon](https://neon.tech) لتوافقها مع Vercel Serverless)
3. خدمة بريد إلكتروني مثل [SendGrid](https://sendgrid.com) (اختياري)

## خطوات النشر

### 1. إعداد قاعدة البيانات

1. قم بإنشاء قاعدة بيانات PostgreSQL على Neon أو أي منصة مماثلة.
2. احصل على رابط الاتصال (Connection URL) واحتفظ به للخطوات التالية.

### 2. رفع المشروع إلى GitHub

1. قم بإنشاء مستودع جديد على GitHub.
2. ارفع كود المشروع إلى المستودع:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/tedx-store.git
git push -u origin main
```

### 3. إعداد المشروع على Vercel

1. قم بتسجيل الدخول إلى [Vercel](https://vercel.com).
2. انقر على "Import Project" واختر مستودع GitHub.
3. اختر المستودع الذي قمت برفع المشروع إليه.
4. قم بتعيين المتغيرات البيئية التالية:

```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-random-string
NODE_ENV=production
```

5. إذا كنت تستخدم SendGrid، أضف المتغير البيئي التالي:

```
SENDGRID_API_KEY=your-sendgrid-api-key
```

6. انقر على "Deploy".

### 4. تهيئة قاعدة البيانات

بعد اكتمال النشر، ستحتاج إلى تهيئة قاعدة البيانات:

1. قم بتثبيت CLI الخاص بـ Vercel:

```bash
npm install -g vercel
```

2. قم بتسجيل الدخول:

```bash
vercel login
```

3. قم بسحب المتغيرات البيئية:

```bash
vercel env pull .env
```

4. قم بدفع البنية إلى قاعدة البيانات:

```bash
npm run db:push
```

5. قم بتعبئة البيانات الأولية (اختياري):

```bash
NODE_ENV=production tsx server/seed-db.ts
```

### 5. التحقق من النشر

1. قم بزيارة رابط النشر المقدم من Vercel.
2. تأكد من أن المتجر يعمل بشكل صحيح:
   - تسجيل الدخول/التسجيل
   - عرض المنتجات
   - إتمام عملية شراء
   - التفاعل مع واجهة المستخدم

### 6. ضبط المجال (اختياري)

إذا كنت ترغب في استخدام مجال مخصص:

1. من لوحة تحكم Vercel، انتقل إلى "Domains".
2. أضف المجال الخاص بك.
3. اتبع التعليمات لإعداد سجلات DNS.

## استكشاف الأخطاء وإصلاحها

إذا واجهت مشاكل عند النشر، تحقق من:

1. **المتغيرات البيئية**: تأكد من تكوينها بشكل صحيح.
2. **سجلات البناء**: راجع سجلات البناء على Vercel لمعرفة سبب الأخطاء.
3. **توافق قاعدة البيانات**: تأكد من أن قاعدة البيانات متاحة وأن رابط الاتصال صحيح.
4. **WebSocket**: تأكد من أن websocket تعمل بشكل صحيح. يمكنك فحص السجلات في وحدة التحكم.

## معلومات إضافية

- نظرًا لأن Vercel يستخدم Serverless Functions، فإن اتصالات WebSocket قد تعمل بشكل مختلف عن البيئة المحلية.
- تحقق من [وثائق Vercel](https://vercel.com/docs) للحصول على مزيد من المعلومات حول الـ Serverless Functions وأفضل الممارسات.