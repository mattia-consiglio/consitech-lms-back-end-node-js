import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@ObjectType()
export class Article {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PublishStatus)
  publishStatus: PublishStatus;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Number)
  displayOrder: number;

  @Field(() => String, { nullable: true })
  thumbnailImage?: string;

  @Field(() => Number)
  authorId: number;

  @Field(() => Number, { nullable: true })
  seoId?: number;

  @Field(() => String)
  content: string;
}
