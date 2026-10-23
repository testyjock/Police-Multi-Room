# ตั้งค่าแจ้งเตือนผ่าน LINE Official Account

ระบบนี้ส่งข้อความผ่านบัญชี LINE Official Account ของคุณ (ลิงก์เพิ่มเพื่อน https://lin.ee/olDb1HV)

**ผู้ได้รับข้อความ:** ผู้จองที่เลือก "ใช่ รับแจ้งเตือน" และแอดมินที่ลงทะเบียนไว้ ได้ข้อความ 2 ครั้งต่อการจอง
1. ก่อนถึงคิว 10 นาที
2. ตอนถึงเวลา ให้กดยืนยันการมาถึงที่เว็บ

**ทำไมแค่เพิ่มเพื่อนยังไม่พอ:** LINE ไม่บอกระบบว่าใครคือผู้จองคนไหน ผู้จองจึงต้องส่งรหัสเชื่อมต่อ (ที่ขึ้นบนหน้าเว็บหลังจองสำเร็จ) เข้าแชต LINE ของเรา 1 ครั้ง
ถ้าจองต่อจากเครื่องเดิมด้วยรหัสนิสิตเดิม ไม่ต้องส่งซ้ำ

**ค่าใช้จ่าย/โควตา:** ข้อความที่ระบบส่งเอง (push) นับในโควตาข้อความของแพ็กเกจ LINE OA ของคุณ ส่วนข้อความตอบกลับตอนเชื่อมต่อไม่นับ
การจอง 1 ครั้ง = 2 ข้อความต่อผู้รับ 1 คน (ผู้จอง 1 คน + แอดมิน 2 คน = 6 ข้อความ) ตรวจจำนวนข้อความฟรีของแพ็กเกจคุณได้ที่ LINE Official Account Manager
ถ้าโควตาเต็ม ข้อความจะส่งไม่ได้ (การจองและแถบเตือนบนเว็บยังใช้ได้ตามปกติ)

---

## ขั้นที่ 1 — เปิด Messaging API (ฝั่ง LINE)

1. เข้า LINE Official Account Manager (manager.line.biz) เลือกบัญชีของคุณ
2. ไปที่ **Settings (การตั้งค่า) → Messaging API** แล้วกด **Enable Messaging API** เลือกหรือสร้าง Provider (ชื่ออะไรก็ได้)
3. เข้า LINE Developers Console (developers.line.biz/console) เลือก Provider → เลือก channel ของบัญชีนี้ แล้วคัดลอกเก็บไว้ 2 ค่า
   - แท็บ **Basic settings** → **Channel secret**
   - แท็บ **Messaging API** → เลื่อนลงไป **Channel access token (long-lived)** กด **Issue** แล้วคัดลอก
4. กลับไปที่ OA Manager → **Settings → Response settings**
   - เปิด **Webhooks** เป็น On
   - ปิด **Auto-reply messages** ถ้าไม่ต้องการให้ตอบซ้ำซ้อน (ข้อความต้อนรับ Greeting message ปล่อยไว้ได้)

ค่าทั้ง 2 เป็นความลับ ห้ามส่งให้ใครหรือโพสต์ที่ไหน

## ขั้นที่ 2 — สร้างตารางใน Supabase

1. Supabase → **SQL Editor** → New query
2. เปิดไฟล์ `supabase-line.sql` คัดลอกทั้งหมดไปวาง กด **Run** (ต้องขึ้น Success)
3. ไปที่ **Project Settings → API Keys** คัดลอก **Secret key** (ขึ้นต้นด้วย `sb_secret_`)
   - ใช้ **Secret key** เท่านั้น ไม่ใช่ Publishable key ห้ามเอาไปใส่ในโค้ดหน้าเว็บ

## ขั้นที่ 3 — ใส่ค่าใน Vercel

Vercel → โปรเจกต์ → **Settings → Environment Variables** เพิ่มทีละตัว (ชื่อต้องตรงเป๊ะ)

| ชื่อ | ค่า |
|---|---|
| `SUPABASE_SECRET_KEY` | Secret key จากขั้นที่ 2 |
| `LINE_CHANNEL_SECRET` | Channel secret จากขั้นที่ 1 |
| `LINE_CHANNEL_ACCESS_TOKEN` | Channel access token จากขั้นที่ 1 |
| `CRON_SECRET` | รหัสลับที่คุณตั้งเอง ยาวๆ เช่น `polsci-7391-xk2-secret` (ใช้ในขั้นที่ 5) |
| `ADMIN_PASSWORD` | รหัสผ่านแอดมิน (ตัวเดียวกับ `ADMIN_PASSWORD` ใน `src/App.jsx`) |

จากนั้นไปที่ **Deployments → จุดสามจุดที่อันล่าสุด → Redeploy** เพื่อให้ค่ามีผล
(ต้อง Push โค้ดเวอร์ชันนี้ขึ้น GitHub ก่อน เพื่อให้ระบบสร้างฟังก์ชันในโฟลเดอร์ `api`)

ตรวจว่า Production ไม่ถูกล็อกด้วย Deployment Protection (Settings → Deployment Protection) ไม่เช่นนั้น LINE จะเรียกเข้ามาไม่ได้

## ขั้นที่ 4 — ผูก Webhook กับ LINE

1. LINE Developers Console → channel → แท็บ **Messaging API** → **Webhook settings**
2. ช่อง **Webhook URL** ใส่ `https://โดเมนเว็บของคุณ/api/line-webhook` กด **Update**
3. เปิด **Use webhook** เป็น On
4. กด **Verify** ต้องขึ้น **Success**
   - ถ้าไม่ผ่าน ลองเปิด `https://โดเมนเว็บของคุณ/api/line-webhook` ในเบราว์เซอร์ ต้องเห็นข้อความ "LINE webhook is running" ถ้าไม่เห็น แปลว่ายังไม่ได้ Push/Deploy โฟลเดอร์ `api`

## ขั้นที่ 5 — ตั้งให้ระบบเช็คทุก 1 นาที

**วิธี ก (แนะนำ): ใช้ Supabase**
1. Supabase → **Database → Extensions** เปิด **pg_cron** และ **pg_net**
2. เปิดไฟล์ `supabase-line-cron.sql` แก้ 2 จุด คือ `YOUR-SITE.vercel.app` เป็นโดเมนเว็บของคุณ และ `YOUR_CRON_SECRET` เป็นค่าเดียวกับ `CRON_SECRET`
3. คัดลอกไปวางใน SQL Editor กด **Run**

**วิธี ข: ใช้ cron-job.org (ถ้าวิธี ก ตั้งไม่ได้)**
1. สมัครที่ cron-job.org → Create cronjob
2. URL: `https://โดเมนเว็บของคุณ/api/send-reminders` / ตั้งให้ทำงานทุก 1 นาที
3. ในส่วน Advanced เพิ่ม Header ชื่อ `Authorization` ค่า `Bearer ` ตามด้วย `CRON_SECRET`

ทดสอบด้วยมือ: เปิด `https://โดเมนเว็บของคุณ/api/send-reminders?key=CRON_SECRET` ในเบราว์เซอร์ จะเห็นผลเป็นตัวเลข เช่น `{"checked":0,"planned":0,"sent":0,...}` ถ้าขึ้น `unauthorized` แปลว่า CRON_SECRET ไม่ตรง (อย่าแชร์ลิงก์นี้ เพราะมีรหัสลับอยู่ในลิงก์)

## ขั้นที่ 6 — ลงทะเบียนแอดมินผู้รับแจ้งเตือน

แอดมินแต่ละคนทำดังนี้ (ทำครั้งเดียว)
1. เพิ่มเพื่อนบัญชี LINE Official Account
2. ส่งข้อความ `แอดมิน รหัสผ่านแอดมิน` เช่น `แอดมิน 123456` (เว้นวรรคหนึ่งครั้ง) ระบบจะตอบว่าลงทะเบียนแล้ว
3. ควรลบข้อความนี้ออกจากแชตหลังส่ง เพราะมีรหัสผ่านอยู่
4. ถ้าต้องการเลิกรับ ส่งข้อความ `เลิกเป็นแอดมิน`

(ทางเลือก: ใส่ userId ของแอดมินในตัวแปร `LINE_ADMIN_USER_IDS` ใน Vercel คั่นด้วยเครื่องหมายจุลภาค)

## ขั้นที่ 7 — เปิดตัวเลือกบนหน้าเว็บ

1. เปิดไฟล์ `src/App.jsx` หาบรรทัด `const LINE_ENABLED = false;` เปลี่ยนเป็น `true`
2. Commit + Push ผ่าน GitHub Desktop
3. เปิดเว็บ จองทดสอบ เลือก "ใช่ รับแจ้งเตือน" → เพิ่มเพื่อน → ส่งข้อความรหัสเชื่อมต่อใน LINE → ต้องได้ข้อความตอบกลับ "เชื่อมต่อสำเร็จ"
4. ทดสอบจองคิวที่เริ่มในอีก 12-15 นาที รอดูข้อความ "อีก 10 นาทีถึงคิวของคุณ" และข้อความตอนถึงเวลา

## ปิดระบบแจ้งเตือน

เปลี่ยน `LINE_ENABLED` กลับเป็น `false` แล้ว Push ตัวเลือกจะหายจากหน้าเว็บ และรัน `select cron.unschedule('line-reminders');` ใน Supabase เพื่อหยุดการเช็ค

## ข้อควรทราบ

- ข้อความถึงผู้จองส่งได้เฉพาะคนที่เพิ่มเพื่อนและไม่ได้บล็อกบัญชี
- ข้อความถึงแอดมินมีชื่อผู้จอง
- ระบบใช้เวลาประเทศไทย (UTC+7) ในการคำนวณเวลา
- แจ้งเตือนส่งโดยเช็คทุก 1 นาที ข้อความอาจมาช้าหรือเร็วได้ไม่เกินประมาณ 1 นาที
