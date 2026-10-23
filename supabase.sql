-- ใช้ไฟล์นี้เฉพาะกรณีสร้างฐานข้อมูลใหม่ตั้งแต่ต้น (ยังไม่เคยมีตาราง bookings)
-- ถ้าคุณมีตาราง bookings อยู่แล้ว ให้ใช้ supabase-migration-add-code.sql แทน

create table if not exists bookings (
  id text primary key,
  item_id text not null,
  item_label text not null,
  item_type text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  name text not null,
  code text not null,
  confirmed boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

drop policy if exists "public read bookings" on bookings;
drop policy if exists "public insert bookings" on bookings;
drop policy if exists "public delete bookings" on bookings;
drop policy if exists "public update bookings" on bookings;

create policy "public read bookings" on bookings for select using (true);
create policy "public insert bookings" on bookings for insert with check (true);
create policy "public delete bookings" on bookings for delete using (true);
create policy "public update bookings" on bookings for update using (true) with check (true);

alter publication supabase_realtime add table bookings;
