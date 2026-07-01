const router = require('express').Router();
const prisma = require('../prismaClient');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { upload, s3, fileUrl } = require('../storage');

router.get('/', async (req, res) => {
  try {
    const { teacherId, subjectGroup, activityDate } = req.query;
    const where = {};
    if (teacherId) where.teacherId = Number(teacherId);
    if (subjectGroup) where.teacher = { subjectGroup };
    if (activityDate) {
      const d = new Date(activityDate);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.activityDate = { gte: d, lt: next };
    }
    const reports = await prisma.report.findMany({
      where,
      include: { teacher: true, evidenceFiles: true },
      orderBy: { id: 'desc' },
    });
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: { teacher: true, evidenceFiles: true },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', upload.array('evidenceFiles', 10), async (req, res) => {
  try {
    const { teacherId, gradeLevel, activityDate, totalStudents, absentStudents } = req.body;
    const files = req.files || [];

    const report = await prisma.report.create({
      data: {
        teacherId: Number(teacherId),
        gradeLevel,
        activityDate: new Date(activityDate),
        totalStudents: Number(totalStudents),
        absentStudents: Number(absentStudents),
        evidenceFiles: {
          create: files.map((f) => ({
            fileName: f.originalname,
            filePath: f.key,
            fileUrl: fileUrl(f.key),
          })),
        },
      },
      include: { teacher: true, evidenceFiles: true },
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', upload.array('evidenceFiles', 10), async (req, res) => {
  try {
    const { teacherId, gradeLevel, activityDate, totalStudents, absentStudents } = req.body;
    const files = req.files || [];

    const report = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data: {
        teacherId: Number(teacherId),
        gradeLevel,
        activityDate: new Date(activityDate),
        totalStudents: Number(totalStudents),
        absentStudents: Number(absentStudents),
        ...(files.length > 0 && {
          evidenceFiles: {
            create: files.map((f) => ({
              fileName: f.originalname,
              filePath: f.key,
              fileUrl: fileUrl(f.key),
            })),
          },
        }),
      },
      include: { teacher: true, evidenceFiles: true },
    });
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: { evidenceFiles: true },
    });
    if (report) {
      for (const f of report.evidenceFiles) {
        try {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.MINIO_BUCKET,
            Key: f.filePath,
          }));
        } catch (e) {
          console.error('ลบไฟล์จาก MinIO ไม่ได้:', e.message);
        }
      }
    }
    await prisma.report.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
