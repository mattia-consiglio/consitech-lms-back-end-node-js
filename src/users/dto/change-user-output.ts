import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../models/user.model';

@ObjectType()
export class ChangeUserOutput {
  @Field(() => String)
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;
}
