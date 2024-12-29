import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Seo {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  ldJson: string;
}
