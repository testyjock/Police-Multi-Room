import { createClient } from "@supabase/supabase-js";

// สร้างตัวเชื่อมฐานข้อมูลฝั่งเซิร์ฟเวอร์ (ใช้ Secret key ซึ่งเห็นได้เฉพาะบนเซิร์ฟเวอร์ ห้ามใส่ในไฟล์ฝั่งหน้าเว็บ)
export function serverSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL / SUPABASE_SECRET_KEY ใน Vercel");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ลิงก์เว็บ ใช้แนบท้ายข้อความแจ้งเตือน
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "";
}
