import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { join } from 'node:path';
import { CoursesModule } from './courses/courses.module';
import metadata from './metadata';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      formatError: (formattedError) => {
        if (process.env.NODE_ENV === 'production') {
          return {
            message: formattedError.message,
            code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
            path: formattedError.path || [],
          };
        }

        return formattedError;
      },
      metadata,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
