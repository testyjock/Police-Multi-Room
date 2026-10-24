// ตรรกะแจ้งเตือนผ่าน LINE: ก่อนถึงคิว 10 นาที / เมื่อถึงเวลาให้ยืนยันการมาถึง / แจ้งเมื่อถูกยกเลิกเพราะไม่ยืนยัน
export const TZ_OFFSET = "+07:00"; // เวลาประเทศไทย
export const REMIND_MIN = 10;
export const GRACE_MIN = 10;
// แจ้งยกเลิกเฉพาะการจองที่เลยเส้นตายมาไม่เกินกี่นาที (เก่ากว่านี้ปล่อยให้หน้าเว็บเป็นคนลบ ไม่ส่งข้อความย้อนหลัง)
export const CANCEL_WINDOW_MIN = 30;

const MIN = 60000;
const one = (x) => (Array.isArray(x) ? x[0] : x);

export const startOf = (b) => new Date(`${b.date}T${b.start_time}:00${TZ_OFFSET}`);
// เส้นตายการยืนยัน = เวลาเริ่มจอง (หรือเวลาที่กดจอง ถ้ากดจองหลังเวลาเริ่ม) + 10 นาที เหมือนฝั่งหน้าเว็บ
export const deadlineOf = (b) =>
  new Date(Math.max(startOf(b).getTime(), new Date(b.created_at).getTime()) + GRACE_MIN * MIN);

// ผู้จอง: ใช้บัญชี LINE ที่เชื่อมกับการจองนี้ หรือที่เคยเชื่อมไว้จากเครื่องเดียวกันด้วยรหัสนิสิตเดิม
function resolveBooker(row, b, devices) {
  return (
    row.line_user_id ||
    (row.device_token &&
      devices.find((d) => d.device_token === row.device_token && d.student_code === b.code)?.line_user_id) ||
    null
  );
}

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

    const bookerId = resolveBooker(row, b, devices);
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

// การจองที่ผู้จองรับแจ้งเตือนผ่าน LINE แต่ไม่ได้ยืนยันการมาถึงทันเวลา:
// ส่งข้อความ "โต๊ะของคุณถูกยกเลิก..." ก่อน แล้วค่อยลบการจอง (ลบแล้วข้อมูลการเชื่อม LINE จะหายตามไปด้วย)
export function planCancellations({ links, devices = [], now, siteUrl = "" }) {
  const out = [];
  const site = siteUrl ? `\nถ้ายังต้องการใช้งาน จองใหม่ได้ที่ ${siteUrl}` : "";
  for (const row of links) {
    const b = one(row.bookings);
    if (!b || b.confirmed !== false) continue;
    const dl = deadlineOf(b);
    if (Number.isNaN(dl.getTime())) continue;
    const late = now - dl;
    if (late <= 0 || late > CANCEL_WINDOW_MIN * MIN) continue;
    const bookerId = resolveBooker(row, b, devices);
    if (!bookerId) continue; // ไม่ได้เชื่อม LINE: ปล่อยให้หน้าเว็บเป็นคนลบ
    out.push({
      bookingId: row.booking_id,
      to: bookerId,
      alreadyNotified: !!row.booker_cancel_sent,
      text: `โต๊ะของคุณถูกยกเลิกเนื่องจากไม่ได้กดยืนยันการมาถึง\n${b.item_label} เวลา ${b.start_time}–${b.end_time} น.${site}`,
    });
  }
  return out;
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
  const result = { checked: (links || []).length, planned: plans.length, sent: 0, failed: 0, cancelled: 0, errors: [] };

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

  // แจ้งผู้จองที่ลืมยืนยัน แล้วลบการจองที่หมดเวลา
  const cancels = planCancellations({ links: links || [], devices: devices || [], now, siteUrl });
  for (const c of cancels) {
    if (!c.alreadyNotified) {
      try {
        await push(c.to, c.text);
        result.sent++;
        // ถ้ายังไม่ได้เพิ่มคอลัมน์ booker_cancel_sent คำสั่งนี้จะ error เงียบๆ (แค่ไม่มีตัวกันส่งซ้ำ)
        await supabase.from("line_links").update({ booker_cancel_sent: true }).eq("booking_id", c.bookingId);
      } catch (e) {
        result.failed++;
        result.errors.push(String(e.message).slice(0, 200));
        if (isRetryable(e)) continue; // ลองใหม่รอบถัดไป ยังไม่ลบการจอง
      }
    }
    // ลบเฉพาะการจองที่ยังไม่ยืนยัน (กันกรณีเพิ่งกดยืนยันพอดี)
    const del = await supabase.from("bookings").delete().eq("id", c.bookingId).eq("confirmed", false);
    if (!del.error) result.cancelled++;
  }
  return result;
}
