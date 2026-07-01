const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/settings/notify-enabled
router.get('/notify-enabled', async (req, res) => {
  const setting = await prisma.setting.findUnique({ where: { key: 'notifyEnabled' } });
  res.json({ enabled: setting ? setting.value === 'true' : true });
});

// POST /api/settings/notify-enabled  { enabled: true/false }
router.post('/notify-enabled', async (req, res) => {
  const { enabled } = req.body;
  await prisma.setting.upsert({
    where: { key: 'notifyEnabled' },
    update: { value: String(enabled) },
    create: { key: 'notifyEnabled', value: String(enabled) },
  });
  res.json({ enabled });
});


// POST /api/settings/server-down  — frontend เรียกเมื่อตรวจพบ health check ล้มเหลว
// ใช้เพื่อ set flag ว่า server เคยล่ม เพื่อให้ cron แจ้งเตือนตอน server กลับมา
router.post('/server-down', async (req, res) => {
  try {
    await prisma.setting.upsert({
      where: { key: 'serverWasDown' },
      update: { value: 'true' },
      create: { key: 'serverWasDown', value: 'true' },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'db error' });
  }
});

module.exports = router;
