const cron = require('node-cron');
const prisma = require('./prismaClient');
const { sendPushNotification } = require('./fcm');

async function checkAndNotifyRecovery() {
  try {
    const flag = await prisma.setting.findUnique({ where: { key: 'serverWasDown' } });
    if (!flag || flag.value !== 'true') return;

    await prisma.setting.update({ where: { key: 'serverWasDown' }, data: { value: 'false' } });

    console.log('[Recovery] ตรวจพบว่า server เคยล่ม กำลังแจ้งครู...');
    await notifyServerRecovered();
  } catch (e) {
    console.error('[Recovery] เกิดข้อผิดพลาด:', e.message);
  }
}

async function notifyServerRecovered() {
  const teachers = await prisma.teacherClub.findMany({
    where: { fcmToken: { not: null }, AND: { fcmToken: { not: '' } } },
  });

  for (const teacher of teachers) {
    try {
      await sendPushNotification(
        teacher.fcmToken,
        '✅ ระบบกลับมาแล้ว',
        `${teacher.prefix}${teacher.firstName} ${teacher.lastName} สามารถกรอกรายงานชุมนุม "${teacher.clubName}" ได้แล้วครับ`
      );
    } catch (e) {
      console.error(`[Recovery] ส่งแจ้งเตือนไม่ได้ teacherId=${teacher.id}:`, e.message);
    }
  }

  console.log(`[Recovery] แจ้งครู ${teachers.length} คนว่า server กลับมาแล้ว`);
}

async function notifyUnreported() {
  const setting = await prisma.setting.findUnique({ where: { key: 'notifyEnabled' } });
  if (setting && setting.value === 'false') {
    console.log('[Cron] การแจ้งเตือนถูกปิดอยู่ ข้ามการแจ้งเตือน');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const teachers = await prisma.teacherClub.findMany({
    where: {
      AND: [
        { fcmToken: { not: null } },
        { fcmToken: { not: '' } },
      ],
      NOT: {
        reports: {
          some: {
            activityDate: { gte: today, lt: tomorrow },
          },
        },
      },
    },
  });

  for (const teacher of teachers) {
    try {
      await sendPushNotification(
        teacher.fcmToken,
        '📋 แจ้งเตือนรายงานชุมนุม',
        `${teacher.prefix}${teacher.firstName} ${teacher.lastName} ยังไม่ได้กรอกรายงานชุมนุม "${teacher.clubName}" วันนี้ครับ`
      );
    } catch (e) {
      console.error(`ส่งแจ้งเตือนไม่ได้ teacherId=${teacher.id}:`, e.message);
    }
  }

  console.log(`[Cron] แจ้งเตือน ${teachers.length} คน`);
}

function startCron() {
  // วันพุธ (3): 17:00
  cron.schedule('0 17 * * 3', notifyUnreported, { timezone: 'Asia/Bangkok' });

  // วันพุธ (3): 19:00
  cron.schedule('0 19 * * 3', notifyUnreported, { timezone: 'Asia/Bangkok' });

  // วันพฤหัส (4): 8:20
  cron.schedule('20 8 * * 4', notifyUnreported, { timezone: 'Asia/Bangkok' });

  checkAndNotifyRecovery();

  console.log('[Cron] ตั้งเวลาแจ้งเตือนเรียบร้อย');
}

module.exports = { startCron, notifyUnreported };
