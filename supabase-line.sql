-- ==========================================================
-- ตารางสำหรับแจ้งเตือนผ่าน LINE Official Account
-- วางใน Supabase -> SQL Editor แล้วกด Run (รันซ้ำได้ ไม่เสียหาย)
-- ต้องรัน supabase.sql / supabase-migration-add-confirmed.sql มาก่อน
-- ==========================================================

-- การจองที่ผู้จองเลือก "รับแจ้งเตือนผ่าน LINE"
create table if not exists line_links (
  booking_id text primary key references bookings(id) on delete cascade,
  link_code text not null,
  device_token text,
  line_user_id text,
  booker_remind_sent boolean not null default false,
  booker_arrive_sent boolean not null default false,
  admin_remind_sent boolean not null default false,
  admin_arrive_sent boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists line_links_link_code_key on line_links (link_code);

-- เครื่อง + รหัสนิสิต ที่เคยเชื่อมต่อ LINE แล้ว (จองครั้งต่อไปไม่ต้องเชื่อมซ้ำ)
create table if not exists line_devices (
  device_token text not null,
  student_code text not null,
  line_user_id text not null,
  created_at timestamptz not null default now(),
  primary key (device_token, student_code)
);

-- บัญชี LINE ของแอดมินที่รับแจ้งเตือน
create table if not exists line_admins (
  line_user_id text primary key,
  created_at timestamptz not null default now()
);

-- ปิดการเข้าถึงจากหน้าเว็บทั้งหมด (เซิร์ฟเวอร์ใช้ Secret key จึงไม่ถูกบล็อก)
alter table line_links enable row level security;
alter table line_devices enable row level security;
alter table line_admins enable row level security;

-- หน้าเว็บ "เพิ่ม" ได้อย่างเดียว อ่านหรือแก้ไม่ได้ (กันไม่ให้ใครเห็นบัญชี LINE ของผู้อื่น)
drop policy if exists "public insert line_links" on line_links;
create policy "public insert line_links" on line_links for insert with check (true);
