import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { QuizType } from '@prisma/client';

registerEnumType(QuizType, {
  name: 'QuizType',
});

@ObjectType()
export class Quiz {
  @Field(() => ID)
  id: number;

  @Field()
  content: string;

  @Field(() => QuizType)
  type: QuizType;

  @Field()
  lessonId: number;
}
