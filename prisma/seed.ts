import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Check and create capabilities
  const capabilities = [
    'create_users',
    'edit_users',
    'delete_users',
    'delete_user_self',
    'edit_user_self',
    'create_courses',
    'edit_courses',
    'edit_courses_self',
    'delete_courses',
    'delete_courses_self',
    'create_lessons',
    'edit_lessons',
    'edit_lessons_self',
    'delete_lessons',
    'delete_lessons_self',
    'create_quizzes',
    'edit_quizzes',
    'edit_quizzes_self',
    'delete_quizzes',
    'delete_quizzes_self',
    'create_questions',
    'edit_questions',
    'edit_questions_self',
    'delete_questions',
    'delete_questions_self',
    'create_answers',
    'edit_answers',
    'edit_answers_self',
    'delete_answers',
    'delete_answers_self',
  ];

  for (const name of capabilities) {
    await prisma.capability.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  // Check and create roles
  const roles = [
    {
      name: 'Admin',
      capabilities: [
        'create_users',
        'edit_users',
        'delete_users',
        'edit_courses',
        'delete_courses',
        'create_lessons',
        'edit_lessons',
        'delete_lessons',
        'create_quizzes',
        'edit_quizzes',
        'delete_quizzes',
        'create_questions',
        'edit_questions',
        'delete_questions',
        'create_answers',
        'edit_answers',
        'delete_answers',
      ],
    },
    {
      name: 'Student',
      capabilities: ['edit_user_self', 'delete_user_self'],
    },
    {
      name: 'Teacher',
      capabilities: [
        'edit_user_self',
        'delete_user_self',
        'create_courses',
        'edit_courses_self',
        'delete_courses_self',
        'create_lessons',
        'edit_lessons_self',
        'delete_lessons_self',
        'create_quizzes',
        'edit_quizzes_self',
        'delete_quizzes_self',
        'create_questions',
        'edit_questions_self',
        'delete_questions_self',
        'create_answers',
        'edit_answers_self',
        'delete_answers_self',
      ],
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: {
        name: role.name,
        capabilities: {
          connect: role.capabilities.map((name) => ({ name })),
        },
      },
      update: {},
    });
  }

  console.log('BCRYPT_SALT_ROUNDS:', process.env.BCRYPT_SALT_ROUNDS);

  // Check and create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    Number.parseInt(process.env.BCRYPT_SALT_ROUNDS),
  );
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    create: {
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      role: { connect: { name: 'Admin' } },
    },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
