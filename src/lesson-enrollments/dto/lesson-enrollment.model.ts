import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LessonEnrollment {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  videoProgress?: number;

  @Field()
  quizDone: boolean;

  @Field()
  userId: number;

  @Field()
  lessonId: number;
}
