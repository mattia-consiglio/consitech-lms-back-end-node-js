import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Provider } from '@prisma/client';

registerEnumType(Provider, {
  name: 'Provider',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;
  email: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  provider?: Provider;
  providerId?: string;
  emailVerifiedAt?: Date;
  roleId: number;
}
