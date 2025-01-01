import { InputType, registerEnumType, Field } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@InputType()
export class CreateCourseInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PublishStatus, { nullable: true })
  publishStatus?: PublishStatus;

  @Field(() => Number)
  order: number;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => Number, { nullable: true })
  teacherId?: number;
}
