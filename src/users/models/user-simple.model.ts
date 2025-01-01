import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserSimple {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  email: string;

  @Field(() => String)
  username: string;
}
