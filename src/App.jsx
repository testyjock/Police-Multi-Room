import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------
   ห้องเอนกประสงค์คณะรัฐศาสตร์ ม.บูรพา — ระบบจองที่นั่ง (v2)
--------------------------------------------------------- */
const ITEMS = [
  { id: "sofa-3", label: "โซฟาเล็ก", num: "3", type: "sofa", c: [1, 3], r: [4, 6] },
  { id: "sofa-2", label: "โซฟาเล็ก", num: "2", type: "sofa", c: [1, 3], r: [7, 9] },
  { id: "sofa-1", label: "โซฟาเล็ก", num: "1", type: "sofa", c: [1, 3], r: [10, 12] },
  { id: "sofa-4", label: "โซฟาเล็ก", num: "4", type: "sofa", c: [3, 4], r: [12, 13] },
  { id: "sofa-big", label: "โซฟาใหญ่", num: "", type: "sofa", c: [1, 4], r: [13, 15] },

  { id: "round-8", label: "โต๊ะกลม", num: "8", type: "round", c: [4, 5], r: [3, 4] },
  { id: "round-7", label: "โต๊ะกลม", num: "7", type: "round", c: [4, 5], r: [4, 5] },
  { id: "round-6", label: "โต๊ะกลม", num: "6", type: "round", c: [4, 5], r: [5, 6] },
  { id: "round-5", label: "โต๊ะกลม", num: "5", type: "round", c: [4, 5], r: [6, 7] },
  { id: "round-4", label: "โต๊ะกลม", num: "4", type: "round", c: [4, 5], r: [7, 8] },
  { id: "round-3", label: "โต๊ะกลม", num: "3", type: "round", c: [4, 5], r: [8, 9] },
  { id: "round-2", label: "โต๊ะกลม", num: "2", type: "round", c: [4, 5], r: [9, 10] },
  { id: "round-1", label: "โต๊ะกลม", num: "1", type: "round", c: [4, 5], r: [10, 11] },

  { id: "small-9", label: "โต๊ะเล็ก", num: "9", type: "small", c: [5, 6], r: [5, 6] },
  { id: "small-10", label: "โต๊ะเล็ก", num: "10", type: "small", c: [6, 7], r: [5, 6] },
  { id: "small-7", label: "โต๊ะเล็ก", num: "7", type: "small", c: [5, 6], r: [6, 7] },
  { id: "small-8", label: "โต๊ะเล็ก", num: "8", type: "small", c: [6, 7], r: [6, 7] },
  { id: "small-5", label: "โต๊ะเล็ก", num: "5", type: "small", c: [5, 6], r: [7, 8] },
  { id: "small-6", label: "โต๊ะเล็ก", num: "6", type: "small", c: [6, 7], r: [7, 8] },
  { id: "small-3", label: "โต๊ะเล็ก", num: "3", type: "small", c: [5, 6], r: [8, 9] },
  { id: "small-4", label: "โต๊ะเล็ก", num: "4", type: "small", c: [6, 7], r: [8, 9] },
  { id: "small-2", label: "โต๊ะเล็ก", num: "2", type: "small", c: [6, 7], r: [9, 10] },
  { id: "small-1", label: "โต๊ะเล็ก", num: "1", type: "small", c: [5, 6], r: [9, 10] },
  { id: "small-11", label: "โต๊ะเล็ก", num: "11", type: "small", c: [5, 6], r: [3, 4] },
  { id: "small-12", label: "โต๊ะเล็ก", num: "12", type: "small", c: [6, 7], r: [3, 4] },
  { id: "small-13", label: "โต๊ะเล็ก", num: "13", type: "small", c: [8, 9], r: [9, 10] },

  { id: "middle-2", label: "โต๊ะกลาง", num: "2", type: "middle", c: [8, 9], r: [5, 7] },
  { id: "middle-1", label: "โต๊ะกลาง", num: "1", type: "middle", c: [8, 9], r: [7, 9] },

  { id: "big-2", label: "โต๊ะใหญ่", num: "2", type: "big", c: [10, 12], r: [1, 4] },
  { id: "big-1", label: "โต๊ะใหญ่", num: "1", type: "big", c: [7, 9], r: [12, 15] },

  { id: "bar-14", label: "บาร์", num: "14", type: "bar", c: [13, 14], r: [1, 2] },
  { id: "bar-13", label: "บาร์", num: "13", type: "bar", c: [13, 14], r: [2, 3] },
  { id: "bar-12", label: "บาร์", num: "12", type: "bar", c: [13, 14], r: [3, 4] },
  { id: "bar-11", label: "บาร์", num: "11", type: "bar", c: [13, 14], r: [4, 5] },
  { id: "bar-10", label: "บาร์", num: "10", type: "bar", c: [13, 14], r: [5, 6] },
  { id: "bar-9", label: "บาร์", num: "9", type: "bar", c: [13, 14], r: [6, 7] },
  { id: "bar-8", label: "บาร์", num: "8", type: "bar", c: [13, 14], r: [7, 8] },
  { id: "bar-7", label: "บาร์", num: "7", type: "bar", c: [13, 14], r: [8, 9] },
  { id: "bar-6", label: "บาร์", num: "6", type: "bar", c: [13, 14], r: [9, 10] },
  { id: "bar-5", label: "บาร์", num: "5", type: "bar", c: [13, 14], r: [10, 11] },
  { id: "bar-4", label: "บาร์", num: "4", type: "bar", c: [13, 14], r: [11, 12] },
  { id: "bar-3", label: "บาร์", num: "3", type: "bar", c: [13, 14], r: [12, 13] },
  { id: "bar-1", label: "บาร์", num: "1", type: "bar", c: [10, 11], r: [12, 13] },
  { id: "bar-2", label: "บาร์", num: "2", type: "bar", c: [11, 12], r: [12, 13] },
];

const LANDMARKS = [
  { id: "lm-room", label: "สโมสรนิสิต", c: [2, 9], r: [1, 2] },
  { id: "lm-bath", label: "ห้องน้ำ", c: [10, 13], r: [13, 15] },
  { id: "lm-door1", label: "ประตู 1", c: [5, 7], r: [15, 16] },
  { id: "lm-door2", label: "ประตู 2", c: [13, 14], r: [13, 15] },
  { id: "lm-door3", label: "ประตู 3", c: [1, 2], r: [2, 4] },
];

const HELP_STEPS = [
  {
    title: "เลือกวันที่",
    body: "ที่ด้านบนของหน้า “ผังที่นั่ง” เลือกวันที่ต้องการจอง (ถ้าไม่เลือก ระบบจะใช้วันนี้)",
  },
  {
    title: "เลือกที่นั่ง",
    body: "กดที่โต๊ะ โซฟา หรือบาร์ที่ต้องการในผัง ถ้าใช้มือถือ เลื่อนผังไปทางซ้าย-ขวาได้ หรือสลับไปแท็บ “รายการจอง” เพื่อเลือกจากรายการแทน",
  },
  {
    title: "กรอกข้อมูลแล้วกดยืนยันการจอง",
    body: "ตั้งเวลาเริ่มและเวลาสิ้นสุด (จองได้ครั้งละไม่เกิน 3 ชั่วโมง) ใส่ชื่อผู้จอง และรหัสนิสิต รหัสนิสิตนี้ใช้เป็นรหัสผ่านสำหรับยืนยันการมาถึงและยกเลิกการจอง โปรดจำไว้ แล้วกด “ยืนยันการจอง” ระบบจะขึ้นข้อความเตือนให้ยืนยันอีกครั้งก่อนบันทึก",
  },
  {
    title: "ยืนยันการมาถึงภายใน 10 นาที",
    body: "เมื่อถึงเวลาจอง ให้ไปที่ห้อง เปิดเว็บ กดที่นั่งที่จองไว้ กด “ยืนยันการมาถึง” และใส่รหัสนิสิต ต้องทำภายใน 10 นาทีหลังเวลาเริ่ม ถ้าไม่ยืนยัน การจองจะถูกยกเลิกอัตโนมัติและคนอื่นจองต่อได้",
  },
  {
    title: "ยกเลิกการจอง (ถ้าไปไม่ได้ หรือใช้เสร็จก่อนเวลา)",
    body: "กดที่นั่งที่จองไว้ กด “ยกเลิก” และใส่รหัสนิสิตที่ใช้ตอนจอง ควรยกเลิกทุกครั้งที่ไปไม่ได้ หรือใช้งานเสร็จก่อนเวลา เพื่อคืนที่นั่งให้คนอื่นใช้ต่อ",
  },
];

