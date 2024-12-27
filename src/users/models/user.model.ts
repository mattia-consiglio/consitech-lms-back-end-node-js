import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role, Provider } from '@prisma/client';

registerEnumType(Role, {
  name: 'Role',
});

registerEnumType(Provider, {
  name: 'Provider',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Provider, { nullable: true })
  provider?: Provider;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
