import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';

@ObjectType()
export class Lesson {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PublishStatus)
  publishStatus: PublishStatus;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field()
  content: string;

  @Field()
  courseId: number;

  @Field()
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field()
  teacherId: number;

  @Field(() => Number, { nullable: true })
  seoId?: number;
}
