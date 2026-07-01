const router = require('express').Router();
const prisma = require('../prismaClient');

router.get('/', async (req, res) => {
  try {
    const groups = await prisma.subjectGroup.findMany({ orderBy: { name: 'asc' } });
    res.json(groups);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const group = await prisma.subjectGroup.create({ data: { name } });
    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.subjectGroup.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
