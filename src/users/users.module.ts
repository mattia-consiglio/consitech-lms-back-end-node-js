import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersResolver } from './users.resolver';

@Module({
  providers: [UsersResolver, PrismaService],
  exports: [UsersResolver],
})
export class UsersModule {}
