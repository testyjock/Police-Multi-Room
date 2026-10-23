import { serverSupabase } from "../lib/env.js";
import { verifySignature, lineReply } from "../lib/line.js";
import { processEvents } from "../lib/webhook.js";

// เปิดลิงก์นี้ในเบราว์เซอร์เพื่อเช็คว่าระบบทำงานอยู่
export function GET() {
  return new Response("LINE webhook is running");
}

// LINE เรียกมาที่นี่ทุกครั้งที่มีคนส่งข้อความเข้าบัญชี LINE Official Account
export async function POST(request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-line-signature"), process.env.LINE_CHANNEL_SECRET)) {
    return new Response("invalid signature", { status: 401 });
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return new Response("bad request", { status: 400 });
  }
  if (Array.isArray(body.events) && body.events.length > 0) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    await processEvents(body.events, {
      supabase: serverSupabase(),
      reply: (replyToken, text) => lineReply(token, replyToken, text),
      adminPassword: process.env.ADMIN_PASSWORD,
    });
  }
  return new Response("ok");
}
