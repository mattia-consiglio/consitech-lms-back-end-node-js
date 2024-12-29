import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
/**
 * Guard that implements JWT authentication for GraphQL endpoints
 * @extends {AuthGuard('jwt')}
 */
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Extracts the request object from the GraphQL execution context
   * @param {ExecutionContext} context - The execution context
   * @returns {Request} The request object from the GraphQL context
   */
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
