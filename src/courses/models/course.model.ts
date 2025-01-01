import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';
import { User } from 'src/users/models/user.model';
import { Lesson } from 'src/lessons/models/lesson.model';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@ObjectType()
export class Course {
  @Field(() => ID)
  id: number;
  title: string;
  slug: string;
  description?: string;
  @Field(() => PublishStatus)
  publishStatus: PublishStatus;
  order: number;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  seoId?: number;
  teacherId: number;
  lessons: Lesson[];
  teacher: User;
}
