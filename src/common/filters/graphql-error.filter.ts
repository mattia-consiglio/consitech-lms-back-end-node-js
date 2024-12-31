import { Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: Error) {
    if (exception instanceof HttpException) {
      const path = exception.stack
        ?.split('\n')[1]
        ?.trim()
        ?.replace(/^at\s+/, '')
        ?.split(' ')[0];

      return new GraphQLError(exception.message, {
        extensions: {
          code: 'UNAUTHORIZED',
          statusCode: exception.getStatus(),
          path,
          stacktrace: null,
        },
      });
    }

    const path = exception.stack
      ?.split('\n')[1]
      ?.trim()
      ?.replace(/^at\s+/, '')
      ?.split(' ')[0];

    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        path,
      },
    });
  }
}
