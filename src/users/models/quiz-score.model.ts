import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class QuizScore {
  @Field(() => ID)
  id: number;

  @Field()
  score: number;

  @Field()
  answeredQuestions: string;

  @Field()
  quizId: number;

  @Field()
  userId: number;
}