const HELP_FAQ = [
  {
    q: "ที่นั่งเป็นสีแดง ยังจองช่วงเวลาอื่นได้ไหม",
    a: "ได้ สีแดงบอกเฉพาะสถานะ “ตอนนี้” ว่ามีคนใช้อยู่ ไม่ได้แปลว่าจองไม่ได้ทั้งวัน กดที่นั่งสีแดงได้ตามปกติ ในหน้าต่างที่เปิดขึ้นจะมีรายการเวลาที่ถูกจองไว้แล้วของวันนั้น ให้เลือกเวลาเริ่มและเวลาสิ้นสุดที่ไม่ชนกับรายการเหล่านั้น หรือเปลี่ยนวันที่ที่ด้านบนของหน้าเพื่อจองวันอื่น ระบบจะไม่ให้จองเฉพาะช่วงเวลาที่ชนกับคนอื่นเท่านั้น",
  },
  {
    q: "มีการแจ้งเตือนบนมือถือไหม",
    a: "ถ้าเปิดเว็บค้างไว้ในเครื่องที่ใช้จอง จะมีแถบเตือนก่อนถึงคิว 10 นาที และตอนถึงเวลาจะเตือนให้กดยืนยันการมาถึง",
  },
  {
    q: "อยากใช้โต๊ะนานกว่า 3 ชั่วโมงทำอย่างไร",
    a: "ระบบจำกัดการจองครั้งละไม่เกิน 3 ชั่วโมง เพื่อให้ทุกคนได้ใช้โต๊ะอย่างเท่าเทียมกัน ถ้าต้องการใช้งานต่อ ให้จองอีกครั้งในช่วงเวลาถัดไป เช่น จอง 13:00–16:00 แล้วจองต่อ 16:00–19:00 และกดยืนยันการมาถึงอีกครั้งเมื่อเริ่มช่วงที่สอง",
  },
  {
    q: "ใช้งานเสร็จก่อนเวลาที่จองไว้ ต้องทำอย่างไร",
    a: "กดที่นั่งที่จองไว้ กด “ยกเลิก” แล้วใส่รหัสนิสิตที่ใช้ตอนจอง ที่นั่งจะกลับเป็นสีเขียวทันที คนอื่นจะได้ใช้ต่อ",
  },
  { q: "จองซ้อนเวลากับคนอื่นได้ไหม", a: "ไม่ได้ ถ้าช่วงเวลาชนกับการจองที่มีอยู่ ระบบจะแจ้งเตือนและไม่บันทึกให้" },
  { q: "ลืมรหัสนิสิตที่ใช้ตอนจอง", a: "ระบบไม่สามารถกู้รหัสให้ได้ กรุณาติดต่อผู้ดูแลระบบ" },
  { q: "ที่นั่งเป็นสีแดงทั้งที่ไม่มีคนนั่ง", a: "อาจเป็นสถานะ “รอยืนยัน” คือมีคนจองไว้แล้วและกำลังอยู่ในช่วง 10 นาทีที่ต้องยืนยัน ถ้าไม่มีใครยืนยัน ที่นั่งจะกลับเป็นสีเขียวเอง" },
];

const TYPE_TH = { sofa: "โซฟา", round: "โต๊ะกลม", small: "โต๊ะเล็ก", middle: "โต๊ะกลาง", big: "โต๊ะใหญ่", bar: "บาร์" };

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const toMin = (hm) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};
const overlaps = (aS, aE, bS, bE) => toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);

// รหัสผ่านผู้ดูแล ใช้ได้ 2 อย่าง: ล้างข้อมูลการจองทั้งหมด และยกเลิกการจองของคนอื่น (แก้เปลี่ยนได้ที่บรรทัดนี้)
const ADMIN_PASSWORD = "687786";
// ต้องกดยืนยันการมาถึงภายในกี่นาทีหลังเวลาจองเริ่ม
const GRACE_MIN = 10;
// จองได้ครั้งละไม่เกินกี่ชั่วโมง (เพื่อให้ทุกคนได้ใช้โต๊ะอย่างเท่าเทียมกัน)
const MAX_BOOKING_HOURS = 3;
// ปิดเว็บชั่วคราว: เปลี่ยนเป็น true แล้ว Commit + Push เพื่อปิด / เปลี่ยนกลับเป็น false แล้ว Push เพื่อเปิดอีกครั้ง
const SITE_CLOSED = false;
const CLOSED_MESSAGE = "ระบบจองที่นั่งปิดให้บริการชั่วคราว ขออภัยในความไม่สะดวก";
// ลิงก์แบบประเมินเว็บไซต์ (Google Form) ที่จะเด้งขึ้นหลังจองสำเร็จ
const SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeiZw51sslKJnZQ74i_kkuXizWIM02ZV3gj4kRCdiXOm9-zcQ/viewform?usp=dialog";
const startDateOf = (b) => new Date(`${b.date}T${b.start}:00`);
// เส้นตายการยืนยัน = เวลาเริ่มจอง (หรือเวลาที่กดจอง ถ้ากดจองหลังเวลาเริ่มไปแล้ว) + 10 นาที
const deadlineOf = (b) =>
  new Date(Math.max(startDateOf(b).getTime(), new Date(b.createdAt).getTime()) + GRACE_MIN * 60000);
const isExpired = (b, nowDate) => !b.confirmed && nowDate > deadlineOf(b);

// เตือนล่วงหน้ากี่นาทีก่อนถึงคิว
const REMIND_MIN = 10;

