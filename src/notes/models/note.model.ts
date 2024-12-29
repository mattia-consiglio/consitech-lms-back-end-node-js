import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Note {
  @Field(() => ID)
  id: number;

  @Field()
  content: string;

  @Field()
  second: number;

  @Field()
  userId: number;

  @Field()
  lessonId: number;
}
