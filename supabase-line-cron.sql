-- ==========================================================
-- ตั้งให้ Supabase เรียกระบบแจ้งเตือนทุก 1 นาที
-- 1) แก้ YOUR-SITE.vercel.app เป็นโดเมนเว็บของคุณ
-- 2) แก้ YOUR_CRON_SECRET เป็นรหัสลับเดียวกับที่ตั้งเป็น CRON_SECRET ใน Vercel
-- 3) วางใน SQL Editor แล้วกด Run
-- ==========================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'line-reminders',
  '* * * * *',
  $job$
    select net.http_get(
      url := 'https://YOUR-SITE.vercel.app/api/send-reminders',
      headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
    );
  $job$
);

-- ถ้าต้องการหยุดการแจ้งเตือนภายหลัง ให้รัน:
-- select cron.unschedule('line-reminders');
