import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Capability } from 'src/capabilities/models/capability.model';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => [Capability])
  capabilities: Capability[];
}
