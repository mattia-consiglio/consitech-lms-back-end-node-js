import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CourseEnrollment {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field()
  userId: number;

  @Field()
  courseId: number;
}
