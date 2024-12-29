import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';

registerEnumType(PublishStatus, {
  name: 'PublishStatus',
});

@ObjectType()
export class Article {
  @Field(() => ID)
  id: string;
  title: string;
  slug: string;
  description?: string;
  publishStatus: PublishStatus;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  displayOrder: number;
  thumbnailImage?: string;
  authorId: number;
  seoId?: number;
  content: string;
}
