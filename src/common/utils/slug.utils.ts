import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns The slugified text
 *
 * @example
 * toSlug('Hello World!') // 'hello-world'
 * toSlug('Perché è così?') // 'perche-e-cosi'
 * toSlug('  Multiple   Spaces  ') // 'multiple-spaces'
 */
export function toSlug(text: string): string {
  return text
    .normalize('NFKD') // Normalizza i caratteri decomponendoli
    .toLowerCase() // Converte in minuscolo
    .trim() // Rimuove spazi all'inizio e alla fine
    .replace(/\s+/g, ' ') // Rimuove spazi multipli
    .replace(/[^\w\s-]/g, '') // Rimuove caratteri speciali
    .replace(/[\s_]/g, '-') // Sostituisce spazi e underscore con trattini
    .replace(/-+/g, '-'); // Rimuove trattini multipli
}

export enum ContentType {
  COURSE = 'course',
  LESSON = 'lesson',
  ARTICLE = 'article',
}

type ContentFindFirstArgs =
  | Prisma.CourseFindFirstArgs
  | Prisma.LessonFindFirstArgs
  | Prisma.ArticleFindFirstArgs;

type PrismaModel = {
  findFirst: (
    args: Prisma.SelectSubset<ContentFindFirstArgs, ContentFindFirstArgs>,
  ) => Promise<{ slug: string } | null>;
};

export async function generateUniqueSlug(
  title: string,
  contentType: ContentType,
  id?: number,
): Promise<string> {
  const slug = toSlug(title);
  const model = prisma[contentType] as unknown as PrismaModel;

  const existingSlug = await model.findFirst({
    select: { slug: true },
    where: { slug: { startsWith: slug }, id: { not: id } },
    orderBy: { slug: 'desc' },
  });

  if (!existingSlug) {
    return slug;
  }

  const lastIncrement = existingSlug.slug.split('-').pop();
  const increment =
    lastIncrement && !Number.isNaN(Number(lastIncrement))
      ? Number(lastIncrement) + 1
      : 1;

  return `${slug}-${increment}`;
}
