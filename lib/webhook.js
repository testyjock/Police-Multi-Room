// รับข้อความที่ผู้ใช้ส่งเข้า LINE Official Account:
//  - "เชื่อมต่อแจ้งเตือน ABC123" -> ผูกบัญชี LINE นี้กับการจองที่มีรหัสนั้น
//  - "แอดมิน <รหัสผ่านแอดมิน>"   -> ลงทะเบียนเป็นผู้รับแจ้งเตือนฝั่งแอดมิน
//  - "เลิกเป็นแอดมิน"             -> ยกเลิกการเป็นผู้รับแจ้งเตือนฝั่งแอดมิน
// ข้อความอื่นๆ จะไม่ตอบ (ไม่รบกวนการใช้งานบัญชีตามปกติ)
const CODE_RE = /(?<![A-Z0-9])([A-HJ-NP-Z2-9]{6})(?![A-Z0-9])/;
const one = (x) => (Array.isArray(x) ? x[0] : x);

export async function processEvents(events, { supabase, reply, adminPassword }) {
  for (const ev of events || []) {
    if (ev.type !== "message" || ev.message?.type !== "text") continue;
    const userId = ev.source?.userId;
    if (!userId || !ev.replyToken) continue;
    const text = String(ev.message.text || "").trim();
    try {
      await handleText({ text, userId, replyToken: ev.replyToken, supabase, reply, adminPassword });
    } catch (e) {
      console.error("webhook event failed:", e);
    }
  }
}

async function handleText({ text, userId, replyToken, supabase, reply, adminPassword }) {
  const adminCmd = text.match(/^แอดมิน\s+(\S+)$/);
  if (adminCmd) {
    if (!adminPassword) return reply(replyToken, "ยังไม่ได้ตั้งรหัสผ่านแอดมินบนเซิร์ฟเวอร์ (ADMIN_PASSWORD)");
    if (adminCmd[1] !== adminPassword) return reply(replyToken, "รหัสผ่านแอดมินไม่ถูกต้อง");
    const { error } = await supabase.from("line_admins").upsert({ line_user_id: userId }, { onConflict: "line_user_id" });
    if (error) throw error;
    return reply(replyToken, "ลงทะเบียนเป็นแอดมินแล้ว คุณจะได้รับแจ้งเตือนการจองที่ผู้จองเลือกรับแจ้งเตือนผ่าน LINE\n(พิมพ์ “เลิกเป็นแอดมิน” เพื่อยกเลิก)");
  }

  if (text === "เลิกเป็นแอดมิน") {
    const { error } = await supabase.from("line_admins").delete().eq("line_user_id", userId);
    if (error) throw error;
    return reply(replyToken, "ยกเลิกการเป็นผู้รับแจ้งเตือนแอดมินแล้ว");
  }

  const code = text.toUpperCase().match(CODE_RE)?.[1];
  if (!code || !/เชื่อมต่อ/.test(text)) return;

  const { data: link, error } = await supabase
    .from("line_links")
    .select("booking_id, device_token, line_user_id, bookings(item_label, date, start_time, end_time, code)")
    .eq("link_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!link) return reply(replyToken, "ไม่พบรหัสนี้ หรือการจองถูกยกเลิกไปแล้ว กรุณาตรวจรหัสจากหน้าเว็บอีกครั้ง");
  if (link.line_user_id && link.line_user_id !== userId)
    return reply(replyToken, "รหัสนี้ถูกใช้เชื่อมต่อกับบัญชี LINE อื่นไปแล้ว");

  const b = one(link.bookings) || {};
  const up = await supabase.from("line_links").update({ line_user_id: userId }).eq("booking_id", link.booking_id);
  if (up.error) throw up.error;
  if (link.device_token && b.code) {
    const dv = await supabase
      .from("line_devices")
      .upsert({ device_token: link.device_token, student_code: b.code, line_user_id: userId }, { onConflict: "device_token,student_code" });
    if (dv.error) throw dv.error;
  }
  return reply(
    replyToken,
    `เชื่อมต่อสำเร็จ ✅\nการจอง ${b.item_label || ""} วันที่ ${b.date || ""} เวลา ${b.start_time || ""}–${b.end_time || ""} น.\nจะแจ้งเตือนก่อนถึงคิว 10 นาที และตอนถึงเวลาให้ยืนยันการมาถึง\n(ครั้งต่อไปที่จองจากเครื่องเดิมด้วยรหัสนิสิตเดิมและเลือกรับแจ้งเตือน ไม่ต้องเชื่อมต่อซ้ำ)`
  );
}
