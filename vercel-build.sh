#!/bin/bash
# نص برمجي لبناء المشروع على Vercel
# This script runs during the build process on Vercel

# تعيين متغيرات البيئة
export NODE_ENV=production

# التأكد من وجود قاعدة بيانات
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# تثبيت الاعتماديات
echo "Installing dependencies..."
npm ci

# بناء التطبيق الأمامي
echo "Building frontend..."
npm run build

# التأكد من وجود مجلد dist
if [ ! -d "dist" ]; then
  echo "Error: Build failed, dist directory not created"
  exit 1
fi

# إعداد المجلدات الضرورية
mkdir -p dist/server
mkdir -p dist/shared

# نسخ ملفات الخادم (Server) والمشتركة (Shared)
echo "Copying server files for production..."
cp -r server/* dist/server/
cp -r shared/* dist/shared/

# حفظ بعض المعلومات عن البناء للمرجع
BUILD_INFO="Build completed at $(date)"
BUILD_INFO="$BUILD_INFO\nNode version: $(node -v)"
BUILD_INFO="$BUILD_INFO\nNPM version: $(npm -v)"
echo -e "$BUILD_INFO" > dist/build-info.txt

echo "تم بناء التطبيق بنجاح للنشر على Vercel!"