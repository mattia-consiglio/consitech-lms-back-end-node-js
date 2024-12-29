import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Determines if the current user has the required roles to access a route
   * @param context - The execution context containing request and user information
   * @returns A promise that resolves to true if the user has the required role, false otherwise
   * @throws {UnauthorizedException} If the user is not authenticated
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the required roles for the current route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the user's role from the request context (GraphQL)
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    // If the user is not authenticated, deny access
    if (!user) {
      return false;
    }

    // Get the user's role from the database
    const userRole = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        capabilities: true,
      },
    });

    // If the user's role is not found, deny access
    if (!userRole) {
      return false;
    }

    // Check if the user's role matches one of the required roles
    return requiredRoles.some((role) =>
      userRole.name.toLowerCase().includes(role.toLowerCase()),
    );
  }
}
