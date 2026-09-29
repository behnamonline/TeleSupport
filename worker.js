const bot_token = "7491823056:AAFx9K2pM_qR8vZtL3nYxW4k7mQ1e9P0oBc";
const chat_id = "612365621";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response("OK", { headers });

    // ۱. ست کردن خودکار وب‌هوک تلگرام
    if (url.pathname === "/init") {
      const webhookUrl = `${url.origin}/telegram-webhook`;
      const res = await fetch(`https://api.telegram.org/bot${bot_token}/setWebhook?url=${webhookUrl}`);
      const data = await res.json();
      return new Response(JSON.stringify({ message: "Webhook Status", telegram_response: data }), { headers });
    }

    // ۲. دریافت وب‌هوک از سمت تلگرام
    if (url.pathname === "/telegram-webhook" && request.method === "POST") {
      try {
        const update = await request.json();

        // کلیک روی دکمه شیشه‌ای "شروع گفتگو"
        if (update.callback_query) {
          const query = update.callback_query;
          const userId = query.data.replace("accept_", "");

          // به‌روزرسانی وضعیت در KV
          let data = JSON.parse(await env.CHAT_KV.get(userId) || "{}");
          data.status = "accepted";
          await env.CHAT_KV.put(userId, JSON.stringify(data));

          // نمایش پاپ‌آپ روی تلگرام
          await fetch(`https://api.telegram.org/bot${bot_token}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: query.id,
              text: "✅ گفت‌وگو شروع شد!",
              show_alert: true
            })
          });

          // ویرایش دکمه و پیام قبلی
          await fetch(`https://api.telegram.org/bot${bot_token}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              text: `🟢 **چت تایید شد**\nID: ${userId}`
            })
          });

          // ارسال پیام جدید به ادمین جهت ریپلای زدن مستقیم
          await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chat_id,
              text: `💬 **چت فعال شد!**\nID: ${userId}\n\nبرای ارسال پیام به کاربر روی این پیام Reply بزنید:`
            })
          });
        }

        // دریافت پیام متنی پشتیبان (Reply)
        if (update.message && update.message.reply_to_message) {
          const replyText = update.message.reply_to_message.text || "";
          const match = replyText.match(/ID: (usr_[a-z0-9]+)/);
          if (match) {
            const userId = match[1];
            let data = JSON.parse(await env.CHAT_KV.get(userId) || '{"messages":[]}');
            data.messages = data.messages || [];
            data.messages.push({ sender: "admin", text: update.message.text, time: Date.now() });
            await env.CHAT_KV.put(userId, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error("Webhook Error:", err);
      }

      return new Response("OK", { headers });
    }

    // ۳. ایجاد کاربر جدید و شروع گفت‌وگو (تغییر یافته به /start)
    if (url.pathname === "/start") {
      const userId = "usr_" + Math.random().toString(36).substr(2, 8);
      const initData = { status: "pending", messages: [] };
      await env.CHAT_KV.put(userId, JSON.stringify(initData));

      // ارسال هشدار به تلگرام با دکمه شیشه‌ای
      await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat_id,
          text: `🔔 چت جدید!\nID: ${userId}`,
          reply_markup: {
            inline_keyboard: [[{ text: "✅ شروع گفتگو", callback_data: `accept_${userId}` }]]
          }
        })
      });

      return new Response(JSON.stringify({ userId }), { headers });
    }

    // ۴. دریافت پیام جدید از کاربر سایت
    if (url.pathname === "/send" && request.method === "POST") {
      const { userId, text } = await request.json();
      let data = JSON.parse(await env.CHAT_KV.get(userId) || '{"messages":[]}');
      data.messages = data.messages || [];
      data.messages.push({ sender: "user", text, time: Date.now() });
      await env.CHAT_KV.put(userId, JSON.stringify(data));

      // ارسال پیام به تلگرام
      await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat_id,
          text: `💬 پیام از ID: ${userId}\n\n${text}`
        })
      });

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // ۵. دریافت داده (Polling)
    if (url.pathname === "/poll") {
      const userId = url.searchParams.get("userId");
      const data = await env.CHAT_KV.get(userId);
      return new Response(data || JSON.stringify({ status: "pending", messages: [] }), { headers });
    }

    return new Response("Not Found", { status: 404, headers });
  }
};
