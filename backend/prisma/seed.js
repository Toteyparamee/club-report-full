const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = [
    'ภาษาไทย',
    'คณิตศาสตร์',
    'วิทยาศาสตร์และเทคโนโลยี',
    'สังคมศึกษา ศาสนาและวัฒนธรรม',
    'สุขศึกษาและพลศึกษา',
    'ศิลปะ',
    'การงานอาชีพ',
    'ภาษาต่างประเทศ',
  ];

  for (const name of groups) {
    await prisma.subjectGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded subject groups');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
