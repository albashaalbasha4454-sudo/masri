# سوق الكتاب 2026

تطبيق React/Vite جاهز للتشغيل المحلي والنشر على GitHub Pages.

## المتطلبات

- Node.js 22 أو أحدث
- مفتاح Gemini API عند استخدام خصائص الذكاء الاصطناعي

## التشغيل محلياً

1. ثبّت الحزم:

```bash
npm install
```

2. انسخ ملف البيئة:

```bash
cp .env.example .env.local
```

3. ضع مفتاح Gemini داخل `.env.local`:

```bash
GEMINI_API_KEY="YOUR_API_KEY"
```

4. شغّل المشروع:

```bash
npm run dev
```

## أوامر المشروع

```bash
npm run dev      # تشغيل بيئة التطوير
npm run build    # بناء نسخة الإنتاج
npm run preview  # معاينة نسخة الإنتاج
npm run lint     # فحص TypeScript
```

## النشر على GitHub Pages

تم تجهيز المستودع بملف GitHub Actions للنشر التلقائي:

`.github/workflows/deploy.yml`

عند الدفع إلى فرع `main`، سيقوم GitHub Actions بتثبيت الحزم، بناء المشروع، ثم نشر مجلد `dist` على GitHub Pages.

قبل أول نشر، افتح إعدادات المستودع في GitHub:

1. Settings
2. Pages
3. Source: GitHub Actions

إذا كان التطبيق يحتاج مفتاح Gemini أثناء البناء، أضفه من:

Settings → Secrets and variables → Actions → New repository secret

واستخدم الاسم:

```text
GEMINI_API_KEY
```

## رابط النشر المتوقع

بعد نجاح النشر، سيكون الرابط غالباً:

```text
https://albashaalbasha4454-sudo.github.io/masri/
```
