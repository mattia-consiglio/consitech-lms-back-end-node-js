import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from './models/user.model';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  UseGuards,
  UnauthorizedException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CapabilitiesGuard } from 'src/auth/guards/capabilities.guard';
import { Capabilities } from 'src/auth/decorators/capabilities.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateUserInputPublic } from './dto/create-user-input-public';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ChangeUserOutput } from './dto/change-user-output';
import { Role } from 'src/role/models/role.model';

dotenv.config();

@Resolver(() => User)
export class UsersResolver {
  private readonly saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS);
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async users() {
    return this.prisma.user.findMany();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Query(() => User)
  async user(@Args('id') id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async currentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Public()
  @Mutation(() => User, {
    description: 'Register a new user account with Student role',
  })
  async register(
    @Args('createUserInput', {
      description: 'Input data for creating a new user account',
    })
    createUserInput: CreateUserInputPublic,
  ) {
    const hashedPassword = await bcrypt.hash(
      createUserInput.password,
      this.saltRounds,
    );
    return this.prisma.user.create({
      data: {
        email: createUserInput.email,
        password: hashedPassword,
        username: createUserInput.username || createUserInput.email,
        role: { connect: { name: 'Student' } },
      },
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('create_users')
  @Mutation(() => User, {
    description: 'Create a new user account (requires create_users capability)',
  })
  async createUser(
    @Args('createUserInput', {
      description: 'Input data for creating a new user with specified role',
    })
    createUserInput: CreateUserInput,
  ) {
    const hashedPassword = await bcrypt.hash(
      createUserInput.password,
      this.saltRounds,
    );
    return this.prisma.user.create({
      data: {
        email: createUserInput.email,
        password: hashedPassword,
        username: createUserInput.username || createUserInput.email,
        role: { connect: { name: createUserInput.roleName || 'Student' } },
      },
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('edit_users')
  @Mutation(() => ChangeUserOutput, {
    description: 'Update an existing user account',
  })
  async updateUser(
    @Args('id', { description: 'ID of the user to update' }) id: number,
    @Args('updateUserInput', { description: 'New user data' })
    updateUserInput: UpdateUserInput,
  ) {
    const data = { ...updateUserInput };
    if (updateUserInput.password) {
      data.password = await bcrypt.hash(
        updateUserInput.password,
        this.saltRounds,
      );
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return {
      message: 'User updated successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('delete_users')
  @Mutation(() => ChangeUserOutput, {
    description: 'Delete a user account',
  })
  async deleteUser(
    @Args('id', { description: 'ID of the user to delete' }) id: number,
  ) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return {
      message: 'User deleted successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('delete_user_self')
  @Mutation(() => ChangeUserOutput, {
    description: 'Delete own user account',
  })
  async deleteOwnUser(@CurrentUser() user: User) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      return await this.deleteUser(user.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Unable to delete user');
    }
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('update_user_self')
  @Mutation(() => ChangeUserOutput, {
    description: 'Update own user account',
  })
  async updateOwnUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.updateUser(user.id, updateUserInput);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Unable to update user');
    }
  }

  @ResolveField(() => Role)
  async role(@Parent() user: User) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: { include: { capabilities: true } } },
    });
  }
}
