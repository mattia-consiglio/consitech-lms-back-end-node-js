import { PrismaClient, Prisma } from '@prisma/client';

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
    .normalize('NFKD') // Normalize characters by decomposing them
    .toLowerCase() // Convert to lowercase
    .trim() // Remove spaces at start and end
    .replace(/\s+/g, ' ') // Remove multiple spaces
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/[\s_]/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-'); // Remove multiple hyphens
}

/**
 * Generates a unique slug for a specific content
 * @param title - The title to convert to slug
 * @param contentType - The type of content (course, lesson or article)
 * @param id - Optional ID of existing content (to exclude from uniqueness check)
 * @returns A unique slug based on the title
 *
 * @example
 * // For a new course
 * generateUniqueSlug('My Course', ContentType.COURSE)
 * // 'my-course'
 *
 * // If similar slug exists
 * generateUniqueSlug('My Course', ContentType.COURSE)
 * // 'my-course-1'
 */
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
