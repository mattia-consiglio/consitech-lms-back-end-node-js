import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';
import { Seo } from 'src/seos/models/seo.model';
import { UserSimple } from 'src/users/models/user-simple.model';

@ObjectType()
export class LessonSimple {
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

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String)
  content: string;

  @Field(() => Number)
  courseId: number;

  @Field(() => Number)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Number)
  teacherId: number;

  @Field(() => UserSimple)
  teacher: UserSimple;

  @Field(() => Number, { nullable: true })
  seoId?: number;

  @Field(() => Seo, { nullable: true })
  seo?: Seo;
}
