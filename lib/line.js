import crypto from "node:crypto";

// ตรวจลายเซ็นที่ LINE แนบมากับทุกคำขอ (ป้องกันคนอื่นปลอมคำขอเข้ามา)
export function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(String(signature));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function lineCall(path, token, payload, fetchImpl) {
  const res = await fetchImpl(`https://api.line.me/v2/bot/message/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = new Error(`LINE ${path} failed: ${res.status} ${await res.text().catch(() => "")}`);
    err.status = res.status;
    throw err;
  }
}

// ส่งข้อความหาผู้ใช้โดยตรง (นับโควตาข้อความของแพ็กเกจ LINE OA)
export const linePush = (token, to, text, fetchImpl = fetch) =>
  lineCall("push", token, { to, messages: [{ type: "text", text }] }, fetchImpl);

// ตอบกลับข้อความที่ผู้ใช้เพิ่งส่งมา
export const lineReply = (token, replyToken, text, fetchImpl = fetch) =>
  lineCall("reply", token, { replyToken, messages: [{ type: "text", text }] }, fetchImpl);
