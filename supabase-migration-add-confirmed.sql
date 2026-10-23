-- ==========================================================
-- อัปเดตฐานข้อมูลเดิม: เพิ่มระบบ "ยืนยันการมาถึง"
-- วางใน Supabase -> SQL Editor แล้วกด Run
-- ต้องรันก่อนอัปเดตไฟล์ App.jsx ขึ้น GitHub (รันซ้ำได้ ไม่เสียหาย)
-- ==========================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'confirmed'
  ) then
    -- แถวเดิมทั้งหมดถือว่า "ยืนยันแล้ว" (จะได้ไม่ถูกลบอัตโนมัติ)
    alter table bookings add column confirmed boolean not null default true;
    -- การจองใหม่ตั้งแต่นี้ไปเริ่มที่ "ยังไม่ยืนยัน"
    alter table bookings alter column confirmed set default false;
  end if;
end $$;

-- อนุญาตให้หน้าเว็บอัปเดตสถานะยืนยันได้
drop policy if exists "public update bookings" on bookings;
create policy "public update bookings" on bookings for update using (true) with check (true);
