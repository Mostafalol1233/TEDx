# TEDx Events Platform

منصة لبيع تذاكر وتيشيرتات أحداث TEDx.

## متطلبات النظام

- Node.js 18 أو أحدث
- PostgreSQL 14 أو أحدث

## تثبيت وتشغيل المشروع محليًا

1. استنساخ المشروع:
```bash
git clone <رابط-المشروع>
cd <اسم-المجلد>
```

2. تثبيت الاعتماديات:
```bash
npm install
```

3. إنشاء ملف `.env` باستخدام ملف `.env.example` كمرجع:
```bash
cp .env.example .env
```

4. تعديل المتغيرات البيئية في ملف `.env` وفقًا لإعداداتك المحلية.

5. إنشاء قاعدة البيانات وتحديثها:
```bash
npm run db:push
```

6. تسييد قاعدة البيانات بالبيانات الأولية:
```bash
# يمكنك تشغيل أمر التسييد بواسطة:
NODE_ENV=development tsx server/seed-db.ts
```

7. تشغيل المشروع في وضع التطوير:
```bash
npm run dev
```

## نشر المشروع على Vercel

1. قم بإنشاء حساب على [Vercel](https://vercel.com/) إذا لم يكن لديك واحد بالفعل.

2. قم بإعداد قاعدة بيانات PostgreSQL (يمكنك استخدام [Neon](https://neon.tech/) أو [Supabase](https://supabase.com/) للحصول على قاعدة بيانات PostgreSQL مستضافة مجانًا).

3. نشر المشروع على Vercel:
   - ربط مستودع GitHub الخاص بك
   - إعداد المتغيرات البيئية في إعدادات Vercel:
     - `DATABASE_URL`
     - `SESSION_SECRET`

4. قم بتشغيل أمر تحديث قاعدة البيانات بعد النشر:
```bash
npx drizzle-kit push:pg
```

5. قم بتسييد قاعدة البيانات:
```bash
node dist/server/seed-db.js
# أو
NODE_ENV=production tsx server/seed-db.ts
```

## المميزات الرئيسية

- واجهة مستخدم احترافية مع تصميم متجاوب
- نظام مصادقة للمستخدمين والمشرفين
- إدارة المنتجات (تذاكر وتيشيرتات)
- سلة التسوق والدفع
- لوحة تحكم المشرف
- نظام النقاط للمستخدمين