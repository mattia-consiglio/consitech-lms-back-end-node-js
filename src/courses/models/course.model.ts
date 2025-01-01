import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';
import { LessonSimple } from 'src/lessons/models/lesson-simple.model';
import { UserSimple } from 'src/users/models/user-simple.model';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@ObjectType()
export class Course {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PublishStatus)
  publishStatus: PublishStatus;

  @Field(() => Number)
  order: number;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Number, { nullable: true })
  seoId?: number;

  @Field(() => ID)
  teacherId: number;

  @Field(() => [LessonSimple])
  lessons: LessonSimple[];

  @Field(() => UserSimple)
  teacher: UserSimple;
}
