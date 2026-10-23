// ตรรกะแจ้งเตือนผ่าน LINE: ก่อนถึงคิว 10 นาที และเมื่อถึงเวลาให้ยืนยันการมาถึง
export const TZ_OFFSET = "+07:00"; // เวลาประเทศไทย
export const REMIND_MIN = 10;
export const GRACE_MIN = 10;

const MIN = 60000;
const one = (x) => (Array.isArray(x) ? x[0] : x);

export const startOf = (b) => new Date(`${b.date}T${b.start_time}:00${TZ_OFFSET}`);
// เส้นตายการยืนยัน = เวลาเริ่มจอง (หรือเวลาที่กดจอง ถ้ากดจองหลังเวลาเริ่ม) + 10 นาที เหมือนฝั่งหน้าเว็บ
export const deadlineOf = (b) =>
  new Date(Math.max(startOf(b).getTime(), new Date(b.created_at).getTime()) + GRACE_MIN * MIN);

// คืนรายการข้อความที่ต้องส่งตอนนี้ แต่ละรายการ = (การจอง, กลุ่มผู้รับ, ธงที่ใช้กันส่งซ้ำ)
export function planMessages({ links, devices = [], adminIds = [], now, siteUrl = "" }) {
  const plans = [];
  const site = siteUrl ? `\n${siteUrl}` : "";
  for (const row of links) {
    const b = one(row.bookings);
    if (!b) continue;
    const st = startOf(b);
    const dl = deadlineOf(b);
    if (Number.isNaN(st.getTime()) || Number.isNaN(dl.getTime())) continue;

    const soon = now < st && st - now <= REMIND_MIN * MIN;
    const arrive = b.confirmed === false && now >= st && now <= dl;
    if (!soon && !arrive) continue;

    const mins = Math.ceil((st - now) / MIN);
    const minsLeft = Math.max(0, Math.ceil((dl - now) / MIN));
    const label = b.item_label;
    const when = `${b.start_time}–${b.end_time} น.`;

    // ผู้จอง: ใช้บัญชี LINE ที่เชื่อมกับการจองนี้ หรือที่เคยเชื่อมไว้จากเครื่องเดียวกันด้วยรหัสนิสิตเดิม
    const bookerId =
      row.line_user_id ||
      (row.device_token &&
        devices.find((d) => d.device_token === row.device_token && d.student_code === b.code)?.line_user_id) ||
      null;
    const admins = adminIds.filter((id) => id !== bookerId);

    if (soon) {
      if (bookerId && !row.booker_remind_sent) {
        plans.push({
          bookingId: row.booking_id,
          flag: "booker_remind_sent",
          to: [bookerId],
          text: `⏰ อีก ${mins} นาทีถึงคิวของคุณ\n${label}\nเวลา ${when}\nเมื่อมาถึงโต๊ะ อย่าลืมกดยืนยันการมาถึงที่เว็บ${site}`,
        });
      }
      if (admins.length && !row.admin_remind_sent) {
        plans.push({
          bookingId: row.booking_id,
          flag: "admin_remind_sent",
          to: admins,
          text: `[แอดมิน] อีก ${mins} นาทีถึงคิว\nผู้จอง: ${b.name}\n${label}\nเวลา ${when}`,
        });
      }
    }
    if (arrive) {
      if (bookerId && !row.booker_arrive_sent) {
        plans.push({
          bookingId: row.booking_id,
          flag: "booker_arrive_sent",
          to: [bookerId],
          text: `📍 ถึงเวลาจองแล้ว\n${label} (${when})\nอย่าลืมกดยืนยันการมาถึงภายใน ${minsLeft} นาที ไม่เช่นนั้นการจองจะถูกยกเลิกอัตโนมัติ${site}`,
        });
      }
      if (admins.length && !row.admin_arrive_sent) {
        plans.push({
          bookingId: row.booking_id,
          flag: "admin_arrive_sent",
          to: admins,
          text: `[แอดมิน] ถึงเวลาจองแล้ว ยังไม่ได้ยืนยันการมาถึง\nผู้จอง: ${b.name}\n${label} (${when})\nจะถูกยกเลิกอัตโนมัติถ้าไม่ยืนยันภายใน ${minsLeft} นาที`,
        });
      }
    }
  }
  return plans;
}

// ข้อผิดพลาดชั่วคราว (เครือข่าย / โควตาเต็ม / เซิร์ฟเวอร์ LINE ขัดข้อง) จะลองส่งใหม่รอบถัดไป
const isRetryable = (e) => !e.status || e.status === 429 || e.status >= 500;

export async function runReminders({ supabase, push, now = new Date(), siteUrl = "", extraAdminIds = [] }) {
  const { data: links, error } = await supabase.from("line_links").select("*, bookings(*)");
  if (error) throw new Error(`โหลด line_links ไม่สำเร็จ: ${error.message}`);
  const { data: devices } = await supabase.from("line_devices").select("*");
  const { data: admins } = await supabase.from("line_admins").select("line_user_id");
  const adminIds = [...new Set([...(admins || []).map((a) => a.line_user_id), ...extraAdminIds])];

  const plans = planMessages({ links: links || [], devices: devices || [], adminIds, now, siteUrl });
  const result = { checked: (links || []).length, planned: plans.length, sent: 0, failed: 0, errors: [] };

  for (const p of plans) {
    let retry = false;
    for (const to of p.to) {
      try {
        await push(to, p.text);
        result.sent++;
      } catch (e) {
        result.failed++;
        result.errors.push(String(e.message).slice(0, 200));
        if (isRetryable(e)) retry = true;
      }
    }
    if (!retry) await supabase.from("line_links").update({ [p.flag]: true }).eq("booking_id", p.bookingId);
  }
  return result;
}
