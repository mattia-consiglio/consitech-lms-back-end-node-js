import { Query, Resolver } from '@nestjs/graphql';
import { Course } from './models/course.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return this.prisma.course.findMany();
  }
}
