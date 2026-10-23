import { serverSupabase, siteUrl } from "../lib/env.js";
import { linePush } from "../lib/line.js";
import { runReminders } from "../lib/reminders.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

// ถูกเรียกทุก 1 นาทีโดยตัวตั้งเวลา (pg_cron ของ Supabase หรือ cron-job.org) พร้อมรหัสลับ CRON_SECRET
async function handle(request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") || url.searchParams.get("key") || "";
  if (!secret || given !== secret) return json({ error: "unauthorized" }, 401);

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const extraAdminIds = (process.env.LINE_ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  try {
    const result = await runReminders({
      supabase: serverSupabase(),
      push: (to, text) => linePush(token, to, text),
      siteUrl: siteUrl(),
      extraAdminIds,
    });
    return json(result);
  } catch (e) {
    return json({ error: String(e.message) }, 500);
  }
}

export const GET = handle;
export const POST = handle;
