const router = require('express').Router();
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { replyMessage } = require('../line');

// state เก็บชั่วคราว: userId -> step
const sessions = {};

function verifySignature(rawBody, signature) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const hash = crypto.createHmac('SHA256', secret).update(rawBody).digest('base64');
  return hash === signature;
}

router.post('/', async (req, res) => {
  const signature = req.headers['x-line-signature'];
  if (!verifySignature(req.rawBody, signature)) {
    return res.status(403).send('Invalid signature');
  }

  const events = req.body.events || [];
  for (const event of events) {
    const userId = event.source?.userId;
    if (!userId) continue;

    if (event.type === 'follow') {
      sessions[userId] = { step: 'ask_name' };
      await replyMessage(event.replyToken,
        'สวัสดีครับ! 👋\nระบบรายงานกิจกรรมชุมนุม\n\nกรุณาพิมพ์ ชื่อ-นามสกุล ของท่านเพื่อลงทะเบียน\nเช่น: สมชาย ใจดี'
      );
    }

    if (event.type === 'message' && event.message?.type === 'text') {
      const text = event.message.text.trim();
      const session = sessions[userId];

      if (!session) {
        await replyMessage(event.replyToken, 'พิมพ์ ชื่อ-นามสกุล เพื่อลงทะเบียนครับ');
        sessions[userId] = { step: 'ask_name' };
        continue;
      }

      if (session.step === 'ask_name') {
        const parts = text.split(' ').filter(Boolean);
        if (parts.length < 2) {
          await replyMessage(event.replyToken, 'กรุณาพิมพ์ ชื่อ และ นามสกุล คั่นด้วยเว้นวรรค\nเช่น: สมชาย ใจดี');
          continue;
        }
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');

        // ค้นหาครูในระบบ
        const teacher = await prisma.teacherClub.findFirst({
          where: { firstName, lastName },
        });

        if (!teacher) {
          await replyMessage(event.replyToken,
            `ไม่พบชื่อ "${firstName} ${lastName}" ในระบบครับ\nกรุณาตรวจสอบชื่อ-นามสกุลให้ถูกต้องแล้วพิมพ์ใหม่อีกครั้ง`
          );
          continue;
        }

        if (teacher.lineUserId && teacher.lineUserId !== userId) {
          await replyMessage(event.replyToken, 'ชื่อนี้ลงทะเบียนแล้วครับ');
          delete sessions[userId];
          continue;
        }

        await prisma.teacherClub.update({
          where: { id: teacher.id },
          data: { lineUserId: userId },
        });

        delete sessions[userId];
        await replyMessage(event.replyToken,
          `✅ ลงทะเบียนสำเร็จครับ!\n${teacher.prefix}${teacher.firstName} ${teacher.lastName}\nชุมนุม: ${teacher.clubName}\n\nท่านจะได้รับการแจ้งเตือนผ่าน Line นี้ทุกวันพุธครับ`
        );
      }
    }
  }

  res.sendStatus(200);
});

module.exports = router;
