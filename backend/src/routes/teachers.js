const router = require('express').Router();
const prisma = require('../prismaClient');
const { sendPushNotification } = require('../fcm');

router.get('/subject-groups', async (req, res) => {
  try {
    const groups = await prisma.teacherClub.findMany({
      select: { subjectGroup: true },
      distinct: ['subjectGroup'],
      orderBy: { subjectGroup: 'asc' },
    });
    res.json(groups.map(g => g.subjectGroup));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/clubs', async (req, res) => {
  try {
    const { subjectGroupName } = req.query;
    const where = subjectGroupName ? { subjectGroup: subjectGroupName } : {};
    const clubs = await prisma.teacherClub.findMany({
      where,
      select: { clubName: true },
      distinct: ['clubName'],
      orderBy: { clubName: 'asc' },
    });
    res.json(clubs.map(c => c.clubName));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { subjectGroupName } = req.query;
    const where = subjectGroupName ? { subjectGroup: subjectGroupName } : {};
    const teachers = await prisma.teacherClub.findMany({
      where,
      include: { _count: { select: { reports: true } } },
      orderBy: { firstName: 'asc' },
    });
    res.json(teachers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacherClub.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        reports: {
          include: { evidenceFiles: true },
          orderBy: { activityDate: 'desc' },
        },
      },
    });
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    res.json(teacher);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { prefix, firstName, lastName, subjectGroup, clubName, gradeLevel, totalStudents } = req.body;
    const teacher = await prisma.teacherClub.create({
      data: {
        prefix, firstName, lastName, subjectGroup, clubName,
        gradeLevel: gradeLevel || '',
        totalStudents: Number(totalStudents) || 0,
      },
    });
    res.status(201).json(teacher);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { prefix, firstName, lastName, subjectGroup, clubName, gradeLevel, totalStudents } = req.body;
    const teacher = await prisma.teacherClub.update({
      where: { id: Number(req.params.id) },
      data: {
        prefix, firstName, lastName, subjectGroup, clubName,
        gradeLevel: gradeLevel || '',
        totalStudents: Number(totalStudents) || 0,
      },
    });
    res.json(teacher);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/fcm-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'token required' });
    const teacher = await prisma.teacherClub.update({
      where: { id: Number(req.params.id) },
      data: { fcmToken: token },
    });

    console.log('[FCM] token received:', token?.substring(0, 20));
    if (token) {
      try {
        await sendPushNotification(
          token,
          '✅ ลงทะเบียนการแจ้งเตือนเรียบร้อย',
          `${teacher.prefix}${teacher.firstName} ${teacher.lastName} จะได้รับการแจ้งเตือนชุมนุม "${teacher.clubName}" ทุกวันพุธ 17:00 น. และวันพฤหัส 8:20 น.`
        );
        console.log('[FCM] confirm notification ส่งสำเร็จ');
      } catch (e) {
        console.error('[FCM] ส่ง confirm notification ไม่ได้:', e.message);
      }
    }

    res.json({ success: true, id: teacher.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.teacherClub.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
