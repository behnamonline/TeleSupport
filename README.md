# TeleSupport 🎧

سیستم پشتیبانی آنلاین بر پایه **Cloudflare Workers** و **Telegram**.

---

## 🚀 مراحل راه‌اندازی

### ۱. ساخت ربات و دریافت چت آیدی

1. به ربات [@BotFather](https://t.me/BotFather) در تلگرام پیام داده و یک ربات جدید بسازید (`/newbot`) تا **توکن ربات** را دریافت کنید.
2. به ربات [@userinfobot](https://t.me/userinfobot) در تلگرام پیام دهید تا **Chat ID** حساب تلگرام خود را دریافت کنید.

---

### ۲. تنظیم کدهای Backend (`worker.js`)

فایل `worker.js` را باز کرده و در ابتدای کد، مقادیر زیر را جایگزین کنید:

```javascript
const bot_token = "توکن_دریافتی_از_بات‌فادر";
const chat_id = "چت_آیدی_دریافتی_از_یوزراینفوبات";
```

سپس کد را در پنل **Cloudflare Workers** مستقر (Deploy) کرده و دامنه یا آدرس Worker خود را کپی کنید.

مثال:

```text
https://your-worker.workers.dev
```

---

### ۳. تنظیم Webhook تلگرام

برای اتصال ربات تلگرام به Cloudflare Worker، آدرس زیر را یک بار در مرورگر خود باز کنید:

```text
https://your-worker.workers.dev/init
```

> **نکته:** به‌جای `https://your-worker.workers.dev` آدرس واقعی Worker خود را قرار دهید.

با مشاهده پیام موفقیت، Webhook فعال می‌شود.

---

### ۴. تنظیم Frontend (`client.html`)

فایل `client.html` را باز کرده و در ابتدای بخش اسکریپت، مقدار `WORKER_URL` را برابر با آدرس Worker خود قرار دهید:

```javascript
const WORKER_URL = "https://your-worker.workers.dev";
```

حالا می‌توانید کد موجود در `client.html` را در وب‌سایت خود قرار دهید تا ویجت چت پشتیبانی فعال شود.

---

## 📁 فایل‌های پروژه

```text
TeleSupport/
├── client.html
├── worker.js
└── README.md
```

## ⚡ تکنولوژی‌ها

* Cloudflare Workers
* Cloudflare KV
* Telegram Bot API
* HTML / CSS / JavaScript
