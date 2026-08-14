// Vercel Serverless Function - 방문예약 알림을 텔레그램으로 전송
export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, phone, date, time } = req.body || {};

  if (!name || !phone || !date || !time) {
    return res.status(400).json({ ok: false, error: '필수 항목 누락' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false, error: '텔레그램 설정 누락' });
  }

  // 텔레그램 메시지 구성
  const message = [
    '📋 *방문예약 신청 알림*',
    '━━━━━━━━━━━━━━',
    `👤 성명: ${name}`,
    `📞 연락처: ${phone}`,
    `📅 방문 예정일: ${date}`,
    `🕐 방문 시간: ${time}`,
    '━━━━━━━━━━━━━━',
    `⏰ 신청 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return res.status(500).json({ ok: false, error: '텔레그램 전송 실패', detail: tgData });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
