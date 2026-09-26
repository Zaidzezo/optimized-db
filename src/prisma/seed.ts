import {
  randEmail,
  randFullName,
  randLines,
  randParagraph,
  randPassword,
  randPhrase,
  randWord
} from '@ngneat/falso';
import { PrismaClient } from '@prisma/client';
import { RegisteredUser } from '../app/routes/auth/registered-user.model';
import { createUser } from '../app/routes/auth/auth.service';
import { addComment, createArticle } from '../app/routes/article/article.service';

const prisma = new PrismaClient();

export const generateUser = async (): Promise<RegisteredUser> =>
  createUser({
    username: randFullName().replace(/ /g, '_') + '_' + Math.random().toString(36).slice(2, 6),
    email: randEmail() + Math.random().toString(36).slice(2, 6),
    password: randPassword(),
    image: 'https://api.realworld.io/images/demo-avatar.png',
    demo: true,
  });

export const generateArticle = async (id: number) =>
  createArticle(
    {
      title: randPhrase() + ' ' + Math.random().toString(36).slice(2, 8),
      description: randParagraph(),
      body: randLines({ length: 10 }).join(' '),
      tagList: randWord({ length: 2 }),
    },
    id,
  );

export const generateComment = async (id: number, slug: string) =>
  addComment(randParagraph(), slug, id);

const main = async () => {
  console.log('Creating users...');
  const users: RegisteredUser[] = [];

  for (let i = 0; i < 100; i++) {
    const user = await generateUser();
    users.push(user);
    if (i % 10 === 0) console.log(`  ${i}/100 users`);
  }
  console.log('✓ 100 users created');

  console.log('Creating articles and comments...');
  for (const user of users) {
    for (let i = 0; i < 50; i++) {
      const article = await generateArticle(user.id);
      await Promise.all(users.slice(0, 10).map(u => generateComment(u.id, article.slug)));
    }
    console.log(`✓ articles done for user ${user.id}`);
  }

  console.log('Done!');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });