import { Module } from '@nestjs/common';
import { CoursesResolver } from './courses.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CoursesResolver, PrismaService],
})
export class CoursesModule {}
