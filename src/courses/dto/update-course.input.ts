import { Field, InputType } from '@nestjs/graphql';
import { PublishStatus } from '@prisma/client';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

@InputType()
export class UpdateCourseInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PublishStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  order?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  teacherId?: number;
}