// ===== การแจ้งเตือนผ่าน LINE Official Account =====
// เปลี่ยนเป็น true เมื่อตั้งค่าฝั่งเซิร์ฟเวอร์ตามไฟล์ LINE-SETUP.md เสร็จแล้ว (ถ้ายังไม่เสร็จ ให้เป็น false เพื่อซ่อนตัวเลือกนี้)
const LINE_ENABLED = true;
// ลิงก์เพิ่มเพื่อนบัญชี LINE Official Account
const LINE_ADD_FRIEND_URL = "https://lin.ee/VyMsPvw";
const LINK_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomChars = (n) => {
  const arr = new Uint32Array(n);
  try {
    crypto.getRandomValues(arr);
  } catch (e) {
    for (let i = 0; i < n; i++) arr[i] = Math.floor(Math.random() * 4294967296);
  }
  return Array.from(arr, (v) => LINK_CHARS[v % LINK_CHARS.length]).join("");
};
// รหัสประจำเครื่อง (เก็บในเครื่อง) ใช้จำว่าเครื่องนี้เคยเชื่อมต่อ LINE แล้ว จะได้ไม่ต้องเชื่อมซ้ำทุกครั้งที่จอง
const getDeviceToken = () => {
  try {
    let t = localStorage.getItem("polsci-device-token");
    if (!t) {
      t = randomChars(24);
      localStorage.setItem("polsci-device-token", t);
    }
    return t;
  } catch (e) {
    return randomChars(24);
  }
};
const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
};
const roundedNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return `${pad(d.getHours() % 24)}:${pad(d.getMinutes())}`;
};
const plusHour = (hm) => {
  let m = toMin(hm) + 60;
  if (m >= 24 * 60) m = 23 * 60 + 59;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

const rowToBooking = (row) => ({
  id: row.id,
  itemId: row.item_id,
  itemLabel: row.item_label,
  itemType: row.item_type,
  date: row.date,
  start: row.start_time,
  end: row.end_time,
  name: row.name,
  code: row.code,
  confirmed: row.confirmed !== false,
  note: row.note || "",
  createdAt: row.created_at,
});

export default function App() {
  const [bookings, setBookings] = useState([]);
  const [dbOk, setDbOk] = useState(true);
  const [tab, setTab] = useState("map");
  const [now, setNow] = useState(new Date());
  const [bookDate, setBookDate] = useState(todayStr());
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", note: "", line: "no", start: roundedNow(), end: plusHour(roundedNow()) });
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [clearError, setClearError] = useState("");
  const [action, setAction] = useState(null); // { id, type: "cancel" | "confirm" }
  const [actionCode, setActionCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [success, setSuccess] = useState(null); // ข้อมูลการจองที่เพิ่งสำเร็จ (ใช้แสดงป๊อปอัป)
  // รหัสการจองที่ทำจากเครื่องนี้ (เก็บในเครื่อง) ใช้ตัดสินว่าจะเตือนใคร
  const [myIds, setMyIds] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem("polsci-my-bookings") || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  });
  const [dismissedKey, setDismissedKey] = useState("");
  const reapRef = useRef(false);
  const [tipSeen, setTipSeen] = useState(() => {
    try {
      return localStorage.getItem("polsci-tip-seen") === "1";
    } catch (e) {
      return true;
    }
  });
  const dismissTip = () => {
    setTipSeen(true);
    try {
      localStorage.setItem("polsci-tip-seen", "1");
    } catch (e) {
      /* ignore */
    }
  };

  // ถ้าผู้ใช้แก้ข้อมูลในฟอร์มหลังขึ้นข้อความเตือนแล้ว ให้กลับไปขั้นตอนกรอกข้อมูลใหม่
  useEffect(() => {
    setConfirmStep(false);
  }, [form]);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    if (SITE_CLOSED) return;
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) {
      setDbOk(false);
      return;
    }
    setDbOk(true);
    setBookings((data || []).map(rowToBooking));
  }, []);

  useEffect(() => {
    load();
    const clock = setInterval(() => setNow(new Date()), 15000);
    pollRef.current = setInterval(load, 30000);
    const channel = supabase
      .channel("bookings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => {
      clearInterval(clock);
      clearInterval(pollRef.current);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const todayNow = todayStr();
  const nowHMs = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // การจองที่ยังไม่ยืนยันและเลยเส้นตายแล้ว ถือว่าหมดอายุ: ซ่อนทันที และถูกลบออกจากฐานข้อมูลอัตโนมัติ
  const visibleBookings = useMemo(() => bookings.filter((b) => !isExpired(b, now)), [bookings, now]);

  useEffect(() => {
    const expired = bookings.filter((b) => isExpired(b, now));
    if (expired.length === 0 || reapRef.current) return;
    reapRef.current = true;
    supabase
      .from("bookings")
      .delete()
      .in("id", expired.map((b) => b.id))
      .eq("confirmed", false)
      .then(({ error }) => {
        if (!error) load();
      })
      .finally(() => {
        reapRef.current = false;
      });
  }, [bookings, now, load]);

  const liveBookingFor = useCallback(
    (itemId) =>
      visibleBookings.find(
        (b) => b.itemId === itemId && b.date === todayNow && toMin(b.start) <= toMin(nowHMs) && toMin(nowHMs) < toMin(b.end)
      ),
    [visibleBookings, todayNow, nowHMs]
  );

  const nextBookingFor = useCallback(
    (itemId) =>
      visibleBookings.filter((b) => b.itemId === itemId && b.date === bookDate).sort((a, b) => toMin(a.start) - toMin(b.start)),
    [visibleBookings, bookDate]
  );

  const openItem = (item) => {
    setSelected(item);
    const s = roundedNow();
    setForm({ name: "", code: "", note: "", line: "no", start: s, end: plusHour(s) });
    setFormError("");
    setAction(null);
  };
  const closeModal = () => {
    setSelected(null);
    setConfirmStep(false);
    setFormError("");
    setAction(null);
    setActionCode("");
    setActionError("");
  };

  // ตรวจข้อมูลก่อนจอง คืนข้อความ error หรือ null ถ้าผ่าน
  const validateBooking = () => {
    if (!selected) return "ไม่พบที่นั่งที่เลือก";
    if (!form.name.trim()) return "กรุณาใส่ชื่อผู้จอง";
    if (!form.code.trim()) return "กรุณาใส่รหัสนิสิต (ใช้เป็นรหัสผ่านสำหรับยกเลิกภายหลัง)";
    if (toMin(form.end) <= toMin(form.start)) return "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น";
    if (toMin(form.end) - toMin(form.start) > MAX_BOOKING_HOURS * 60)
      return `จองได้ครั้งละไม่เกิน ${MAX_BOOKING_HOURS} ชั่วโมง ถ้าต้องการใช้งานต่อ ให้จองอีกครั้งในช่วงเวลาถัดไป`;
    const conflict = visibleBookings.find(
      (b) => b.itemId === selected.id && b.date === bookDate && overlaps(form.start, form.end, b.start, b.end)
    );
    if (conflict) return `ช่วงเวลานี้ถูกจองแล้วโดย ${conflict.name} (${conflict.start}–${conflict.end})`;
    return null;
  };

  // กดยืนยันการจองครั้งแรก: ตรวจข้อมูล แล้วขึ้นข้อความเตือนให้กดยืนยันอีกครั้ง
  const tryBooking = () => {
    const err = validateBooking();
    if (err) return setFormError(err);
    setFormError("");
    setConfirmStep(true);
  };

  const submitBooking = async () => {
    const err = validateBooking();
    if (err) {
      setConfirmStep(false);
      return setFormError(err);
    }
    const name = form.name.trim();
    const code = form.code.trim();

    setBusy(true);
    const itemLabel = `${selected.label}${selected.num ? " " + selected.num : ""}`;
    const newId = uid();
    const { error } = await supabase.from("bookings").insert({
      id: newId,
      item_id: selected.id,
      item_label: itemLabel,
      item_type: selected.type,
      date: bookDate,
      start_time: form.start,
      end_time: form.end,
      name,
      code,
      note: form.note.trim(),
      created_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) {
      setFormError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    await load();
    const nextIds = [...myIds, newId].slice(-50);
    setMyIds(nextIds);
    try {
      localStorage.setItem("polsci-my-bookings", JSON.stringify(nextIds));
    } catch (e) {
      /* ignore */
    }
    let lineInfo = null;
    let lineFailed = false;
    if (LINE_ENABLED && form.line === "yes") {
      const linkCode = randomChars(6);
      const { error: lineErr } = await supabase
        .from("line_links")
        .insert({ booking_id: newId, link_code: linkCode, device_token: getDeviceToken() });
      if (lineErr) lineFailed = true;
      else lineInfo = { code: linkCode };
    }
    setSuccess({ id: newId, itemLabel, label: itemLabel, date: bookDate, start: form.start, end: form.end, line: lineInfo, lineFailed });
    closeModal();
  };

  const startAction = (id, type) => {
    setAction({ id, type });
    setActionCode("");
    setActionError("");
  };

  const doCancel = async (booking) => {
    if (!actionCode.trim()) return setActionError("กรุณาใส่รหัสนิสิตที่ใช้ตอนจอง");
    const isAdmin = actionCode.trim() === ADMIN_PASSWORD;
    if (!isAdmin && actionCode.trim() !== booking.code) return setActionError("รหัสไม่ถูกต้อง");
    await supabase.from("bookings").delete().eq("id", booking.id);
    await load();
    setAction(null);
    setActionCode("");
    setToast(isAdmin ? "ผู้ดูแลยกเลิกการจองแล้ว" : "ยกเลิกการจองแล้ว");
    setTimeout(() => setToast(""), 2000);
  };

  const doConfirm = async (booking) => {
    if (!actionCode.trim()) return setActionError("กรุณาใส่รหัสนิสิตที่ใช้ตอนจอง");
    if (actionCode.trim() !== booking.code) return setActionError("รหัสไม่ถูกต้อง");
    const nowD = new Date();
    if (nowD < startDateOf(booking)) return setActionError("ยังไม่ถึงเวลาจอง ยืนยันได้เมื่อถึงเวลาเริ่ม");
    if (nowD > deadlineOf(booking)) return setActionError("หมดเวลายืนยันแล้ว การจองนี้จะถูกยกเลิกอัตโนมัติ");
    const { error } = await supabase.from("bookings").update({ confirmed: true }).eq("id", booking.id);
    if (error) return setActionError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    await load();
    setAction(null);
    setActionCode("");
    setToast("ยืนยันการมาถึงแล้ว");
    setTimeout(() => setToast(""), 2000);
  };

  const clearAll = async () => {
    if (clearPassword !== ADMIN_PASSWORD) return setClearError("รหัสผ่านไม่ถูกต้อง");
    await supabase.from("bookings").delete().neq("id", "__none__");
    await load();
    setConfirmClear(false);
    setClearPassword("");
    setClearError("");
    setToast("ล้างข้อมูลการจองทั้งหมดแล้ว");
    setTimeout(() => setToast(""), 2000);
  };

  const stats = useMemo(() => {
    const byName = {};
    const byItem = {};
    visibleBookings.forEach((b) => {
      const n = b.name.trim();
      byName[n] = (byName[n] || 0) + 1;
      byItem[b.itemLabel] = (byItem[b.itemLabel] || 0) + 1;
    });
    const topNames = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topItems = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const recent = [...visibleBookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 20);
    const todayCount = visibleBookings.filter((b) => b.date === todayNow).length;
    return {
      total: visibleBookings.length,
      uniqueUsers: Object.keys(byName).length,
      todayCount,
      topNames,
      topItems,
      recent,
      maxName: topNames.length ? topNames[0][1] : 1,
      maxItem: topItems.length ? topItems[0][1] : 1,
    };
  }, [visibleBookings, todayNow]);

  // เตือนการจองที่ทำจากเครื่องนี้: ก่อนถึงคิว 10 นาที และเมื่อถึงเวลาให้ยืนยันการมาถึง
  const reminder = useMemo(() => {
    const mine = visibleBookings.filter((b) => myIds.includes(b.id));
    for (const b of mine) {
      if (!b.confirmed && now >= startDateOf(b) && now <= deadlineOf(b)) {
        return { kind: "arrive", b, minsLeft: Math.max(0, Math.ceil((deadlineOf(b) - now) / 60000)) };
      }
    }
    for (const b of mine) {
      const diff = startDateOf(b) - now;
      if (diff > 0 && diff <= REMIND_MIN * 60000) return { kind: "soon", b, mins: Math.ceil(diff / 60000) };
    }
    return null;
  }, [visibleBookings, myIds, now]);
  const reminderKey = reminder ? `${reminder.kind}-${reminder.b.id}` : "";

  // สั่นเครื่องเบาๆ เมื่อมีการเตือนใหม่ (ใช้ได้เฉพาะเบราว์เซอร์ที่รองรับ)
  useEffect(() => {
    if (!reminderKey) return;
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch (e) {
      /* ignore */
    }
  }, [reminderKey]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e2) {
        setToast("คัดลอกไม่สำเร็จ กรุณาพิมพ์ข้อความเอง");
        setTimeout(() => setToast(""), 2500);
        return;
      }
    }
    setToast("คัดลอกข้อความแล้ว");
    setTimeout(() => setToast(""), 2000);
  };

  const openReminderSeat = (b) => {
    const it = ITEMS.find((i) => i.id === b.itemId);
    if (!it) return;
    setBookDate(b.date);
    openItem(it);
    setAction({ id: b.id, type: "confirm" });
  };

  const liveFreeCount = ITEMS.length - ITEMS.filter((it) => liveBookingFor(it.id)).length;

  if (SITE_CLOSED) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF7EE",
          color: "#2E2A22",
          fontFamily: "'Noto Sans Thai', sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>ปิดให้บริการชั่วคราว</h1>
          <p style={{ margin: 0, color: "#8C8170", lineHeight: 1.6 }}>{CLOSED_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        :root{
          --bg:#FBF7EE; --panel:#FFFFFF; --panel2:#F4EEDF; --line: rgba(60,50,30,0.14);
          --ink:#2E2A22; --muted:#8C8170; --brass:#A97C22; --brass-bright:#C79A46;
          --green:#4C8B5A; --green-text:#356B41; --green-bg: rgba(76,139,90,0.10);
          --red:#B23A2E; --red-text:#9C2F24; --red-bg: rgba(178,58,46,0.10);
        }
        *{box-sizing:border-box;}
        html{color-scheme:light;}
        body{margin:0;}
        .app{ font-family:'Noto Sans Thai', sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; padding-bottom:40px; }
        .mono{font-family:'IBM Plex Mono', monospace;}
        .serif{font-family:'Noto Serif Thai', serif;}
        .topbar{ position:sticky; top:0; z-index:20; background:rgba(251,247,238,0.96);
          border-bottom:1px solid var(--line); backdrop-filter:blur(6px); padding:14px 16px 12px; }
        .topbar-title{ font-family:'Noto Serif Thai', serif; font-weight:700; font-size:19px; color:var(--ink);
          display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
        .clock{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--brass);
          margin-top:6px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
        .dot.g{background:var(--green);} .dot.r{background:var(--red);}
        .tabs{display:flex; gap:6px; margin-top:12px;}
        .tab-btn{ flex:1; font-family:'Noto Sans Thai'; font-weight:600; font-size:13px; padding:9px 6px;
          border-radius:9px; border:1px solid var(--line); background:var(--panel); color:var(--muted); cursor:pointer; }
        .tab-btn.active{ background:var(--panel2); color:var(--brass); border-color:var(--brass); }
        .toolbar{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:12px 16px 4px; }
        .field-label{font-size:11px; color:var(--muted); display:block; margin-bottom:4px;}
        input[type=date], input[type=time], input[type=text], input[type=password]{ background:var(--panel); border:1px solid var(--line);
          color:var(--ink); border-radius:8px; padding:8px 10px; font-family:'IBM Plex Mono', monospace; font-size:13px; }
        input[type=text], input[type=password]{font-family:'Noto Sans Thai'; font-size:14px;}
        input:focus{outline:2px solid var(--brass); outline-offset:1px;}
        .legend{ display:flex; gap:16px; padding:8px 16px 2px; font-size:12px; color:var(--muted); flex-wrap:wrap; }
        .legend span{display:flex; align-items:center; gap:6px;}
        .sw{width:12px;height:12px;border-radius:3px;display:inline-block;}
        .sw.g{background:var(--green);} .sw.r{background:var(--red);}
        .plan-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; padding:14px 16px 24px; }
        .plan{ display:grid; grid-template-columns: repeat(13, minmax(58px, 1fr)); grid-auto-rows: minmax(46px, auto);
          gap:8px; min-width:900px; background:var(--panel); padding:10px; border:1px solid var(--line); border-radius:16px; }
        .landmark{ display:flex; align-items:center; justify-content:center; text-align:center; border:1px dashed var(--line);
          border-radius:10px; color:var(--muted); font-size:12px; padding:4px; background:var(--panel2); }
        .tile{ border-radius:10px; border:1.5px solid var(--green); background:var(--green-bg); color:var(--green-text);
          display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;
          padding:2px 3px; text-align:center; transition:transform .12s ease; position:relative; user-select:none; }
        .tile:active{transform:scale(0.94);}
        .tile .name{font-size:10.5px; line-height:1.15; font-weight:600;}
        .tile .num{font-family:'IBM Plex Mono'; font-size:13px; font-weight:600;}
        .tile .tag{font-size:9px; font-family:'IBM Plex Mono'; opacity:.85; margin-top:1px;}
        .tile.type-round{border-radius:50%;} .tile.type-sofa{border-radius:20px;} .tile.type-bar{border-radius:6px;}
        .tile.booked{ border-color:var(--red); background:var(--red-bg); color:var(--red-text); }
        .list-view{padding:10px 16px 24px;}
        .group-title{ font-family:'Noto Serif Thai'; color:var(--brass); font-size:14px; font-weight:600;
          margin:16px 0 8px; padding-bottom:6px; border-bottom:1px solid var(--line); }
        .row-item{ display:flex; align-items:center; justify-content:space-between; background:var(--panel);
          border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin-bottom:7px; cursor:pointer; }
        .row-item .l{display:flex; flex-direction:column;}
        .row-item .l b{font-size:14px;}
        .row-item .l small{color:var(--muted); font-size:11.5px; font-family:'IBM Plex Mono';}
        .badge{ font-size:11px; font-family:'IBM Plex Mono'; font-weight:600; padding:4px 9px; border-radius:20px; border:1px solid; }
        .badge.g{color:var(--green-text); border-color:var(--green); background:var(--green-bg);}
        .badge.r{color:var(--red-text); border-color:var(--red); background:var(--red-bg);}
        .modal-overlay{ position:fixed; inset:0; background:rgba(40,34,22,0.35); display:flex; align-items:flex-end; justify-content:center; z-index:50; }
        @media (min-width:640px){ .modal-overlay{align-items:center;} }
        .modal{ background:var(--panel); border:1px solid var(--line); border-radius:18px 18px 0 0; width:100%;
          max-width:440px; max-height:88vh; overflow-y:auto; padding:20px 20px 24px; box-shadow:0 12px 40px rgba(40,34,22,0.18); }
        @media (min-width:640px){ .modal{border-radius:16px;} }
        .modal h3{ font-family:'Noto Serif Thai'; color:var(--ink); font-size:19px; margin:0 0 3px; }
        .modal .sub{color:var(--muted); font-size:12px; margin-bottom:14px; font-family:'IBM Plex Mono';}
        .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px;}
        .full{width:100%;}
        .modal label{display:block; margin-top:12px;}
        .hint{font-size:11px; color:var(--muted); margin-top:3px;}
        .err{ color:var(--red-text); font-size:12.5px; margin-top:10px; background:var(--red-bg);
          border:1px solid var(--red); border-radius:8px; padding:8px 10px; }
        .existing-list{margin-top:12px; padding-top:10px; border-top:1px solid var(--line);}
        .existing-list .h{font-size:11.5px; color:var(--muted); margin-bottom:6px;}
        .exist-row{ padding:8px 0; border-bottom:1px dashed var(--line); font-size:12.5px; }
        .exist-row:last-child{border-bottom:none;}
        .exist-row-top{display:flex; justify-content:space-between; align-items:center;}
        .exist-row-top button{ background:none; border:1px solid var(--red); color:var(--red-text);
          border-radius:7px; font-size:11px; padding:3px 8px; cursor:pointer; }
        .cancel-inline{display:flex; gap:6px; margin-top:8px; align-items:flex-start; flex-wrap:wrap;}
        .cancel-inline input{flex:1; min-width:120px;}
        .cancel-inline button{ border-radius:7px; border:none; font-size:11.5px; padding:6px 10px; cursor:pointer; font-weight:600; }
        .cancel-inline .go{background:var(--red); color:#fff;}
        .cancel-inline .no{background:transparent; border:1px solid var(--line); color:var(--muted);}
        .cancel-inline .ok-go{background:var(--green); color:#fff;}
        .row-actions{display:flex; gap:6px; flex-shrink:0;}
        .exist-row-top button.ok{border-color:var(--green); color:var(--green-text);}
        .status-line{font-size:11.5px; margin-top:3px; color:var(--muted);}
        .status-line.ok{color:var(--green-text);}
        .status-line.warn{color:var(--red-text);}
        .warn-box{margin-top:12px; padding:10px 12px; background:var(--panel2); border:1px solid var(--brass); border-radius:10px; font-size:12.5px; line-height:1.6;}
        .warn-box b{display:block; color:var(--brass); margin-bottom:4px; font-size:13px;}
        .warn-box p{margin:4px 0 0;}
        .fair-note{margin-top:8px; font-size:11.5px; color:var(--muted); line-height:1.55;}
        .fair-note.over{color:var(--red-text); font-weight:600;}
        .survey-box{margin-top:12px; padding:10px 12px; border:1px solid var(--line); border-radius:10px; background:var(--panel); font-size:12.5px; line-height:1.6;}
        .survey-box b{display:block; font-size:13px; margin-bottom:2px;}
        .survey-box p{margin:0;}
        .modal .line-opt{margin-top:12px; padding:10px 12px; border:1px solid var(--line); border-radius:10px; background:var(--panel2);}
        .line-choices{display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;}
        .modal label.chip{display:inline-flex; align-items:center; gap:6px; margin-top:0; padding:7px 12px; border:1px solid var(--line); border-radius:20px; font-size:13px; background:var(--panel); cursor:pointer;}
        .modal label.chip.on{border-color:var(--brass); color:var(--brass); font-weight:600;}
        .line-help{margin-top:10px; font-size:12.5px; line-height:1.6;}
        .line-help p{margin:0 0 6px;}
        .btn.primary.line-btn{background:#06C755; color:#fff;}
        .line-box p{margin:2px 0;}
        .line-code{margin:8px 0; padding:8px 10px; background:var(--panel2); border:1px dashed var(--brass); border-radius:8px; font-family:'IBM Plex Mono','Noto Sans Thai',monospace; font-size:13px; word-break:break-all;}
        .line-actions{display:flex; gap:8px; flex-wrap:wrap;}
        .line-actions .btn{flex:1; min-width:140px; margin-top:8px;}
        .remind-banner{ margin:12px 16px 0; border-radius:10px; padding:10px 12px; display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; font-size:13px; line-height:1.5; border:1px solid var(--brass); background:var(--panel2); }
        .remind-banner.arrive{ border-color:var(--red); background:var(--red-bg); }
        .remind-banner b{display:block; font-size:14px;}
        .rm-sub{color:var(--muted); font-size:12px;}
        .remind-actions{display:flex; gap:6px;}
        .remind-banner button{ border-radius:7px; font-size:12px; padding:6px 12px; cursor:pointer; font-weight:600; font-family:'Noto Sans Thai'; }
        .rm-go{background:var(--brass); color:#fff; border:none;}
        .rm-no{background:transparent; color:var(--muted); border:1px solid var(--line);}
        .linkbtn{display:block; text-align:center; text-decoration:none;}
        .info-box{margin:0 0 12px; padding:8px 10px; background:var(--panel2); border:1px solid var(--line); border-radius:8px; font-size:12px; line-height:1.55; color:var(--ink);}
        .tip-banner{ margin:12px 16px 0; background:var(--panel2); border:1px solid var(--brass); border-radius:10px;
          padding:10px 12px; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap; font-size:13px; }
        .tip-actions{display:flex; gap:6px;}
        .tip-banner button{ border-radius:7px; font-size:12px; padding:6px 12px; cursor:pointer; font-weight:600; font-family:'Noto Sans Thai'; }
        .tip-go{background:var(--brass); color:#fff; border:none;}
        .tip-no{background:transparent; color:var(--muted); border:1px solid var(--line);}
        .help-wrap{padding:16px; max-width:720px; margin:0 auto;}
        .help-title{margin:4px 0 6px; font-size:20px; color:var(--ink);}
        .help-lead{color:var(--muted); font-size:13px; margin:0 0 14px; line-height:1.55;}
        .help-card{background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:14px; margin-bottom:12px;}
        .help-h{font-family:'Noto Serif Thai'; color:var(--brass); font-weight:600; font-size:14px; margin-bottom:8px;}
        .help-legend{display:flex; align-items:flex-start; gap:8px; font-size:13px; margin:6px 0; line-height:1.5;}
        .help-legend .sw{flex-shrink:0; margin-top:4px;}
        .help-note{margin-top:8px; padding:8px 10px; background:var(--panel2); border-radius:8px; font-size:12.5px; line-height:1.55; color:var(--ink);}
        .help-step{display:flex; gap:12px; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 14px; margin-bottom:10px;}
        .help-num{flex:0 0 28px; height:28px; border-radius:50%; background:var(--brass); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono'; font-weight:600; font-size:13px;}
        .help-step b, .help-faq b{display:block; font-size:14px; margin-bottom:2px;}
        .help-step p, .help-faq p{margin:0; font-size:13px; line-height:1.6;}
        .help-faq{padding:8px 0; border-bottom:1px dashed var(--line);}
        .help-faq:last-child{border-bottom:none;}
        .btn{ width:100%; padding:12px; border-radius:10px; border:none; cursor:pointer;
          font-family:'Noto Sans Thai'; font-weight:700; font-size:14.5px; margin-top:16px; }
        .btn.primary{background:var(--brass); color:#fff;}
        .btn.primary:disabled{opacity:.5;}
        .btn.ghost{background:transparent; border:1px solid var(--line); color:var(--muted); margin-top:8px;}
        .stats-wrap{padding:14px 16px 30px;}
        .cards{display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px;}
        .card{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:12px 10px; text-align:center; }
        .card b{display:block; font-family:'IBM Plex Mono'; font-size:22px; color:var(--brass);}
        .card span{font-size:10.5px; color:var(--muted);}
        .bars{margin-bottom:20px;}
        .bar-row{margin-bottom:9px;}
        .bar-row .lbl{display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:3px;}
        .bar-track{height:8px; background:var(--panel2); border-radius:5px; overflow:hidden; border:1px solid var(--line);}
        .bar-fill{height:100%; background:var(--brass); border-radius:5px;}
        table.history{width:100%; border-collapse:collapse; font-size:12px;}
        table.history th{ text-align:left; color:var(--muted); font-weight:600; font-size:10.5px;
          border-bottom:1px solid var(--line); padding:6px 4px; font-family:'IBM Plex Mono'; }
        table.history td{padding:7px 4px; border-bottom:1px dashed var(--line);}
        .empty{color:var(--muted); font-size:12.5px; text-align:center; padding:20px 0;}
        .clear-link{ background:none; border:none; color:var(--muted); font-size:11px; text-decoration:underline;
          cursor:pointer; margin-top:20px; }
        .toast{ position:fixed; bottom:18px; left:50%; transform:translateX(-50%); background:var(--brass);
          color:#fff; font-weight:600; font-size:13px; padding:9px 18px; border-radius:30px; z-index:60;
          box-shadow:0 4px 18px rgba(40,34,22,0.25); }
        .offline-banner{ background:var(--red-bg); border:1px solid var(--red); color:var(--red-text);
          font-size:11.5px; padding:7px 16px; text-align:center; }
      `}</style>

      {!dbOk && (
        <div className="offline-banner">
          เชื่อมต่อฐานข้อมูลไม่สำเร็จ — ตรวจสอบค่า VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY และตาราง bookings ใน Supabase
        </div>
      )}

      <div className="topbar">
        <div className="topbar-title">
          <span className="serif">ระบบจองที่นั่ง</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            ห้องเอนกประสงค์ คณะรัฐศาสตร์ ม.บูรพา
          </span>
        </div>
        <div className="clock">
          <span>{fmtDate(todayNow)} · {nowHMs} น.</span>
          <span>·</span>
          <span><span className="dot g" /> ว่าง {liveFreeCount}/{ITEMS.length}</span>
          <span><span className="dot r" /> ไม่ว่างตอนนี้ {ITEMS.length - liveFreeCount}</span>
        </div>
        <div className="tabs">
          <button className={`tab-btn ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>ผังที่นั่ง</button>
          <button className={`tab-btn ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>รายการจอง</button>
          <button className={`tab-btn ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}>สถิติ</button>
          <button className={`tab-btn ${tab === "help" ? "active" : ""}`} onClick={() => setTab("help")}>วิธีใช้</button>
        </div>
      </div>

      {reminder && dismissedKey !== reminderKey && (
        <div className={`remind-banner ${reminder.kind}`}>
          <div>
            <b>{reminder.kind === "soon" ? `อีก ${reminder.mins} นาทีถึงคิวของคุณ` : "ถึงเวลาแล้ว อย่าลืมยืนยันการมาถึง"}</b>
            <span className="rm-sub">
              {reminder.b.itemLabel} · {reminder.b.start}–{reminder.b.end} น.
              {reminder.kind === "arrive" ? ` · เหลือเวลา ${reminder.minsLeft} นาที` : ""}
            </span>
          </div>
          <div className="remind-actions">
            {reminder.kind === "arrive" && <button className="rm-go" onClick={() => openReminderSeat(reminder.b)}>ยืนยันการมาถึง</button>}
            <button className="rm-no" onClick={() => setDismissedKey(reminderKey)}>ปิด</button>
          </div>
        </div>
      )}

      {tab === "map" && !tipSeen && (
        <div className="tip-banner">
          <span>ใช้งานครั้งแรก? อ่านวิธีใช้สั้นๆ ใช้เวลาไม่ถึง 1 นาที</span>
          <span className="tip-actions">
            <button className="tip-go" onClick={() => { setTab("help"); dismissTip(); }}>ดูวิธีใช้</button>
            <button className="tip-no" onClick={dismissTip}>ปิด</button>
          </span>
        </div>
      )}

      {(tab === "map" || tab === "list") && (
        <>
          <div className="toolbar">
            <div>
              <span className="field-label">วันที่ต้องการจอง</span>
              <input type="date" min={todayStr()} value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
            </div>
          </div>
          <div className="legend">
            <span><span className="sw g" /> ว่าง (สถานะปัจจุบัน)</span>
            <span><span className="sw r" /> ไม่ว่าง (มีผู้ใช้งานอยู่ตอนนี้)</span>
          </div>
        </>
      )}

      {tab === "map" && (
        <div className="plan-wrap">
          <div className="plan">
            {LANDMARKS.map((lm) => (
              <div key={lm.id} className="landmark" style={{ gridColumn: `${lm.c[0]} / ${lm.c[1]}`, gridRow: `${lm.r[0]} / ${lm.r[1]}` }}>
                {lm.label}
              </div>
            ))}
            {ITEMS.map((it) => {
              const live = liveBookingFor(it.id);
              const booked = !!live;
              return (
                <button key={it.id} className={`tile type-${it.type} ${booked ? "booked" : ""}`}
                  style={{ gridColumn: `${it.c[0]} / ${it.c[1]}`, gridRow: `${it.r[0]} / ${it.r[1]}` }}
                  onClick={() => openItem(it)}>
                  <span className="name">{it.label}</span>
                  {it.num && <span className="num">{it.num}</span>}
                  <span className="tag">{live ? (live.confirmed ? "ไม่ว่าง" : "รอยืนยัน") : "ว่าง"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "list" && (
        <div className="list-view">
          {["sofa", "round", "small", "middle", "big", "bar"].map((ty) => (
            <div key={ty}>
              <div className="group-title">{TYPE_TH[ty]}</div>
              {ITEMS.filter((i) => i.type === ty).map((it) => {
                const live = liveBookingFor(it.id);
                const booked = !!live;
                const upcoming = nextBookingFor(it.id).length;
                return (
                  <div className="row-item" key={it.id} onClick={() => openItem(it)}>
                    <div className="l">
                      <b>{it.label} {it.num}</b>
                      <small>{upcoming > 0 ? `${upcoming} รายการจองในวันที่เลือก` : "ยังไม่มีการจองในวันที่เลือก"}</small>
                    </div>
                    <span className={`badge ${booked ? "r" : "g"}`}>{live ? (live.confirmed ? "ไม่ว่าง" : "รอยืนยัน") : "ว่าง"}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="stats-wrap">
          <div className="cards">
            <div className="card"><b>{stats.total}</b><span>การจองทั้งหมด</span></div>
            <div className="card"><b>{stats.uniqueUsers}</b><span>ผู้ใช้งานทั้งหมด</span></div>
            <div className="card"><b>{stats.todayCount}</b><span>การจองวันนี้</span></div>
          </div>
          <div className="bars">
            <div className="group-title" style={{ marginTop: 0 }}>ผู้ใช้งานบ่อยที่สุด</div>
            {stats.topNames.length === 0 && <div className="empty">ยังไม่มีข้อมูล</div>}
            {stats.topNames.map(([name, count]) => (
              <div className="bar-row" key={name}>
                <div className="lbl"><span>{name}</span><span className="mono">{count}</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / stats.maxName) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="bars">
            <div className="group-title">ที่นั่งยอดนิยม</div>
            {stats.topItems.length === 0 && <div className="empty">ยังไม่มีข้อมูล</div>}
            {stats.topItems.map(([label, count]) => (
              <div className="bar-row" key={label}>
                <div className="lbl"><span>{label}</span><span className="mono">{count}</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / stats.maxItem) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="group-title">ประวัติการจองล่าสุด</div>
          {stats.recent.length === 0 ? (
            <div className="empty">ยังไม่มีประวัติการจอง</div>
          ) : (
            <table className="history">
              <thead><tr><th>ที่นั่ง</th><th>ผู้จอง</th><th>วันที่</th><th>เวลา</th></tr></thead>
              <tbody>
                {stats.recent.map((b) => (
                  <tr key={b.id}>
                    <td>{b.itemLabel}</td>
                    <td>{b.name}</td>
                    <td className="mono">{b.date.slice(5)}</td>
                    <td className="mono">{b.start}–{b.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {bookings.length > 0 && !confirmClear && (
            <button className="clear-link" onClick={() => setConfirmClear(true)}>ล้างข้อมูลการจองทั้งหมด</button>
          )}
          {confirmClear && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--red-text)" }}>
              การล้างข้อมูลการจองทั้งหมดไม่สามารถย้อนกลับได้ — ใส่รหัสผ่านผู้ดูแลเพื่อยืนยัน
              <input
                type="password"
                className="full"
                style={{ marginTop: 8 }}
                placeholder="รหัสผ่านผู้ดูแล"
                value={clearPassword}
                onChange={(e) => setClearPassword(e.target.value)}
              />
              {clearError && <div className="err">{clearError}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn primary" style={{ margin: 0 }} onClick={clearAll}>ยืนยันล้างข้อมูล</button>
                <button className="btn ghost" style={{ margin: 0 }} onClick={() => { setConfirmClear(false); setClearPassword(""); setClearError(""); }}>ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "help" && (
        <div className="help-wrap">
          <h2 className="help-title serif">วิธีใช้งานระบบจองที่นั่ง</h2>
          <p className="help-lead">จองโต๊ะ โซฟา หรือที่นั่งบาร์ในห้องเอนกประสงค์ได้ในไม่กี่ขั้นตอน ไม่ต้องสมัครสมาชิก</p>

          <div className="help-card">
            <div className="help-h">สีของที่นั่งบอกอะไร</div>
            <div className="help-legend"><span className="sw g" /> สีเขียว = ว่าง จองได้</div>
            <div className="help-legend"><span className="sw r" /> สีแดง = มีคนใช้อยู่ตอนนี้ หรือเขียนว่า “รอยืนยัน” = จองไว้แล้ว รอผู้จองมายืนยัน</div>
            <div className="help-note">สีแดงบอกเฉพาะสถานะตอนนี้เท่านั้น ที่นั่งสีแดงยังกดจองช่วงเวลาอื่นหรือวันอื่นได้ (ดูคำถามที่พบบ่อยด้านล่าง)</div>
          </div>

          {HELP_STEPS.map((st, i) => (
            <div className="help-step" key={st.title}>
              <div className="help-num">{i + 1}</div>
              <div>
                <b>{st.title}</b>
                <p>{st.body}</p>
              </div>
            </div>
          ))}

          <div className="help-card">
            <div className="help-h">คำถามที่พบบ่อย</div>
            {HELP_FAQ.map((f) => (
              <div className="help-faq" key={f.q}>
                <b>{f.q}</b>
                <p>{f.a}</p>
              </div>
            ))}
            {LINE_ENABLED && (
              <div className="help-faq">
                <b>รับแจ้งเตือนผ่าน LINE ได้อย่างไร</b>
                <p>
                  ตอนจอง เลือก “ใช่ รับแจ้งเตือน” แล้วเพิ่มเพื่อน LINE ของเรา หลังจองสำเร็จให้ส่งข้อความรหัสเชื่อมต่อที่ขึ้นบนหน้าจอเข้าแชต LINE
                  (ทำครั้งเดียวต่อเครื่อง) จากนั้นจะได้รับข้อความก่อนถึงคิว {REMIND_MIN} นาที และตอนถึงเวลาให้ยืนยันการมาถึง
                </p>
              </div>
            )}
          </div>

          <button className="btn primary" onClick={() => setTab("map")}>ไปที่ผังที่นั่ง</button>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.label} {selected.num}</h3>
            <div className="sub">{fmtDate(bookDate)}</div>

            {liveBookingFor(selected.id) && (
              <div className="info-box">
                ที่นั่งนี้ขึ้นสีแดงเพราะ{liveBookingFor(selected.id).confirmed ? "มีคนใช้อยู่" : "มีการจองที่กำลังรอยืนยัน"}ตอนนี้ แต่ยังจองช่วงเวลาอื่นหรือวันอื่นได้ เลือกเวลาที่ไม่ชนกับรายการจองด้านล่างได้เลย
              </div>
            )}

            <div className="grid2">
              <label>
                <span className="field-label">เวลาเริ่ม</span>
                <input className="full" type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
              </label>
              <label>
                <span className="field-label">เวลาสิ้นสุด</span>
                <input className="full" type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
              </label>
            </div>

            <div className={`fair-note ${toMin(form.end) - toMin(form.start) > MAX_BOOKING_HOURS * 60 ? "over" : ""}`}>
              จองได้ครั้งละไม่เกิน {MAX_BOOKING_HOURS} ชั่วโมง เพื่อให้ทุกคนได้ใช้โต๊ะอย่างเท่าเทียมกัน หากต้องการใช้งานต่อ ให้จองอีกครั้งในช่วงเวลาถัดไป
            </div>

            <label>
              <span className="field-label">ชื่อผู้จอง *</span>
              <input className="full" type="text" placeholder="ชื่อ-นามสกุล" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>

            <label>
              <span className="field-label">รหัสนิสิต (ใช้เป็นรหัสผ่านยกเลิกการจอง) *</span>
              <input className="full" type="text" placeholder="เช่น 65xxxxxxxx" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              <div className="hint">โปรดจำรหัสนี้ไว้ — ใช้ยืนยันการมาถึงและยกเลิกการจอง ต้องกดยืนยันการมาถึงภายใน {GRACE_MIN} นาทีหลังเวลาเริ่ม ไม่เช่นนั้นการจองจะถูกยกเลิกอัตโนมัติ</div>
            </label>

            <label>
              <span className="field-label">หมายเหตุ (ถ้ามี)</span>
              <input className="full" type="text" placeholder="เช่น ประชุมกลุ่ม, นัดติว" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </label>

            {LINE_ENABLED && (
              <div className="line-opt">
                <span className="field-label">รับแจ้งเตือนผ่าน LINE Official Account ไหม</span>
                <div className="line-choices">
                  <label className={`chip ${form.line === "yes" ? "on" : ""}`}>
                    <input type="radio" name="line-opt" checked={form.line === "yes"} onChange={() => setForm((f) => ({ ...f, line: "yes" }))} />
                    ใช่ รับแจ้งเตือน
                  </label>
                  <label className={`chip ${form.line !== "yes" ? "on" : ""}`}>
                    <input type="radio" name="line-opt" checked={form.line !== "yes"} onChange={() => setForm((f) => ({ ...f, line: "no" }))} />
                    ไม่รับ
                  </label>
                </div>
                {form.line === "yes" && (
                  <div className="line-help">
                    <p>เราจะส่งข้อความเตือนใน LINE ก่อนถึงคิว {REMIND_MIN} นาที และตอนถึงเวลาให้ยืนยันการมาถึง (ผู้ดูแลระบบจะได้รับข้อความแจ้งเตือนด้วย)</p>
                    <a className="btn primary linkbtn line-btn" href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer">
                      เพิ่มเพื่อน LINE ของเรา
                    </a>
                    <p className="hint">เพิ่มเพื่อนแล้วกลับมาหน้านี้ กด “ยืนยันการจอง” ต่อได้เลย หลังจองสำเร็จจะมีขั้นตอนส่งรหัสเชื่อมต่อใน LINE อีก 1 ครั้ง</p>
                  </div>
                )}
              </div>
            )}

            {formError && <div className="err">{formError}</div>}

            {confirmStep && (
              <div className="warn-box">
                <b>ก่อนยืนยันการจอง โปรดทราบ</b>
                <p>จอง {selected.label} {selected.num} วันที่ {fmtDate(bookDate)} เวลา {form.start}–{form.end} น. ในชื่อ {form.name.trim()}</p>
                <p>เมื่อมาถึงโต๊ะ ต้องกดปุ่ม “ยืนยันการมาถึง” ภายใน {GRACE_MIN} นาทีหลังเวลาเริ่ม (ใช้รหัสนิสิตที่กรอกไว้) ไม่เช่นนั้นการจองจะถูกยกเลิกอัตโนมัติ</p>
                <p>ถ้าใช้งานเสร็จก่อนเวลา หรือไปไม่ได้ กดที่นั่งแล้วกด “ยกเลิก” เพื่อคืนที่นั่งให้คนอื่นได้</p>
                {LINE_ENABLED && form.line === "yes" && <p>เลือกรับแจ้งเตือนผ่าน LINE: หลังจองสำเร็จ ให้ทำตามขั้นตอนเชื่อมต่อ LINE ที่ขึ้นในหน้าต่างถัดไป</p>}
              </div>
            )}

            <button className="btn primary" disabled={busy} onClick={confirmStep ? submitBooking : tryBooking}>
              {busy ? "กำลังบันทึก..." : confirmStep ? "รับทราบ ยืนยันการจอง" : "ยืนยันการจอง"}
            </button>
            {confirmStep ? (
              <button className="btn ghost" onClick={() => setConfirmStep(false)}>กลับไปแก้ไข</button>
            ) : (
              <button className="btn ghost" onClick={closeModal}>ปิด</button>
            )}

            {nextBookingFor(selected.id).length > 0 && (
              <div className="existing-list">
                <div className="h">รายการจองของที่นั่งนี้ ในวันที่ {fmtDate(bookDate)}</div>
                {nextBookingFor(selected.id).map((b) => {
                  const st = startDateOf(b);
                  const dl = deadlineOf(b);
                  const inWindow = !b.confirmed && now >= st && now <= dl;
                  const minsLeft = Math.max(0, Math.ceil((dl - now) / 60000));
                  return (
                    <div className="exist-row" key={b.id}>
                      <div className="exist-row-top">
                        <span>{b.start}–{b.end} · {b.name}{b.note ? ` (${b.note})` : ""}</span>
                        {action?.id !== b.id && (
                          <span className="row-actions">
                            {inWindow && <button className="ok" onClick={() => startAction(b.id, "confirm")}>ยืนยันการมาถึง</button>}
                            <button onClick={() => startAction(b.id, "cancel")}>ยกเลิก</button>
                          </span>
                        )}
                      </div>
                      <div className={`status-line ${b.confirmed ? "ok" : inWindow ? "warn" : ""}`}>
                        {b.confirmed
                          ? "✓ ยืนยันการมาถึงแล้ว"
                          : inWindow
                          ? `รอยืนยัน — เหลือเวลา ${minsLeft} นาที`
                          : now < st
                          ? `ยืนยันได้เมื่อถึงเวลา ${b.start} (ภายใน ${GRACE_MIN} นาที)`
                          : ""}
                      </div>
                      {action?.id === b.id && (
                        <div className="cancel-inline">
                          <input
                            type="text"
                            placeholder={action.type === "cancel" ? "รหัสนิสิตที่ใช้ตอนจอง (หรือรหัสผู้ดูแล)" : "ใส่รหัสนิสิตที่ใช้ตอนจอง"}
                            value={actionCode}
                            onChange={(e) => setActionCode(e.target.value)}
                          />
                          <button
                            className={action.type === "cancel" ? "go" : "ok-go"}
                            onClick={() => (action.type === "cancel" ? doCancel(b) : doConfirm(b))}
                          >
                            {action.type === "cancel" ? "ยืนยันยกเลิก" : "ยืนยันการมาถึง"}
                          </button>
                          <button className="no" onClick={() => { setAction(null); setActionError(""); }}>ปิด</button>
                        </div>
                      )}
                      {action?.id === b.id && actionError && <div className="err" style={{ marginTop: 6 }}>{actionError}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="modal-overlay" onClick={() => setSuccess(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>จองสำเร็จ</h3>
            <div className="sub">{success.label} · {fmtDate(success.date)} · {success.start}–{success.end} น.</div>

            <div className="warn-box" style={{ marginTop: 0 }}>
              <b>อย่าลืมยืนยันการมาถึง</b>
              <p>เมื่อมาถึงโต๊ะ กด “ยืนยันการมาถึง” ภายใน {GRACE_MIN} นาทีหลังเวลาเริ่ม (ใช้รหัสนิสิตที่กรอกไว้) ไม่เช่นนั้นการจองจะถูกยกเลิกอัตโนมัติ</p>
              <p>ถ้าใช้งานเสร็จก่อนเวลา หรือไปไม่ได้ กดที่นั่งแล้วกด “ยกเลิก” เพื่อคืนที่นั่งให้คนอื่นได้</p>
            </div>

            {success.line && (
              <div className="survey-box line-box">
                <b>รับแจ้งเตือนผ่าน LINE: ทำอีก 2 ขั้นตอน</b>
                <p>1) ถ้ายังไม่ได้เพิ่มเพื่อน LINE ของเรา ให้เพิ่มเพื่อนก่อน</p>
                <p>2) ส่งข้อความนี้ในแชต LINE ของเรา (ทำครั้งเดียวต่อเครื่อง ถ้าเคยเชื่อมต่อแล้ว ข้ามได้)</p>
                <div className="line-code">เชื่อมต่อแจ้งเตือน {success.line.code}</div>
                <div className="line-actions">
                  <a className="btn primary linkbtn line-btn" href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer">เพิ่มเพื่อน LINE</a>
                  <button className="btn ghost" onClick={() => copyText(`เชื่อมต่อแจ้งเตือน ${success.line.code}`)}>คัดลอกข้อความ</button>
                </div>
              </div>
            )}
            {success.lineFailed && (
              <div className="err">เปิดการแจ้งเตือนผ่าน LINE ไม่สำเร็จ แต่การจองของคุณสำเร็จแล้ว</div>
            )}

            <div className="survey-box">
              <b>ช่วยประเมินเว็บไซต์ให้เราหน่อย</b>
              <p>ความคิดเห็นของคุณช่วยให้เราพัฒนาระบบจองให้ดีขึ้น ใช้เวลาไม่ถึง 1 นาที</p>
            </div>

            <a className="btn primary linkbtn" href={SURVEY_URL} target="_blank" rel="noopener noreferrer" onClick={() => setSuccess(null)}>
              ทำแบบประเมินเว็บไซต์
            </a>
            <button className="btn ghost" onClick={() => setSuccess(null)}>ไว้ทีหลัง</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
