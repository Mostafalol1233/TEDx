#!/bin/bash

# بناء التطبيق
npm run build

# نسخ المجلدات المطلوبة للخادم
mkdir -p dist/server
mkdir -p dist/shared

cp -r server/* dist/server/
cp -r shared/* dist/shared/

echo "تم بناء التطبيق بنجاح!"