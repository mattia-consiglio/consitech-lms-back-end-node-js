import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Provider } from '@prisma/client';
import { Role } from 'src/role/models/role.model';

registerEnumType(Provider, {
  name: 'Provider',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  email: string;

  @Field(() => String)
  username: string;

  @Field(() => Provider, { nullable: true })
  provider?: Provider;

  @Field(() => String, { nullable: true })
  providerId?: string;

  @Field(() => Date, { nullable: true })
  emailVerifiedAt?: Date;

  @Field(() => Number)
  roleId: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Role)
  role: Role;
}
