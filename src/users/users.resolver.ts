import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// biome-ignore lint/style/useImportType: <explanation>
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { CurrentUser } from './current-user.decorator';
import { User } from './models/user.model';
dotenv.config();

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [User])
  async users(): Promise<Partial<User>[]> {
    return this.prisma.user.findMany();
  }

  @Query(() => User)
  async user(@Args('id') id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    // Check if the user is logged in and has the capability to create users
    const userCapabilities = (
      await this.prisma.role.findUnique({
        where: { id: user.roleId },
        select: {
          capabilities: {
            select: {
              name: true,
            },
          },
        },
      })
    ).capabilities.map((capability) => capability.name);

    if (!userCapabilities.includes('create_users')) {
      throw new Error('You do not have permission to create users.');
    }

    const hashedPassword = await bcrypt.hash(
      createUserInput.password,
      process.env.BCRYPT_SALT_ROUNDS,
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

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: number,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    const data = { ...updateUserInput };
    if (updateUserInput.password) {
      data.password = await bcrypt.hash(
        updateUserInput.password,
        process.env.BCRYPT_SALT_ROUNDS,
      );
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  @Mutation(() => User)
  async deleteUser(@Args('id') id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
