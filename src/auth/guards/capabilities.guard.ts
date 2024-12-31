import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that checks if a user has the required capabilities to access a route
 */
@Injectable()
export class CapabilitiesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Determines if the current user has the required capabilities to access a route
   * @param context - The execution context containing request and user information
   * @returns A promise that resolves to true if the user has the required capabilities, false otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredCapabilities = this.reflector.get<string[]>(
      'capabilities',
      context.getHandler(),
    );

    // If no capabilities are required, allow access
    if (!requiredCapabilities) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    // If user is not authenticated, deny access
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // First check user's direct capabilities
    const userDirectCapabilities = await this.prisma.user
      .findUnique({
        where: { id: user.id },
        select: {
          capabilities: {
            select: { name: true },
          },
        },
      })
      .then((user) => user?.capabilities.map((cap) => cap.name) ?? []);

    // Get role capabilities if user has no direct capabilities
    const roleCapabilities =
      userDirectCapabilities.length > 0
        ? []
        : await this.prisma.role
            .findUnique({
              where: { id: user.roleId },
              select: {
                capabilities: {
                  select: { name: true },
                },
              },
            })
            .then((role) => role?.capabilities.map((cap) => cap.name) ?? []);

    // Combine capabilities (direct capabilities override role capabilities)
    const userCapabilities =
      userDirectCapabilities.length > 0
        ? userDirectCapabilities
        : roleCapabilities;

    // Check each required capability
    const hasRequiredCapabilities = requiredCapabilities.every((capability) => {
      // If capability ends with _self, check if user is accessing their own resource
      if (capability.endsWith('_self')) {
        const args = ctx.getArgs();
        const targetUserId = args.id || args.userId || args.createUserInput?.id;

        // Allow access if user has the non-self version of the capability
        const baseCapability = capability.replace('_self', '');
        if (userCapabilities.includes(baseCapability)) {
          return true;
        }

        // For _self capabilities, check if user is accessing their own resource
        return user.id === targetUserId;
      }

      // For regular capabilities, just check if user has the capability
      return userCapabilities.includes(capability);
    });

    // If the user does not have the required capabilities
    if (!hasRequiredCapabilities) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}
