#!/bin/bash

# بناء جانب العميل (Frontend)
npm run build

# إعداد المجلدات الضرورية
mkdir -p dist/server
mkdir -p dist/shared

# نسخ ملفات الخادم (Server) والمشتركة (Shared)
cp -r server/* dist/server/
cp -r shared/* dist/shared/

# إنشاء ملف تهيئة لضمان التنفيذ الصحيح
cat > dist/vercel-serverless.js << EOL
const { createServer } = require('http');
const express = require('express');
const path = require('path');
const app = express();

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعادة توجيه جميع الطلبات إلى index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// إنشاء الخادم HTTP
const server = createServer(app);

// عرض سبب النشر بنجاح
console.log('تم نشر التطبيق بنجاح على Vercel!');

module.exports = app;
EOL

echo "تم بناء التطبيق بنجاح للنشر على Vercel!"