# متجر TEDx الإلكتروني

منصة تجارة إلكترونية لبيع تذاكر TEDx ومنتجاتها مع نظام نقاط فريد للشراء.

## التقنيات المستخدمة

- **واجهة أمامية**: React, Tailwind CSS, Framer Motion
- **خادم**: Express.js, WebSockets
- **قاعدة بيانات**: PostgreSQL مع Drizzle ORM
- **مصادقة**: Passport.js

## كيفية التثبيت

### متطلبات النظام

- Node.js v20 أو أحدث
- PostgreSQL 15 أو أحدث

### الإعداد

1. استنسخ المستودع:
```bash
git clone https://github.com/username/tedx-store.git
cd tedx-store
```

2. قم بتثبيت التبعيات:
```bash
npm install
```

3. قم بإنشاء ملف `.env` من نسخة `.env.example`:
```bash
cp .env.example .env
```

4. قم بتعديل ملف `.env` لإضافة تفاصيل قاعدة البيانات الخاصة بك وسر الجلسة.

5. قم بدفع مخطط قاعدة البيانات:
```bash
npm run db:push
```

6. قم بتعبئة قاعدة البيانات بالبيانات الأولية:
```bash
NODE_ENV=development tsx server/seed-db.ts
```

## تشغيل التطبيق

```bash
npm run dev
```

سيكون التطبيق متاحًا على `http://localhost:3000`.

## النشر على Vercel

1. قم بإنشاء حساب في Vercel وقم بتثبيت CLI الخاص به:
```bash
npm install -g vercel
```

2. قم بتسجيل الدخول إلى Vercel:
```bash
vercel login
```

3. قم بالنشر:
```bash
vercel
```

4. قم بتعيين المتغيرات البيئية في لوحة تحكم Vercel:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `SENDGRID_API_KEY` (اختياري)

5. قم بتعبئة قاعدة البيانات:
```bash
vercel env pull .env
npx drizzle-kit push
NODE_ENV=production tsx server/seed-db.ts
```

## الميزات

- مصادقة المستخدمين (تسجيل الدخول/التسجيل)
- عرض المنتجات وتصفيتها حسب الفئة
- سلة التسوق والدفع
- نظام النقاط للشراء
- لوحة تحكم المسؤول
- نظام الرسائل بين المستخدمين والمسؤولين
- تحديثات في الوقت الحقيقي عبر WebSockets
- واجهة مستخدم متجاوبة
- البريد الإلكتروني الترحيبي للمشتركين الجدد

## المساهمة

نرحب بالمساهمات! يرجى إنشاء طلب سحب لأي تغييرات ترغب في إجرائها.