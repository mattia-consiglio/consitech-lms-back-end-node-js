import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Capability {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
