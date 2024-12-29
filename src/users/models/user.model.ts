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
  email: string;
  username: string;
  @Field(() => Provider, { nullable: true })
  provider?: Provider;
  providerId?: string;
  emailVerifiedAt?: Date;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
}
