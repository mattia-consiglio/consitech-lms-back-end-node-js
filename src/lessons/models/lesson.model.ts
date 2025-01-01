import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';
import { Seo } from 'src/seos/models/seo.model';
import { User } from 'src/users/models/user.model';

@ObjectType()
export class Lesson {
  @Field(() => ID)
  id: number;
  title: string;
  slug: string;
  description?: string;
  @Field(() => PublishStatus)
  publishStatus: PublishStatus;
  thumbnail?: string;
  content: string;
  courseId: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  teacherId: number;
  teacher: User;
  seoId?: number;
  seo?: Seo;
}
